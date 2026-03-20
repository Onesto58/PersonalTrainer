import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, History, Settings, ChevronLeft, ChevronRight, FileSpreadsheet, Menu, X, LogOut, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    const { session, signOut } = useStore();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const userEmail = session?.user?.email || 'Allenatore';

    // Close mobile menu when navigating (simple approach by listening to click on nav items)
    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border z-40 relative">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                        T
                    </div>
                    <h1 className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-xl">
                        Giuseppe App
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={signOut}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Esci"
                    >
                        <LogOut size={20} />
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 bg-secondary text-secondary-foreground rounded-lg"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out absolute md:relative z-50 h-[calc(100vh-73px)] md:h-screen w-64 md:w-auto",
                    isCollapsed ? "md:w-20" : "md:w-64",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Toggle Button (Desktop only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-12 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors z-50"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                <div className={clsx(
                    "p-6 border-b border-border hidden md:flex items-center shrink-0 overflow-hidden",
                    isCollapsed ? "justify-center" : "justify-between"
                )}>
                    <h1 className={clsx(
                        "font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 whitespace-nowrap",
                        isCollapsed ? "text-xl opacity-0 w-0" : "text-2xl opacity-100"
                    )}>
                        Giuseppe App
                    </h1>
                    {isCollapsed && (
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                            T
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" isCollapsed={isCollapsed} onClick={handleNavClick} />
                    <NavItem to="/clients" icon={<Users size={20} />} label="Clienti" isCollapsed={isCollapsed} onClick={handleNavClick} />
                    <NavItem to="/management" icon={<FileSpreadsheet size={20} />} label="Gestione Clienti" isCollapsed={isCollapsed} onClick={handleNavClick} />
                    <NavItem to="/packages" icon={<Package size={20} />} label="Pacchetti" isCollapsed={isCollapsed} onClick={handleNavClick} />
                    <NavItem to="/history" icon={<History size={20} />} label="Storico" isCollapsed={isCollapsed} onClick={handleNavClick} />
                </nav>

                <div className="p-4 border-t border-border space-y-1">
                    <div className={clsx(
                        "flex items-center gap-3 px-4 py-2 mb-2 rounded-lg bg-muted/50 overflow-hidden transition-all duration-300",
                        isCollapsed ? "justify-center px-0 opacity-0 h-0 p-0 mb-0" : "opacity-100"
                    )}>
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                            <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate text-foreground">{userEmail.split('@')[0]}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                        </div>
                    </div>

                    <NavItem to="/settings" icon={<Settings size={20} />} label="Impostazioni" isCollapsed={isCollapsed} onClick={handleNavClick} />
                    
                    <button
                        onClick={signOut}
                        className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group relative",
                            isCollapsed ? "justify-center px-0" : ""
                        )}
                        title={isCollapsed ? "Esci" : ""}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!isCollapsed && <span className="text-sm font-medium">Esci</span>}
                        {isCollapsed && (
                             <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-[100]">
                                Esci
                             </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto h-[calc(100vh-73px)] md:h-screen w-full relative">
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed, onClick }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                    isCollapsed ? "md:justify-center md:px-0" : "px-4",
                    isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
            }
            title={isCollapsed ? label : ""}
        >
            <div className="shrink-0">{icon}</div>
            <span className={clsx(
                "transition-all duration-300 whitespace-nowrap overflow-hidden",
                isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
            )}>
                {label}
            </span>

            {/* Tooltip for collapsed state (Desktop only) */}
            {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-[100]">
                    {label}
                </div>
            )}
        </NavLink>
    );
};
