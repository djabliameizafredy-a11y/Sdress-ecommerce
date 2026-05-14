import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

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
        console.error("SignIn Error:", signInErr.code, signInErr.message);
        
        if (signInErr.code === 'auth/network-request-failed') {
          setError('IMPORTANT: Ouvrez l\'application dans un NOUVEL ONGLET (bouton en haut à droite) pour valider l\'accès.');
          setIsLoading(false);
          return;
        }

        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/invalid-email') {
          try {
            await createUserWithEmailAndPassword(auth, cleanEmail, password);
          } catch (regErr: any) {
            console.error("Register Error:", regErr.code, regErr.message);
            if (regErr.code === 'auth/email-already-in-use') {
              setError('Identifiant déjà utilisé ou code incorrect.');
            } else if (regErr.code === 'auth/weak-password') {
              setError('Le code secret doit faire au moins 6 caractères.');
            } else if (regErr.code === 'auth/operation-not-allowed') {
              setError('ERREUR: Activez "Email/Password" dans Authentification > Sign-in method sur Firebase.');
            } else if (regErr.code === 'auth/network-request-failed') {
              setError('Erreur réseau. Ouvrez l\'app en plein écran.');
            } else {
              setError(`Erreur (${regErr.code})`);
            }
            setIsLoading(false);
            return;
          }
        } else if (signInErr.code === 'auth/wrong-password') {
          setError('Code secret incorrect.');
          setIsLoading(false);
          return;
        } else {
          setError(`Erreur: ${signInErr.code}`);
          setIsLoading(false);
          return;
        }
      }

      // 3. Redirection
      if (cleanEmail.toLowerCase() === 'vendeuradmin1945@gmail.com') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        localStorage.setItem('isUser', 'true');
        navigate('/public');
      }

    } catch (err: any) {
      setError('Erreur Critique');
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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
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
          <p className="text-white/40 text-[9px] md:text-[11px] uppercase tracking-[0.3em] font-black">Accès Protégé</p>
        </div>

        <div className="space-y-6">
          {/* Main Auth Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="liquid-input w-full py-4 pl-14 pr-6 text-white text-sm font-bold bg-white/5 border-white/10 rounded-2xl outline-none focus:bg-white/10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Code Secret"
                  className="liquid-input w-full py-4 pl-14 pr-6 text-white text-sm font-bold bg-white/5 border-white/10 rounded-2xl outline-none focus:bg-white/10"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Vérification...' : 'Valider'}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <p className="text-red-400 text-[10px] font-black uppercase text-center leading-relaxed">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-[8px] font-bold text-white/20 uppercase tracking-widest">
           Sdress Security v2.1
        </p>
      </motion.div>
    </div>
  );
}
