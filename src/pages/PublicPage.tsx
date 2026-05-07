import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, LogOut, ChevronRight, MessageCircle, X } from 'lucide-react';
import { Category, Product } from '../types';
import { useNavigate } from 'react-router-dom';
import Plasma from '../components/Plasma';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db, PRODUCTS_COLLECTION, CONFIG_COLLECTION } from '../lib/firebase';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';

const THEMES = {
  [Category.VETEMENT]: { 
    bg: 'bg-[#fce4ec]', 
    darkBg: 'bg-[#2b1b20]',
    color: 'text-rose-900', 
    darkColor: 'text-rose-100',
    accent: 'bg-rose-500', 
    plasma: '#ff6b35' 
  },
  [Category.PANTALON]: { 
    bg: 'bg-[#ffecb3]', 
    darkBg: 'bg-[#241e11]',
    color: 'text-amber-900', 
    darkColor: 'text-amber-100',
    accent: 'bg-amber-500', 
    plasma: '#ffa726' 
  },
  [Category.CHAUSSURE]: { 
    bg: 'bg-[#c8e6c9]', 
    darkBg: 'bg-[#152015]',
    color: 'text-emerald-900', 
    darkColor: 'text-emerald-100',
    accent: 'bg-emerald-500', 
    plasma: '#66bb6a' 
  },
  [Category.ACCESSOIRE]: { 
    bg: 'bg-[#e3f2fd]', 
    darkBg: 'bg-[#121a22]',
    color: 'text-blue-900', 
    darkColor: 'text-blue-100',
    accent: 'bg-blue-500', 
    plasma: '#42a5f5' 
  }
};

