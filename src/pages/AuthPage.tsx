import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Github, Lock, User } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { signInWithGoogle, signInWithApple, auth } from '../lib/firebase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const googleLogo = "https://www.image2url.com/r2/default/images/1778174780517-57849e75-9b88-466f-8a03-7cb576402ec9.jpg";
  const appleLogo = "https://www.image2url.com/r2/default/images/1778174780517-6467389a-313d-4c3d-bb62-72be13956792.jpg";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Admin Access Check via Firebase
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.email === 'VendeurAdmin1945@gmail.com') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        localStorage.setItem('isUser', 'true');
        navigate('/public');
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError('Identifiants incorrects ou problème de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'apple' | 'email') => {
    setError('');
    
    try {
      if (provider === 'google') {
        await signInWithGoogle();
        localStorage.setItem('isUser', 'true');
        navigate('/public');
      } else if (provider === 'apple') {
        await signInWithApple();
        localStorage.setItem('isUser', 'true');
        navigate('/public');
      } else if (provider === 'email') {
        // Just focus the email input if they click the email icon
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        emailInput?.focus();
      }
    } catch (err: any) {
      console.error(`Error logging in with ${provider}:`, err);
      if (err.code === 'auth/popup-blocked') {
        setError('Le popup a été bloqué par votre navigateur. Veuillez autoriser les popups pour ce site.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // User closed the popup, don't show a big error
      } else {
        setError('Erreur d\'authentification. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900 text-white">
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: `url('https://www.image2url.com/r2/default/images/1778169164356-87abe501-cac1-43dd-a167-f30955fc7088.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 glass-panel p-6 md:p-8 w-full max-w-md mx-4"
      >
        <div className="text-center mb-8 md:mb-10">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-black italic tracking-tighter text-white mb-2"
          >
            Sdress
          </motion.h1>
          <p className="text-white/50 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold">Système d'accès</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-1">Identifiant</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Administrateur ou Client"
                className="liquid-input w-full pl-10 text-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-1">Code Secret</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="liquid-input w-full pl-10 text-white text-sm"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-[10px] font-black uppercase text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Accéder
          </button>
        </form>

        <div className="relative my-8 border-t border-white/10">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent px-4 text-[10px] font-black uppercase text-white/20 tracking-widest">
            Ou se connecter avec
          </span>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => socialLogin('google')}
            disabled={isLoading}
            className="flex-1 glass-panel p-3 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <img src={googleLogo} alt="Google" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
          </button>
          <button 
            onClick={() => socialLogin('apple')}
            disabled={isLoading}
            className="flex-1 glass-panel p-3 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <img src={appleLogo} alt="Apple" className="w-6 h-6 object-contain invert" referrerPolicy="no-referrer" />
          </button>
          <button 
            onClick={() => socialLogin('email')}
            disabled={isLoading}
            className="flex-1 glass-panel p-3 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <Mail className="text-white w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
