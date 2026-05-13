import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 1. Tenter la connexion
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, cleanEmail, password);
          } catch (regErr: any) {
            if (regErr.code === 'auth/email-already-in-use') {
              setError('Code secret incorrect pour ce compte.');
            } else if (regErr.code === 'auth/weak-password') {
              setError('Le code secret doit faire au moins 6 caractères.');
            } else if (regErr.code === 'auth/operation-not-allowed') {
              setError('L\'admin doit activer "Email/Password" dans la console Firebase (Authentification > Sign-in method).');
            } else {
              setError(`Erreur d'inscription: ${regErr.code}`);
            }
            setIsLoading(false);
            return;
          }
        } else if (signInErr.code === 'auth/wrong-password') {
          setError('Code secret incorrect.');
          setIsLoading(false);
          return;
        } else if (signInErr.code === 'auth/operation-not-allowed') {
          setError('L\'admin doit activer "Email/Password" dans la console Firebase (Authentification > Sign-in method).');
          setIsLoading(false);
          return;
        } else if (signInErr.code === 'auth/network-request-failed') {
          setError('Problème de connexion. Vérifiez votre internet.');
          setIsLoading(false);
          return;
        } else {
          throw signInErr;
        }
      }

      // 3. Redirection manuelle forcée si on est déjà sur l'email admin
      if (cleanEmail.toLowerCase() === 'vendeuradmin1945@gmail.com') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        localStorage.setItem('isUser', 'true');
        navigate('/public');
      }

    } catch (err: any) {
      console.error("Auth global error:", err);
      setError(`Erreur: ${err.message || 'Identifiants invalides'}`);
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
        className="relative z-10 glass-panel p-6 md:p-10 w-full max-w-sm mx-4"
      >
        <div className="text-center mb-8 md:mb-10">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2"
          >
            Sdress
          </motion.h1>
          <p className="text-white/40 text-[9px] md:text-[11px] uppercase tracking-[0.3em] font-black">Accès Privé</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-black text-white/40 tracking-[0.3em] ml-1 flex justify-between">
              <span>Identifiant</span>
            </label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="liquid-input w-full py-5 pl-14 pr-6 text-white text-sm font-bold bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 focus:border-white/30 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-black text-white/40 tracking-[0.3em] ml-1 flex justify-between">
              <span>Code Secret</span>
            </label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre code secret"
                className="liquid-input w-full py-5 pl-14 pr-6 text-white text-sm font-bold bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 focus:border-white/30 transition-all outline-none"
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
            disabled={isLoading}
            className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.3em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Vérification...' : 'Accéder au shop'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
