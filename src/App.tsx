import React, { useState, useEffect } from 'react';
import { 
  SolarProposal, 
  DigitalSignatureData, 
  FollowUpActivity, 
  PaymentInstallment, 
  LeadStatus,
  AppUser
} from './types';
import { 
  getStoredProposals, 
  saveProposal, 
  deleteProposal, 
  signProposal, 
  addFollowUp, 
  updatePaymentInstallment, 
  resetToDefaults,
  getCurrentSession,
  setCurrentSession,
  initFirestoreSync 
} from './utils/storage';
import { Navbar, NavTabType } from './components/Navbar';
import { SizingCalculator } from './components/SizingCalculator';
import { ProposalViewer } from './components/ProposalViewer';
import { CRMBoard } from './components/CRMBoard';
import { PaymentsTracker } from './components/PaymentsTracker';
import { ReportsDashboard } from './components/ReportsDashboard';
import { FollowUpModal } from './components/FollowUpModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AuthScreen } from './components/AuthScreen';
import { DevDashboard } from './components/DevDashboard';
import { EquipmentManager } from './components/EquipmentManager';
import { generateProposalPDF } from './utils/pdfGenerator';
import { formatCurrencyBRL } from './utils/solarCalculations';
import { 
  FileText, 
  Search, 
  Download, 
  Send, 
  Eye, 
  Plus, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentSession());
  const [proposals, setProposals] = useState<SolarProposal[]>([]);
  const [activeTab, setActiveTab] = useState<NavTabType>('crm');
  const [selectedProposal, setSelectedProposal] = useState<SolarProposal | null>(null);
  const [followUpModalProposal, setFollowUpModalProposal] = useState<SolarProposal | null>(null);
  
  // Proposals List search & filter
  const [proposalsSearch, setProposalsSearch] = useState('');
  const [proposalsStatusFilter, setProposalsStatusFilter] = useState('all');

  // PWA install prompt handler & modal
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  useEffect(() => {
    // Carrega dados locais imediatos para renderização sem latência
    const loaded = getStoredProposals();
    setProposals(loaded);

    // Conecta a sincronização em tempo real do banco de dados na nuvem (Firebase Firestore)
    initFirestoreSync({
      onProposalsChange: (updatedProposals) => {
        setProposals(updatedProposals);
        setSelectedProposal((prev) => {
          if (!prev) return null;
          return updatedProposals.find((p) => p.id === prev.id) || prev;
        });
      },
    });

    // Register PWA service worker if supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          reg.update();
        }).catch((err) => {
          console.warn('Service Worker registration skipped or failed:', err);
        });
      });
    }

    // PWA Install prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Proposal Creation
  const handleProposalCreated = (newProposal: SolarProposal) => {
    const updated = saveProposal(newProposal);
    setProposals(updated);
    setSelectedProposal(newProposal);
  };

  // Proposal Signature
  const handleSignProposal = (proposalId: string, signature: DigitalSignatureData) => {
    const updated = signProposal(proposalId, signature);
    setProposals(updated);
    const updatedCurrent = updated.find(p => p.id === proposalId);
    if (updatedCurrent) {
      setSelectedProposal(updatedCurrent);
    }
  };

  // Status Change (Pipeline Stage)
  const handleUpdateStatus = (proposalId: string, newStatus: LeadStatus) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;
    const updated = saveProposal({
      ...proposal,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    setProposals(updated);
  };

  // Delete Proposal
  const handleDeleteProposal = (proposalId: string) => {
    if (confirm('Tem certeza que deseja excluir esta proposta?')) {
      const updated = deleteProposal(proposalId);
      setProposals(updated);
      if (selectedProposal?.id === proposalId) {
        setSelectedProposal(null);
      }
    }
  };

  // Save Follow-up activity
  const handleSaveFollowUp = (proposalId: string, activity: Omit<FollowUpActivity, 'id' | 'createdAt'>) => {
    const updated = addFollowUp(proposalId, activity);
    setProposals(updated);
    const updatedCurrent = updated.find(p => p.id === proposalId);
    if (updatedCurrent && selectedProposal?.id === proposalId) {
      setSelectedProposal(updatedCurrent);
    }
  };

  // Update Payment installment
  const handleUpdatePayment = (proposalId: string, payment: PaymentInstallment) => {
    const updated = updatePaymentInstallment(proposalId, payment);
    setProposals(updated);
  };

  // Reset to demo data
  const handleResetDefaults = () => {
    resetToDefaults();
    setProposals(getStoredProposals());
    setSelectedProposal(null);
  };

  // Login handler
  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentSession(user);
    if (user.role === 'dev') {
      setActiveTab('dev');
    } else {
      setActiveTab('crm');
    }
  };

  const handleLogout = () => {
    setCurrentSession(null);
    setCurrentUser(null);
    setActiveTab('crm');
  };

  // Filtered proposals for "Propostas" tab
  const filteredProposalsList = proposals.filter(p => {
    const matchSearch = p.client.name.toLowerCase().includes(proposalsSearch.toLowerCase()) ||
      p.proposalNumber.toLowerCase().includes(proposalsSearch.toLowerCase()) ||
      p.client.city.toLowerCase().includes(proposalsSearch.toLowerCase());

    const matchStatus = proposalsStatusFilter === 'all' || p.status === proposalsStatusFilter;

    return matchSearch && matchStatus;
  });

  // If user is not logged in, show AuthScreen gate
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // If user is DEV: ONLY render DEV Dashboard (exclusive client management, no app features)
  if (currentUser.role === 'dev') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased overflow-x-hidden w-full">
        <Navbar
          activeTab="dev"
          setActiveTab={() => {}}
          onNewProposal={() => {}}
          onOpenInstallModal={() => {}}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
          <DevDashboard currentUser={currentUser} onLogout={handleLogout} />
        </main>
      </div>
    );
  }

  // CLIENT VIEW: FULL SOLAR APP (CRM, Dimensionamento, Propostas, Equipamentos, Pagamentos, Relatórios)
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col antialiased overflow-x-hidden w-full">
      
      {/* Top Main Navigation for Clients */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProposal(null);
        }}
        onNewProposal={() => {
          setActiveTab('calculator');
          setSelectedProposal(null);
        }}
        onOpenInstallModal={() => setIsPwaModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area (With bottom padding on mobile for fixed app bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8">
        
        {/* Render Specific Proposal View if one is opened */}
        {selectedProposal ? (
          <ProposalViewer
            proposal={selectedProposal}
            onBack={() => setSelectedProposal(null)}
            onSignProposal={handleSignProposal}
            onOpenFollowUp={(prop) => setFollowUpModalProposal(prop)}
            onUpdateProposal={(updated) => {
              const list = saveProposal(updated);
              setProposals(list);
              setSelectedProposal(updated);
            }}
          />
        ) : (
          <>
            {/* Tab: Calculator / Sizing */}
            {activeTab === 'calculator' && (
              <SizingCalculator
                onProposalCreated={handleProposalCreated}
                onNavigateToEquipment={() => setActiveTab('equipment')}
              />
            )}

            {/* Tab: CRM & Pipeline de Negócios */}
            {activeTab === 'crm' && (
              <CRMBoard
                proposals={proposals}
                onSelectProposal={(prop) => setSelectedProposal(prop)}
                onOpenFollowUp={(prop) => setFollowUpModalProposal(prop)}
                onNewProposal={() => setActiveTab('calculator')}
                onUpdateStatus={handleUpdateStatus}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            )}

            {/* Tab: Generated Proposals List */}
            {activeTab === 'proposals' && (
              <div className="space-y-6">
                
                {/* Header and Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
                      <FileText className="w-6 h-6 text-amber-500" />
                      Propostas Fotovoltaicas Geradas
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Consulte, baixe PDFs timbrados, colete assinaturas ou envie mensagens no WhatsApp
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('calculator')}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Proposta</span>
                  </button>
                </div>

                {/* Search and Filters Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por cliente, número da proposta ou cidade..."
                      value={proposalsSearch}
                      onChange={(e) => setProposalsSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                    <select
                      value={proposalsStatusFilter}
                      onChange={(e) => setProposalsStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="all">Todos os Status ({proposals.length})</option>
                      <option value="novo">Novo</option>
                      <option value="contato">Em Contato</option>
                      <option value="proposta_enviada">Proposta Enviada</option>
                      <option value="negociacao">Em Negociação</option>
                      <option value="fechado_ganho">Fechado / Assinado</option>
                      <option value="fechado_perdido">Perdido</option>
                    </select>
                  </div>
                </div>

                {/* Proposals Grid / List */}
                {filteredProposalsList.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Nenhuma proposta encontrada</h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                      Não há propostas cadastradas com os filtros atuais. Crie uma nova proposta utilizando o dimensionador.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('calculator')}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Dimensionar Sistema
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProposalsList.map((proposal) => {
                      const isSigned = !!proposal.signature;

                      return (
                        <div
                          key={proposal.id}
                          className="bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400/50 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
                        >
                          <div>
                            {/* Proposal Top Meta */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                                {proposal.proposalNumber}
                              </span>
                              
                              {isSigned ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Assinada
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3" />
                                  Pendente
                                </span>
                              )}
                            </div>

                            {/* Client & Location */}
                            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition-colors">
                              {proposal.client.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {proposal.client.city} - {proposal.client.state} • {proposal.client.phone}
                            </p>

                            {/* Tech Summary Grid */}
                            <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Potência</span>
                                <span className="font-bold text-slate-800">{proposal.technical.systemPowerKwp} kWp</span>
                                <span className="text-[10px] text-slate-500 block">{proposal.technical.moduleCount} painéis</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Investimento</span>
                                <span className="font-bold text-slate-900">{formatCurrencyBRL(proposal.financial.totalInvestment)}</span>
                                <span className="text-[10px] text-emerald-600 font-semibold block">{formatCurrencyBRL(proposal.financial.monthlySavings)}/mês</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteProposal(proposal.id)}
                              title="Excluir proposta"
                              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setFollowUpModalProposal(proposal)}
                                title="Follow-up WhatsApp"
                                className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => generateProposalPDF(proposal)}
                                title="Baixar PDF Oficial"
                                className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedProposal(proposal)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* Tab: Equipment Manager (Client sets equipment and exact pricing) */}
            {activeTab === 'equipment' && (
              <EquipmentManager
                onNavigateToSizing={() => setActiveTab('calculator')}
              />
            )}

            {/* Tab: Payments History */}
            {activeTab === 'payments' && (
              <PaymentsTracker
                proposals={proposals}
                onUpdatePayment={handleUpdatePayment}
                onSelectProposal={(prop) => setSelectedProposal(prop)}
              />
            )}

            {/* Tab: Reports & Analytics */}
            {activeTab === 'reports' && (
              <ReportsDashboard
                proposals={proposals}
                onResetDefaults={handleResetDefaults}
              />
            )}
          </>
        )}

      </main>

      {/* Follow-up / WhatsApp Modal */}
      {followUpModalProposal && (
        <FollowUpModal
          proposal={followUpModalProposal}
          isOpen={!!followUpModalProposal}
          onClose={() => setFollowUpModalProposal(null)}
          onSaveFollowUp={handleSaveFollowUp}
        />
      )}

      {/* PWA Universal Auto-Installer & Assistant */}
      <PWAInstallBanner
        deferredPrompt={deferredPrompt}
        onInstalled={() => setDeferredPrompt(null)}
        isModalOpen={isPwaModalOpen}
        onCloseModal={() => setIsPwaModalOpen(false)}
      />

    </div>
  );
}
