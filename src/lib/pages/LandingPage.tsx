import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight, ShieldCheck, Zap, MessageSquare, ShoppingBag } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);

  return (
    <div ref={containerRef} className="bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
      {/* Liquid Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[180px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Navigation (Glass) */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl">
        <div className="glass-panel px-8 py-4 flex justify-between items-center border-white/5">
          <div className="text-xl font-black italic tracking-tighter">SDRESS<span className="text-purple-500">.</span></div>
          <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Saison</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Concept</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Contact</span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white text-black px-4 md:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Membre
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden">
        <motion.div 
          style={{ opacity: backgroundOpacity }}
          className="absolute inset-0 z-0 scale-110"
        >
          <img 
            src="https://www.image2url.com/r2/default/images/1778173820775-411fbea3-570f-4729-b530-fc45c74fef35.jpg" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]" />
        </motion.div>

        <div className="relative z-10 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.8em] text-purple-400 block mb-4 md:mb-6">
              Where creativity meets the runway
            </span>
            <h1 className="text-[22vw] md:text-[12vw] leading-[0.75] font-black italic uppercase tracking-tighter">
              Sdress<span className="text-purple-500">.</span>
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-8"
          >
            <p className="text-neutral-400 text-sm md:text-base font-bold uppercase tracking-[0.3em] max-w-xl">
              Be a part of something great
            </p>
            <div className="w-px h-24 bg-gradient-to-b from-purple-500 to-transparent" />
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        >
          <span className="text-[8px] font-black uppercase tracking-widest">Explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* Identity Section (Side by Side) */}
      <section className="py-20 md:py-40 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8 md:space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
              Who <br /><span className="text-purple-500">We Are?</span>
            </h2>
            <div className="w-20 h-1 bg-purple-500 rounded-full" />
          </div>
          
          <p className="text-neutral-400 text-lg md:text-xl leading-relaxed font-bold italic text-balance">
            Sdress redefined the standards of fashion modeling by embracing diversity, celebrating individuality, and nurturing raw talent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <Feature icon={<ShieldCheck className="text-purple-500" />} title="Exclusivité" desc="Vérifié par Sdress systems" />
            <Feature icon={<Zap className="text-purple-500" />} title="Rapidité" desc="Logistique instantanée" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-[3/4] rounded-[40px] md:rounded-[80px] overflow-hidden group shadow-2xl shadow-purple-500/20 border border-white/5"
        >
          <img 
            src="https://www.image2url.com/r2/default/images/1778173867520-85fde16a-413d-44d4-a008-07e9df67f724.jpg" 
            className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-16 left-16">
            <p className="text-5xl font-black italic tracking-tighter uppercase leading-none">Vision <br />System</p>
          </div>
        </motion.div>
      </section>

      {/* Methodology Section (Cards) */}
      <section className="py-20 md:py-40 bg-neutral-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 md:mb-32 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Comment <br /><span className="text-purple-500">ça marche?</span></h2>
            <p className="text-neutral-500 font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px] max-w-sm">
              We're a dynamic platform that breathes life into dreams and transforms them into reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              image="https://www.image2url.com/r2/default/images/1778173903445-b4fa89fe-fedd-4217-aefd-1f712c742b52.jpg"
              number="01" 
              title="Browse" 
              desc="Parcourez nos collections segmentées par catégories : Vêtements, Pantalons, Chaussures et Accessoires." 
              icon={<ShoppingBag />}
            />
            <StepCard 
              image="https://www.image2url.com/r2/default/images/1778173985348-4945bbbc-6d85-47ad-b09b-f3fc81523a6a.jpg"
              number="02" 
              title="Select" 
              desc="Ajoutez vos articles préférés au panier et vérifiez les détails techniques (Promotion, Liquidation)." 
              icon={<Zap />}
            />
            <StepCard 
              image="https://www.image2url.com/r2/default/images/1778174035171-fb930ca8-37ec-43dd-9611-c80f99751382.jpg"
              number="03" 
              title="Connect" 
              desc="Finalisez votre commande via WhatsApp pour un échange direct et personnalisé avec l'administrateur." 
              icon={<MessageSquare />}
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="min-h-screen relative flex flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://www.image2url.com/r2/default/images/1778174129748-2d1a5b22-7c59-4fd3-a374-e04d0f3671f4.jpg" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]" />
        </div>

        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           className="relative z-10 space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-5xl md:text-[14vw] font-black italic uppercase tracking-tighter leading-[0.8]">
              Prêt à <br /><span className="text-purple-500">Découvrir?</span>
            </h2>
            <p className="text-neutral-500 font-black uppercase tracking-[0.4em] md:tracking-[0.8em] text-[8px] md:text-[10px]">L'expérience Sdress commence ici</p>
          </div>
          
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-10 md:px-16 py-6 md:py-8 bg-white text-black font-black uppercase text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] rounded-full overflow-hidden hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10 flex items-center gap-6">
              Commencer <ArrowRight size={20} />
            </span>
            <div className="absolute inset-0 bg-purple-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </motion.div>
      </section>

      {/* Bottom Footer Glass */}
      <footer className="py-20 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-black italic tracking-tighter">SDRESS<span className="text-purple-500">.</span></div>
          <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest opacity-30">
            <span>Instagram</span>
            <span>Twitter / X</span>
            <span>Facebook</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600">
            © 2026 Sdress systems — Paris / Tokyo
          </p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-4">
      <div className="glass-panel w-12 h-12 flex items-center justify-center border-white/10 rounded-2xl">{icon}</div>
      <div className="space-y-1">
        <h3 className="font-black uppercase text-xs tracking-widest">{title}</h3>
        <p className="text-[10px] text-neutral-500 font-bold uppercase leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ image, number, title, desc, icon }: { image: string, number: string, title: string, desc: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-panel group border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col h-full"
    >
      <div className="aspect-video relative overflow-hidden">
        <img src={image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
        <div className="absolute top-4 left-4 glass-panel px-3 py-1 text-[10px] font-black border-white/10">{number}</div>
      </div>
      <div className="p-10 space-y-4 flex-1">
        <div className="flex items-center gap-4 text-purple-500">
          {icon} <h3 className="text-2xl font-black uppercase italic">{title}</h3>
        </div>
        <p className="text-neutral-500 text-sm leading-relaxed font-bold italic opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
      </div>
    </motion.div>
  );
}
