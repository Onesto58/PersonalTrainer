import React from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { Moon, Sun, Monitor } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useThemeStore();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Impostazioni</h1>

            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-4">Aspetto</h2>
                <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Scegli il tema dell'applicazione.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'light'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-transparent bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Sun size={24} className="mb-2" />
                            <span className="font-medium">Chiaro</span>
                        </button>

                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'dark'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-transparent bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Moon size={24} className="mb-2" />
                            <span className="font-medium">Scuro</span>
                        </button>

                        <button
                            onClick={() => setTheme('system')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'system'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-transparent bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Monitor size={24} className="mb-2" />
                            <span className="font-medium">Sistema</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
