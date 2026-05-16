import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, LogOut, Package, Image as ImageIcon, Link as LinkIcon, DollarSign, Tag, Archive, ExternalLink, BarChart3, X, Menu } from 'lucide-react';
import { Category, Product } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db, PRODUCTS_COLLECTION, CONFIG_COLLECTION, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'stats'>('inventory');
  const [isAdding, setIsAdding] = useState(false);
  const [showWaConfig, setShowWaConfig] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<Category>(Category.VETEMENT);
  const [initialPrice, setInitialPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [isPromo, setIsPromo] = useState(false);
  const [isLiq, setIsLiq] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        localStorage.removeItem('isAdmin');
        navigate('/login');
        return;
      }
      
      const userEmail = user.email?.toLowerCase();
      const isAdmin = userEmail === 'vendeuradmin1945@gmail.com' || user.uid === 'WvJbwhZ47IPIHtShtyJGfjQC1Vq1';

      if (!isAdmin) {
        localStorage.removeItem('isAdmin');
        navigate('/login');
      } else {
        localStorage.setItem('isAdmin', 'true');
        setIsLoading(false);
      }
    });

    // Real-time products sync
    const q = query(collection(db, PRODUCTS_COLLECTION));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const pList: Product[] = [];
      snapshot.forEach((doc) => {
        pList.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(pList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }, (error) => {
      // Background products sync should not crash the app for the admin if permissions are still propagating
      console.warn('Sync products error:', error.message);
    });

    // Real-time config sync
    const configRef = doc(db, CONFIG_COLLECTION, 'whatsapp');
    const unsubscribeConfig = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setWhatsappLink(data.whatsappLink || data.link || '');
      }
    }, (error) => {
      console.warn('Sync config error:', error.message);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
      unsubscribeConfig();
    };
  }, [navigate]);

  const handleAddProduct = async () => {
    const priceNum = parseFloat(newPrice);
    const initialPriceNum = parseFloat(initialPrice) || 0;

    if (!newName || !newPrice || !imgUrl) {
      setFormError('Veuillez remplir tous les champs et ajouter une image.');
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Le nouveau prix doit être un nombre positif.');
      return;
    }

    if (initialPrice && (isNaN(initialPriceNum) || initialPriceNum < 0)) {
      setFormError('Le prix initial doit être un nombre positif.');
      return;
    }

    setFormError('');
    setIsLoading(true);

    try {
      // Check if image size is roughly within Firestore limits (1MB)
      if (imgUrl.length > 800000) {
        setFormError('Image trop lourde. Veuillez utiliser une image plus légère (< 1MB).');
        setIsLoading(false);
        return;
      }

      await addDoc(collection(db, PRODUCTS_COLLECTION), {
        name: newName.trim(),
        category: newCat,
        initialPrice: initialPriceNum,
        newPrice: priceNum,
        isPromotion: isPromo,
        isLiquidation: isLiq,
        imageUrl: imgUrl,
        createdAt: Date.now() // Simple timestamp for sorting
      });

      // Reset Form
      setNewName('');
      setInitialPrice('');
      setNewPrice('');
      setIsPromo(false);
      setIsLiq(false);
      setImgUrl('');
      setIsAdding(false);
    } catch (error: any) {
      setFormError(`Erreur: ${error.message || 'Permissions insuffisantes'}`);
      handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const docPath = `${PRODUCTS_COLLECTION}/${id}`;
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const saveWhatsapp = async () => {
    const docPath = `${CONFIG_COLLECTION}/whatsapp`;
    setIsLoading(true);
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'whatsapp'), { whatsappLink: whatsappLink.trim() }, { merge: true });
      setShowWaConfig(false);
    } catch (error: any) {
      alert(`Erreur WhatsApp: ${error.message}`);
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWhatsapp = async () => {
    const docPath = `${CONFIG_COLLECTION}/whatsapp`;
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'whatsapp'), { whatsappLink: '' });
      setWhatsappLink('');
      setShowWaConfig(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  };

  const stats = {
    total: products.length,
    promo: products.filter(p => p.isPromotion).length,
    liq: products.filter(p => p.isLiquidation).length,
    val: products.reduce((acc, p) => acc + p.newPrice, 0),
    byCategory: Object.values(Category).map(cat => ({
      name: cat,
      count: products.filter(p => p.category === cat).length,
      value: products.filter(p => p.category === cat).reduce((acc, p) => acc + p.newPrice, 0)
    }))
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#00C49F'];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row relative overflow-x-hidden">
      {/* Background Image Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.15]"
        style={{ 
          backgroundImage: `url('https://www.image2url.com/r2/default/images/1778034747495-0638b1dd-9b1a-46af-b946-2cb668419a30.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-neutral-200 px-6 py-4 flex justify-between items-center sticky top-0 z-[60]">
        <div className="text-xl font-black italic tracking-tighter">Sdress <span className="text-[8px] non-italic opacity-30 uppercase font-black tracking-widest pl-1">Admin</span></div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[80] w-80 bg-white p-8 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 md:bg-white/90 md:backdrop-blur-xl md:border-r md:border-neutral-200 md:sticky md:top-0 md:h-screen
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div>
          <div className="hidden md:block text-3xl font-black italic tracking-tighter mb-12">Sdress <span className="text-xs non-italic opacity-30 uppercase font-black tracking-widest pl-2">Admin</span></div>
          <nav className="space-y-4">
            <NavItem 
              icon={<Package size={18} />} 
              label="Inventaire" 
              active={activeTab === 'inventory'} 
              onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<BarChart3 size={18} />} 
              label="Statistiques" 
              active={activeTab === 'stats'} 
              onClick={() => { setActiveTab('stats'); setIsSidebarOpen(false); }} 
            />
            <div className="h-px bg-neutral-100 my-6" />
            <NavItem icon={<ExternalLink size={18} />} label="Voir le site" onClick={() => navigate('/public')} />
            
            {/* WhatsApp Link Manager */}
            <div className="mt-8 px-4">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-300">Contact Vente</h4>
                  {whatsappLink && (
                    <button onClick={deleteWhatsapp} className="text-rose-500 hover:text-rose-600 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
               </div>
               {whatsappLink ? (
                 <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group relative">
                    <div className="text-emerald-600 font-bold text-[10px] truncate pr-4">{whatsappLink}</div>
                    <button onClick={() => setShowWaConfig(true)} className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <LinkIcon size={12} className="text-emerald-400" />
                    </button>
                 </div>
               ) : (
                 <button 
                  onClick={() => setShowWaConfig(true)}
                  className="w-full py-4 border-2 border-dashed border-neutral-200 rounded-2xl text-[10px] font-black uppercase text-neutral-300 hover:border-black hover:text-black transition-all"
                 >
                   Ajouter WhatsApp
                 </button>
               )}
            </div>
          </nav>
        </div>
        
        <button onClick={logout} className="flex items-center gap-3 text-neutral-400 hover:text-black transition-colors font-black uppercase text-[10px] tracking-widest mt-12 md:mt-0">
          <LogOut size={16} /> Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-16 relative z-10 overflow-y-auto md:h-screen">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2 text-balance leading-tight">
                {activeTab === 'inventory' ? 'Inventaire' : 'Statistiques'}
              </h1>
              <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                {activeTab === 'inventory' ? 'Gestion des articles & configurations' : 'Analyse des données de vente'}
              </p>
            </div>
            {activeTab === 'inventory' && (
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] md:text-xs flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-xl"
              >
                <Plus size={18} /> {isAdding ? 'Annuler' : 'Ajouter un article'}
              </button>
            )}
          </header>

          {activeTab === 'inventory' ? (
            <>
              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                <StatCard label="Total Produits" value={stats.total} icon={<Package className="text-blue-500" />} />
                <StatCard label="Promotions" value={stats.promo} icon={<Tag className="text-rose-500" />} />
                <StatCard label="Liquidations" value={stats.liq} icon={<Archive className="text-orange-500" />} />
                <StatCard label="Valeur Stock" value={`${stats.val.toLocaleString()} €`} icon={<DollarSign className="text-emerald-500" />} />
              </div>

          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-12"
              >
                <div className="bg-white/90 backdrop-blur-md border border-neutral-200 rounded-[32px] md:rounded-[40px] p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 shadow-2xl">
                  <div className="space-y-6">
                    <h3 className="text-[10px] md:text-xs font-black uppercase opacity-20 tracking-widest">Informations Produit</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Nom du produit" 
                        className="w-full bg-neutral-50/50 px-6 py-4 rounded-xl outline-none focus:ring-2 ring-neutral-200 transition-all font-bold text-sm"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="number" 
                          placeholder="Prix Initial" 
                          className="bg-neutral-50/50 px-6 py-4 rounded-xl outline-none focus:ring-2 ring-neutral-200 transition-all font-bold text-sm"
                          value={initialPrice}
                          onChange={(e) => setInitialPrice(e.target.value)}
                        />
                        <input 
                          type="number" 
                          placeholder="Nouveau Prix" 
                          className="bg-neutral-50/50 px-6 py-4 rounded-xl outline-none focus:ring-2 ring-neutral-200 transition-all font-bold text-sm"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                      </div>
                      <select 
                        className="w-full bg-neutral-50/50 px-6 py-4 rounded-xl outline-none focus:ring-2 ring-neutral-200 transition-all font-bold appearance-none text-sm"
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value as Category)}
                      >
                        <option value={Category.VETEMENT}>Vêtement</option>
                        <option value={Category.PANTALON}>Pantalon</option>
                        <option value={Category.CHAUSSURE}>Chaussure</option>
                        <option value={Category.ACCESSOIRE}>Accessoire</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-6 px-2">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" className="hidden" checked={isPromo} onChange={() => setIsPromo(!isPromo)} />
                          <div className={`w-5 h-5 rounded border-2 transition-all ${isPromo ? 'bg-black border-black' : 'border-neutral-200'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-black whitespace-nowrap">Promotion</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" className="hidden" checked={isLiq} onChange={() => setIsLiq(!isLiq)} />
                          <div className={`w-5 h-5 rounded border-2 transition-all ${isLiq ? 'bg-black border-black' : 'border-neutral-200'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-black whitespace-nowrap">Liquidation</span>
                       </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] md:text-xs font-black uppercase opacity-20 tracking-widest">Visuels</h3>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                         className="hidden" 
                        id="imageUpload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImgUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label 
                        htmlFor="imageUpload"
                        className="w-full bg-neutral-50/50 px-6 py-4 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100 transition-colors group"
                      >
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-black">
                          {imgUrl ? "Changer l'image" : "Sélectionner une image"}
                        </span>
                        <ImageIcon size={18} className="text-neutral-300 group-hover:text-black transition-colors" />
                      </label>
                    </div>

                    <div className="aspect-video bg-neutral-50/50 rounded-2xl md:rounded-3xl border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden relative group">
                      {imgUrl ? (
                        <>
                          <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <label htmlFor="imageUpload" className="bg-white text-black px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest cursor-pointer hover:scale-105 transition-transform">Modifier</label>
                          </div>
                        </>
                      ) : (
                        <label htmlFor="imageUpload" className="text-center cursor-pointer hover:scale-105 transition-transform p-4">
                          <ImageIcon className="mx-auto mb-2 text-neutral-300" size={24} />
                          <p className="text-[9px] font-black uppercase text-neutral-300 tracking-widest leading-relaxed">Cliquer pour uploader</p>
                        </label>
                      )}
                    </div>

                    {formError && (
                      <p className="text-red-500 text-[10px] font-black uppercase text-center animate-pulse">
                        {formError}
                      </p>
                    )}

                    <button 
                      onClick={handleAddProduct}
                      className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Publication en cours...' : 'Confirmer la publication'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List */}
          <div className="space-y-4">
             <h2 className="text-[10px] md:text-xs font-black uppercase opacity-20 tracking-widest ml-4 mb-6">Articles Publiés</h2>
             {products.length === 0 ? (
               <div className="text-center py-20 bg-white/90 backdrop-blur-md rounded-[32px] md:rounded-[40px] border border-neutral-100 shadow-sm">
                  <Archive size={40} className="mx-auto mb-4 text-neutral-100" />
                  <p className="text-[9px] md:text-[10px] font-black uppercase text-neutral-300 tracking-widest">Aucun article trouvé</p>
               </div>
             ) : (
               <div className="grid gap-4">
                 {products.map(product => (
                   <div key={product.id} className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:shadow-xl hover:shadow-neutral-300/20 transition-all gap-4">
                      <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-50 rounded-xl md:rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                          <img src={product.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                            <h4 className="font-black uppercase text-xs md:text-sm tracking-tight truncate max-w-[150px] md:max-w-none">{product.name}</h4>
                            <span className={`px-2 py-0.5 md:py-1 rounded text-[7px] md:text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${
                              product.category === Category.VETEMENT ? 'bg-rose-100 text-rose-500' :
                              product.category === Category.PANTALON ? 'bg-orange-100 text-orange-500' :
                              product.category === Category.CHAUSSURE ? 'bg-emerald-100 text-emerald-500' :
                              'bg-blue-100 text-blue-500'
                            }`}>
                              {product.category}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <span className="text-xs md:text-sm font-black">{product.newPrice} €</span>
                            {product.initialPrice > 0 && <span className="text-[10px] md:text-xs opacity-30 line-through font-bold">{product.initialPrice} €</span>}
                            <div className="flex gap-1">
                              {product.isPromotion && <span className="text-[7px] md:text-[8px] font-black uppercase bg-black text-white px-1.5 md:px-2 py-0.5 rounded">Promo</span>}
                              {product.isLiquidation && <span className="text-[7px] md:text-[8px] font-black uppercase bg-red-500 text-white px-1.5 md:px-2 py-0.5 rounded">Liq.</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(product.id!)}
                        className="self-end sm:self-center w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-neutral-100 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
            </>
          ) : (
            /* Statistics View */
            <div className="space-y-8 pb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Distribution */}
                <div className="bg-white/90 backdrop-blur-md p-10 rounded-[40px] border border-neutral-200 shadow-xl">
                   <h3 className="text-xl font-black italic uppercase mb-8">Répartition Articles</h3>
                   <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.byCategory}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#666' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#666' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 900 }}
                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                          />
                          <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                            {stats.byCategory.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Stock Value Distribution */}
                <div className="bg-white/90 backdrop-blur-md p-10 rounded-[40px] border border-neutral-200 shadow-xl">
                   <h3 className="text-xl font-black italic uppercase mb-8">Valeur par Catégorie</h3>
                   <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.byCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {stats.byCategory.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 900 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mt-8">
                      {stats.byCategory.map((cat, i) => (
                        <div key={cat.name} className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{cat.name}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white/90 backdrop-blur-md p-10 rounded-[40px] border border-neutral-200 shadow-xl">
                 <h3 className="text-xl font-black italic uppercase mb-8">Performance Globale</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                      { l: "Panier Moyen", v: `${(stats.val / (stats.total || 1)).toFixed(2)} €` },
                      { l: "Taux Promo", v: `${((stats.promo / (stats.total || 1)) * 100).toFixed(0)} %` },
                      { l: "Taux Liquid.", v: `${((stats.liq / (stats.total || 1)) * 100).toFixed(0)} %` },
                      { l: "Articles / Cat", v: (stats.total / Object.keys(Category).length).toFixed(1) }
                    ].map(d => (
                      <div key={d.l} className="p-6 bg-neutral-50 rounded-3xl">
                         <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400 mb-2">{d.l}</p>
                         <p className="text-2xl font-black">{d.v}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* WhatsApp Modal */}
      <AnimatePresence>
        {showWaConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWaConfig(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowWaConfig(false)}
                className="absolute top-6 right-6 text-neutral-200 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <LinkIcon className="text-emerald-500" size={32} />
              </div>
              
              <h3 className="text-xl font-black italic uppercase text-center mb-2">WhatsApp Link</h3>
              <p className="text-neutral-400 text-xs text-center font-bold mb-8">Entrez l'URL directe vers votre WhatsApp (ex: https://wa.me/336...)</p>
              
              <input 
                type="text" 
                placeholder="https://wa.me/..."
                className="w-full bg-neutral-50 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 mb-6 font-bold"
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)}
              />
              
              <div className="flex gap-4">
                <button 
                  onClick={saveWhatsapp}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform"
                >
                  Sauvegarder
                </button>
                {whatsappLink && (
                  <button 
                    onClick={deleteWhatsapp}
                    className="px-6 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${
        active ? 'bg-black text-white' : 'text-neutral-400 hover:text-black hover:bg-neutral-50'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-neutral-200">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-neutral-50 rounded-xl">{icon}</div>
      </div>
      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
