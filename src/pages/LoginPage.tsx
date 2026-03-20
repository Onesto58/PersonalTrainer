import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Dumbbell } from 'lucide-react';
import clsx from 'clsx';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage('Registrazione completata! Controlla la tua email per confermare l\'account.');
            }
        } catch (err: any) {
            setError(err.message || 'Errore durante l\'autenticazione');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
            
            <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-700">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/20 mb-4 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Dumbbell className="text-white" size={40} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        PersonalTrainer<span className="text-blue-500">Pro</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Gestione professionale per il tuo business</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-black/50 overflow-hidden relative group">
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
                    
                    <div className="flex gap-4 p-1 bg-white/[0.05] rounded-2xl border border-white/5 mb-8">
                        <button
                            onClick={() => setMode('signin')}
                            className={clsx(
                                "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                                mode === 'signin' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/70"
                            )}
                        >
                            Accedi
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={clsx(
                                "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                                mode === 'signup' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/70"
                            )}
                        >
                            Registrati
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/50 ml-1">Email</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="esempio@email.com"
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/50 ml-1">Password</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm animate-shake">
                                <AlertCircle size={18} />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 text-sm">
                                <AlertCircle size={18} />
                                <p className="font-medium">{message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{mode === 'signin' ? 'Entra in Piattaforma' : 'Crea Account'}</span>
                                    {mode === 'signin' ? <LogIn size={18} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <p className="text-center text-white/20 mt-8 text-xs font-medium tracking-widest uppercase">
                    &copy; 2024 PersonalTrainerPro - All Rights Reserved
                </p>
            </div>
        </div>
    );
};
