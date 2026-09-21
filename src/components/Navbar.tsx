import React, { useState, useEffect } from 'react';
import { AppUser } from '../types';
import { 
  Sun, 
  Calculator, 
  Kanban, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Wifi, 
  WifiOff, 
  PlusCircle,
  Smartphone,
  ShieldCheck,
  LogOut,
  User,
  Package
} from 'lucide-react';

export type NavTabType = 'calculator' | 'crm' | 'proposals' | 'equipment' | 'payments' | 'reports' | 'dev';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onNewProposal: () => void;
  onOpenInstallModal: () => void;
  currentUser: AppUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewProposal,
  onOpenInstallModal,
  currentUser,
  onLogout,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isDev = currentUser?.role === 'dev';

  // Client nav items only (app features reserved for users)
  const clientNavItems = [
    { id: 'calculator' as const, label: 'Dimensionamento', shortLabel: 'Dimensionar', icon: Calculator },
    { id: 'crm' as const, label: 'CRM & Negócios', shortLabel: 'Negócios', icon: Kanban },
    { id: 'proposals' as const, label: 'Propostas', shortLabel: 'Propostas', icon: FileText },
    { id: 'equipment' as const, label: 'Equipamentos', shortLabel: 'Equipamentos', icon: Package },
    { id: 'payments' as const, label: 'Pagamentos', shortLabel: 'Pagamentos', icon: CreditCard },
    { id: 'reports' as const, label: 'Relatórios', shortLabel: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg w-full">
        <div className="max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            
            {/* Logo & Brand */}
            <div 
              className="flex items-center gap-2 select-none cursor-pointer min-w-0 shrink" 
              onClick={() => !isDev && setActiveTab('crm')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-bold shrink-0">
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <div className="flex items-baseline">
                    <span className="font-black text-amber-400 text-sm sm:text-lg tracking-tight font-display">CAST</span>
                    <span className="font-bold text-sm sm:text-lg tracking-tight text-white font-display hidden xs:inline ml-0.5">SolarPro</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 hidden xs:inline-block">
                    {isDev ? 'DEV' : 'PWA'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                  {isDev ? 'Painel Administrativo - Gestão de Clientes' : 'CAST Engenharia & Energia Solar'}
                </p>
              </div>
            </div>

            {/* If DEV: Show exclusive DEV badge on desktop */}
            {isDev ? (
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Módulo de Gestão de Clientes</span>
              </div>
            ) : (
              /* Desktop Navigation Links for CLIENTS only */
              <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                {clientNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-btn-${item.id}`}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Actions, User Info & Status Header Area */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Cloud DB Sync status badge */}
              <div 
                title="Persistência em Nuvem Ativa (Firebase Firestore): Dados, clientes, fotos e propostas salvos no Google Cloud"
                className="hidden xl:flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Banco na Nuvem Ativo</span>
              </div>

              {/* Online / Offline status badge */}
              <div 
                title={isOnline ? "Conectado à internet" : "Modo Offline PWA ativo"}
                className={`hidden lg:flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${
                  isOnline 
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400' 
                    : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                }`}
              >
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span className="font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Install PWA Button (Available for client app on tablet/desktop) */}
              {!isDev && !isStandalone && (
                <button
                  id="btn-install-pwa"
                  type="button"
                  onClick={onOpenInstallModal}
                  title="Instalar aplicativo CAST SolarPro no celular ou computador"
                  className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-amber-400 transition-colors shadow-sm"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instalar</span>
                </button>
              )}

              {/* Primary Action Button (Only for clients on screens sm+) */}
              {!isDev && (
                <button
                  id="btn-new-proposal"
                  type="button"
                  onClick={onNewProposal}
                  title="Criar Nova Proposta"
                  className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Nova Proposta</span>
                </button>
              )}

              {/* Logged User Badge - Visible only on sm+ to prevent horizontal squeezing on mobile */}
              {currentUser && (
                <div 
                  title={`Logado como: ${currentUser.name} (${currentUser.role === 'dev' ? 'DEV Master' : 'Cliente'})`}
                  className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-xl border text-xs select-none shrink-0 ${
                    isDev
                      ? 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  {isDev ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  )}
                  <span className="font-semibold truncate max-w-[80px] sm:max-w-[120px]">
                    {isDev ? 'DEV Master' : currentUser.name.split(' ')[0]}
                  </span>
                </div>
              )}

              {/* Botão Sair - SEMPRE visível, garantido 100% dentro dos limites da tela no celular */}
              {currentUser && (
                <button
                  id="btn-logout"
                  type="button"
                  onClick={onLogout}
                  title="Sair da conta (Deslogar)"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 border border-rose-400/50 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="font-bold">Sair</span>
                </button>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar (ONLY FOR CLIENT USERS) */}
      {!isDev && (
        <nav 
          aria-label="Navegação Principal Mobile" 
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-lg border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe"
        >
          <div className="grid grid-flow-col auto-cols-fr h-16 w-full max-w-lg mx-auto items-center px-0.5">
            {clientNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`mobile-tab-${item.id}`}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center h-full py-1 rounded-xl transition-all duration-150 select-none ${
                    isActive
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`relative p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-amber-500/15 scale-105' : ''
                  }`}>
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                    )}
                  </div>
                  <span className={`text-[10px] tracking-tight leading-tight mt-0.5 whitespace-nowrap truncate max-w-[56px] text-center ${
                    isActive 
                      ? 'text-amber-400 font-bold' 
                      : 'text-slate-400 font-medium'
                  }`}>
                    {item.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};
