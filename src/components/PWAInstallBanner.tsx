import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles, 
  Monitor, 
  Apple, 
  Globe, 
  Check 
} from 'lucide-react';

interface PWAInstallBannerProps {
  deferredPrompt: any;
  onInstalled: () => void;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  deferredPrompt,
  onInstalled,
  isModalOpen = false,
  onCloseModal,
}) => {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    // Auto-show banner after 1.5s if not installed and not dismissed
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('solarpro_pwa_dismissed');
      if (!checkStandalone && !dismissed) {
        setIsBannerVisible(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setShowGuideModal(true);
    }
  }, [isModalOpen]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          onInstalled();
          setIsBannerVisible(false);
          setShowGuideModal(false);
        }
      } catch (err) {
        console.warn('Native prompt error:', err);
        setShowGuideModal(true);
      }
    } else {
      // If no native prompt available (iOS or desktop browser), show guide modal
      setShowGuideModal(true);
    }
  };

  const handleDismissBanner = () => {
    setIsBannerVisible(false);
    setIsDismissed(true);
    localStorage.setItem('solarpro_pwa_dismissed', 'true');
  };

  const handleCloseGuideModal = () => {
    setShowGuideModal(false);
    if (onCloseModal) onCloseModal();
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Auto-Install Banner (Mobile & Desktop) */}
      {isBannerVisible && !isDismissed && (
        <aside 
          aria-label="Instalação do Aplicativo CAST SolarPro" 
          className="fixed bottom-20 md:bottom-6 right-3 left-3 md:left-auto md:max-w-md z-50 bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-md animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">Instalar CAST SolarPro</h4>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded">PWA</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Acesso rápido sem digitar endereço, funciona offline em visitas técnicas e assina direto na tela.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDismissBanner}
              className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Depois
            </button>
            <button
              type="button"
              id="btn-pwa-banner-install"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar Aplicativo</span>
            </button>
          </div>
        </aside>
      )}

      {/* Universal Installation Guide Modal (For iOS Safari, Desktop, and All Browsers) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Instalar CAST SolarPro (App PWA)</h3>
                  <p className="text-xs text-slate-400">Aplicativo oficial da CAST para Celulares, Tablets e Computadores</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseGuideModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto">
              
              {/* Native Prompt Available (Android / Chrome / Edge) */}
              {deferredPrompt ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-300">Instalação Direta Pronta</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Clique no botão abaixo para adicionar o CAST SolarPro diretamente aos seus aplicativos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Confirmar Instalação Agora</span>
                  </button>
                </div>
              ) : isIOS ? (
                /* iOS / iPhone / iPad Safari Step-by-Step Instructions */
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs font-semibold">
                    <Apple className="w-4 h-4 shrink-0" />
                    <span>Instalação no iPhone & iPad (Safari):</span>
                  </div>

                  <ol className="space-y-3 text-xs text-slate-200">
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                        1
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-white">Toque no botão Compartilhar do Safari</p>
                        <p className="text-[11px] text-slate-400">
                          Localizado na barra inferior do iPhone ou no topo do iPad (ícone de um quadrado com uma seta para cima <Share className="w-3.5 h-3.5 inline text-amber-400" />).
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                        2
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-white">Selecione "Adicionar à Tela de Início"</p>
                        <p className="text-[11px] text-slate-400">
                          Role as opções para baixo até encontrar o ícone <PlusSquare className="w-3.5 h-3.5 inline text-amber-400" /> <b>"Adicionar à Tela de Início"</b>.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                        3
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-white">Toque em "Adicionar" no topo direito</p>
                        <p className="text-[11px] text-slate-400">
                          Pronto! O ícone do CAST Solar aparecerá na sua tela de início como um aplicativo nativo.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android / Chrome / Desktop Generic Instructions */
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs font-semibold">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>Como instalar no seu navegador:</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>No Celular Android (Chrome / Samsung Internet):</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Toque nos 3 pontinhos do menu superior (⋮) e selecione <b>"Instalar aplicativo"</b> ou <b>"Adicionar à tela inicial"</b>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <Monitor className="w-4 h-4 text-amber-400" />
                        <span>No Computador (Chrome / Edge / Opera / Brave):</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Clique no ícone de instalação <Download className="w-3.5 h-3.5 inline text-amber-400" /> localizado no canto direito da barra de endereços URL.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits Checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Vantagens do CAST SolarPro Instalado:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Sem barras de navegação do browser</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Abertura instantânea</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Armazenamento local seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Assinatura touchscreen precisa</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleCloseGuideModal}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Entendi, Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