export default function PublicPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [activeCat, setActiveCat] = useState<Category>(Category.VETEMENT);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync products from Firestore
    const q = query(collection(db, PRODUCTS_COLLECTION));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const pList: Product[] = [];
      snapshot.forEach((doc) => {
        pList.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(pList);
    });

    // Sync WhatsApp config
    const configRef = doc(db, CONFIG_COLLECTION, 'whatsapp');
    const unsubscribeConfig = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setWhatsappLink(doc.data().link);
      }
    });

    const interval = setInterval(() => {
      setSlideIdx(prev => prev + 1);
    }, 7000);

    return () => {
      unsubscribeProducts();
      unsubscribeConfig();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (navRef.current) {
      const activeButton = navRef.current.querySelector('[data-active="true"]');
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeCat]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [cart, setCart] = useState<Product[]>([]);
  const [showWarning, setShowWarning] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const heroImage = useMemo(() => {
    if (products.length === 0) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop';
    return products[slideIdx % products.length].imageUrl;
  }, [products, slideIdx]);

  const filteredProducts = products.filter(p => p.category === activeCat);

  const buyWithWhatsapp = (productId: string) => {
    setShowWarning(productId);
  };

  const confirmPurchase = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const waLink = whatsappLink || 'https://wa.me/33600000000';
    const message = `Bonjour Sdress, je souhaite acheter l'article: ${product?.name} (${product?.newPrice} €).`;
    window.open(`${waLink}?text=${encodeURIComponent(message)}`, '_blank');
    setShowWarning(null);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('isUser');
    navigate('/login');
  };

  const currentTheme = THEMES[activeCat];

  return (
    <div className={`min-h-screen ${isDarkMode ? currentTheme.darkBg : currentTheme.bg} transition-colors duration-1000 pb-20`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 md:py-6 flex justify-between items-center pointer-events-none gap-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto flex items-center gap-2 md:gap-6 shrink-0"
        >
          <span className={`text-xl md:text-2xl font-black italic tracking-tighter ${isDarkMode ? currentTheme.darkColor : currentTheme.color}`}>Sdress</span>
          <button onClick={logout} className={`opacity-30 hover:opacity-100 transition-opacity ${isDarkMode ? 'text-white' : 'text-black'}`}><LogOut size={16} /></button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          ref={navRef}
          className={`pointer-events-auto flex-1 flex gap-1 p-1 backdrop-blur-xl rounded-full border shadow-xl overflow-x-auto no-scrollbar min-w-0 max-w-[calc(100vw-160px)] sm:max-w-none justify-start sm:justify-center scroll-smooth ${
            isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/20 border-white/20'
          }`}
        >
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              data-active={activeCat === cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 relative ${
                activeCat === cat 
                  ? (isDarkMode ? 'text-black' : 'text-black') 
                  : (isDarkMode ? 'text-white/40 hover:text-white/60' : 'text-black/40 hover:text-black/60')
              }`}
            >
              {activeCat === cat && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto flex items-center gap-2 md:gap-4 shrink-0"
        >
          {/* Dark Mode Toggle Switch */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-9 md:w-12 h-5 md:h-6 rounded-full relative flex items-center transition-colors p-1 ${
              isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-black/5 border border-black/5'
            }`}
          >
            <motion.div 
              animate={{ x: isDarkMode ? (window.innerWidth < 768 ? 16 : 24) : 0 }}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${isDarkMode ? 'bg-white shadow-[0_0_8px_white]' : 'bg-black'}`}
            />
          </button>

          <div className={`relative glass-panel p-2 md:p-3 ${isDarkMode ? 'bg-white/5 border-white/10' : ''}`}>
             <ShoppingCart size={16} className={isDarkMode ? currentTheme.darkColor : currentTheme.color} />
             {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>}
          </div>
        </motion.div>
      </nav>

      {/* Hero Frame */}
      <section className="h-screen w-full relative overflow-hidden flex items-center px-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIdx}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 z-0"
          >
            <div className={`absolute inset-0 z-10 transition-colors duration-1000 ${isDarkMode ? 'bg-black/40' : 'bg-black/20'}`} />
            <img src={heroImage} className="w-full h-full object-cover" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 max-w-4xl py-20">
          <motion.p 
             key={`sub-${slideIdx}`}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.4em] md:tracking-[0.6em] mb-4 drop-shadow-md"
          >
            Spring Summer 2026
          </motion.p>
          <motion.h1 
             key={`title-${slideIdx}`}
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-[18vw] md:text-[12vw] leading-[0.8] font-black italic uppercase text-white tracking-tighter drop-shadow-2xl"
          >
            {products.length > 0 ? products[slideIdx % products.length].name : 'Sdress'}
          </motion.h1>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-30">
          <motion.div 
            key={slideIdx}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 7, ease: "linear" }}
            className="h-full bg-white shadow-[0_0_10px_white]"
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="relative px-6 md:px-12 py-20 md:py-32 overflow-hidden">
        {/* Plasma Background - Increased visibility */}
        <div className="absolute inset-0 z-0 opacity-70">
          <Plasma 
            color={currentTheme.plasma}
            speed={0.6}
            direction="forward"
            scale={1.1}
            opacity={0.9}
            mouseInteractive={true}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 md:mb-20 gap-4">
            <h2 className={`text-4xl md:text-6xl font-black italic uppercase tracking-tighter ${isDarkMode ? currentTheme.darkColor : currentTheme.color}`}>
              {activeCat}
            </h2>
            <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-30 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Collection 001 — Stock limité
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className={`text-center py-20 md:py-40 glass-panel ${isDarkMode ? 'bg-white/5 border-white/10' : ''}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>
                Arrivage prochainement
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onBuy={() => buyWithWhatsapp(product.id!)}
                  theme={currentTheme}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${isDarkMode ? 'bg-neutral-900 border border-white/10' : 'bg-white'} rounded-[40px] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
              <button onClick={() => setShowWarning(null)} className={`absolute top-6 right-6 transition-colors ${isDarkMode ? 'text-white/10 hover:text-white' : 'text-black/10 hover:text-black'}`}>
                <X size={20} />
              </button>

              <div className="text-center">
                 <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="text-emerald-500" size={32} />
                 </div>
                 <h3 className={`text-xl font-black italic uppercase mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Redirection WhatsApp</h3>
                 <p className={`text-xs font-bold leading-relaxed mb-8 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Vous allez être redirigé vers l'espace de vente WhatsApp de l'administrateur pour finaliser votre commande en direct.
                 </p>
                 <div className="space-y-3">
                    <button 
                      onClick={() => confirmPurchase(showWarning)}
                      className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                    >
                      Poursuivre mon achat
                    </button>
                    <button 
                      onClick={() => setShowWarning(null)}
                      className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-colors ${
                        isDarkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      Annuler
                    </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ProductCard: React.FC<{ product: Product, onBuy: () => void, theme: any, isDarkMode: boolean }> = ({ product, onBuy, theme, isDarkMode }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className={`aspect-[4/5] backdrop-blur-sm rounded-[40px] overflow-hidden border mb-6 relative group transition-colors duration-1000 ${
        isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/20 border-white/30'
      }`}>
        <img 
          src={product.imageUrl} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-[2s] ease-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Chips */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {product.isPromotion && <span className="bg-black text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">Promotion</span>}
          {product.isLiquidation && <span className="bg-rose-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">Liquidation</span>}
        </div>
      </div>

      <div className="px-4">
        <h4 className={`text-xl font-black italic uppercase tracking-tighter mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-black/80'}`}>{product.name}</h4>
        <div className="flex items-center gap-4 mb-6">
          <span className={`text-lg font-black transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{product.newPrice} €</span>
          {product.initialPrice > 0 && <span className="text-sm opacity-30 line-through font-bold text-neutral-500">{product.initialPrice} €</span>}
        </div>
        
        <button 
          onClick={onBuy}
          className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
            theme.accent
          } text-white hover:scale-105 active:scale-95 shadow-xl shadow-black/5`}
        >
          Commander <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
