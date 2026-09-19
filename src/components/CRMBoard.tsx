import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Send, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Kanban, 
  List, 
  Sparkles, 
  Calendar,
  Layers,
  ArrowRight,
  User,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { SolarProposal, LeadStatus } from '../types';
import { CRM_STAGES } from '../data/solarDefaults';
import { formatCurrencyBRL } from '../utils/solarCalculations';

interface CRMBoardProps {
  proposals: SolarProposal[];
  onSelectProposal: (proposal: SolarProposal) => void;
  onOpenFollowUp: (proposal: SolarProposal) => void;
  onNewProposal: () => void;
  onUpdateStatus: (proposalId: string, newStatus: LeadStatus) => void;
}

export const CRMBoard: React.FC<CRMBoardProps> = ({
  proposals,
  onSelectProposal,
  onOpenFollowUp,
  onNewProposal,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Mobile Stage Filter state (defaults to 'all' or specific stage so no sliding is needed)
  const [mobileSelectedStage, setMobileSelectedStage] = useState<string>('all');

  // Filter proposals by search and state
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchSearch = 
        p.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchState = selectedStateFilter === 'all' || p.client.state === selectedStateFilter;

      return matchSearch && matchState;
    });
  }, [proposals, searchTerm, selectedStateFilter]);

  // Aggregate metrics
  const totalPipelineValue = useMemo(() => {
    return proposals.reduce((acc, p) => acc + p.financial.totalInvestment, 0);
  }, [proposals]);

  const totalWonValue = useMemo(() => {
    return proposals
      .filter(p => p.status === 'assinado' || p.status === 'instalacao' || p.status === 'concluido')
      .reduce((acc, p) => acc + p.financial.totalInvestment, 0);
  }, [proposals]);

  const totalKwp = useMemo(() => {
    return proposals.reduce((acc, p) => acc + p.technical.systemPowerKwp, 0);
  }, [proposals]);

  // Move proposal stage forward or backward
  const handleMoveStage = (proposalId: string, currentStatus: LeadStatus, direction: 'prev' | 'next') => {
    const currentIndex = CRM_STAGES.findIndex(s => s.id === currentStatus);
    if (currentIndex < 0) return;

    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < CRM_STAGES.length) {
      onUpdateStatus(proposalId, CRM_STAGES[newIndex].id);
    }
  };

  // Switch mobile stage
  const handleStepMobileStage = (direction: 'prev' | 'next') => {
    const allOptions = ['all', ...CRM_STAGES.map(s => s.id)];
    const currentIndex = allOptions.indexOf(mobileSelectedStage);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < allOptions.length) {
      setMobileSelectedStage(allOptions[newIndex]);
    }
  };

  const currentMobileStageObj = CRM_STAGES.find(s => s.id === mobileSelectedStage);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Banner & Pipeline KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Total em Pipeline
          </span>
          <div className="text-base sm:text-xl font-black text-slate-900 font-display">
            {formatCurrencyBRL(totalPipelineValue)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5">
            {proposals.length} propostas
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Vendas Fechadas
          </span>
          <div className="text-base sm:text-xl font-black text-emerald-600 font-display">
            {formatCurrencyBRL(totalWonValue)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold block mt-0.5">
            {proposals.filter(p => p.status === 'assinado' || p.status === 'instalacao' || p.status === 'concluido').length} projetos ganhos
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Potência Solar
          </span>
          <div className="flex items-baseline gap-1 text-base sm:text-xl font-black text-amber-600 font-display">
            <span>{totalKwp.toFixed(1)}</span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700">kWp</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5">
            Volume total orçado
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Taxa de Conversão
          </span>
          <div className="text-base sm:text-xl font-black text-slate-900 font-display">
            {proposals.length > 0
              ? `${Math.round((proposals.filter(p => p.status === 'assinado' || p.status === 'instalacao' || p.status === 'concluido').length / proposals.length) * 100)}%`
              : '0%'}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5">
            Eficiência de conversão
          </span>
        </div>
      </div>

      {/* Control Ribbon: Search, View Switcher & New Proposal */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="crm-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, proposta..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
            />
          </div>

          <select
            id="crm-state-filter"
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
            className="px-2 py-2 text-xs rounded-xl border border-slate-300 font-medium bg-white shrink-0"
          >
            <option value="all">Todos UF</option>
            <option value="SP">SP</option>
            <option value="MG">MG</option>
            <option value="GO">GO</option>
            <option value="PR">PR</option>
            <option value="BA">BA</option>
            <option value="RJ">RJ</option>
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              id="btn-view-kanban"
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Etapas</span>
            </button>
            <button
              type="button"
              id="btn-view-list"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'list' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          <button
            type="button"
            id="btn-crm-new"
            onClick={onNewProposal}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>

      {/* MOBILE-OPTIMIZED STAGE SELECTOR (Zero horizontal scroll needed) */}
      <div className="md:hidden bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Etapa Comercial:</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleStepMobileStage('prev')}
              disabled={mobileSelectedStage === 'all'}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Etapa anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleStepMobileStage('next')}
              disabled={mobileSelectedStage === CRM_STAGES[CRM_STAGES.length - 1].id}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Próxima etapa"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Stage Dropdown with Count Badges */}
        <select
          value={mobileSelectedStage}
          onChange={(e) => setMobileSelectedStage(e.target.value)}
          className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        >
          <option value="all">
            📂 Todas as Etapas ({filteredProposals.length} propostas • {formatCurrencyBRL(totalPipelineValue)})
          </option>
          {CRM_STAGES.map((st, idx) => {
            const count = filteredProposals.filter(p => p.status === st.id).length;
            const stageVal = filteredProposals.filter(p => p.status === st.id).reduce((acc, p) => acc + p.financial.totalInvestment, 0);
            return (
              <option key={st.id} value={st.id}>
                {idx + 1}. {st.label} ({count} • {formatCurrencyBRL(stageVal)})
              </option>
            );
          })}
        </select>
      </div>

      {/* MOBILE STAGE VIEW (Displayed vertically at 100% width without sideways sliding) */}
      <div className="md:hidden space-y-4">
        {(mobileSelectedStage === 'all' ? CRM_STAGES : CRM_STAGES.filter(s => s.id === mobileSelectedStage)).map((stage) => {
          const stageProposals = filteredProposals.filter(p => p.status === stage.id);
          const stageTotal = stageProposals.reduce((acc, p) => acc + p.financial.totalInvestment, 0);

          if (mobileSelectedStage === 'all' && stageProposals.length === 0) {
            return null; // Skip empty stages when viewing all on mobile
          }

          return (
            <div key={stage.id} className="bg-slate-100/90 rounded-2xl border border-slate-200 p-3.5 space-y-3">
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{stage.label}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                    {stageProposals.length}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {formatCurrencyBRL(stageTotal)}
                </span>
              </div>

              {/* Cards list */}
              {stageProposals.length === 0 ? (
                <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                  Nenhum projeto nesta etapa no momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {stageProposals.map((proposal) => {
                    const daysSince = Math.floor((Date.now() - new Date(proposal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                    const needsFollowUp = daysSince >= 3 && proposal.status !== 'assinado' && proposal.status !== 'concluido';

                    return (
                      <div
                        key={proposal.id}
                        id={`mob-card-${proposal.id}`}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2.5"
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {proposal.proposalNumber}
                          </span>
                          {proposal.signature ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Assinada
                            </span>
                          ) : needsFollowUp ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Follow-up {daysSince}d
                            </span>
                          ) : null}
                        </div>

                        {/* Client details */}
                        <div className="cursor-pointer" onClick={() => onSelectProposal(proposal)}>
                          <h4 className="text-xs font-bold text-slate-900 hover:text-amber-600 transition-colors">
                            {proposal.client.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {proposal.client.city} - {proposal.client.state} • {proposal.client.phone}
                          </p>
                        </div>

                        {/* System & Financial specs */}
                        <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[9px]">Potência</span>
                            <span className="font-bold text-slate-800">{proposal.technical.systemPowerKwp} kWp</span>
                            <span className="text-[10px] text-slate-500 block">{proposal.technical.moduleCount} painéis</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">Investimento</span>
                            <span className="font-bold text-slate-900">{formatCurrencyBRL(proposal.financial.totalInvestment)}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold block">{formatCurrencyBRL(proposal.financial.monthlySavings)}/mês</span>
                          </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveStage(proposal.id, proposal.status, 'prev')}
                              disabled={stage.id === 'novo_lead'}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-0.5 disabled:opacity-30"
                              title="Voltar etapa"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span>Voltar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStage(proposal.id, proposal.status, 'next')}
                              disabled={stage.id === 'concluido'}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-0.5 disabled:opacity-30"
                              title="Avançar etapa"
                            >
                              <span>Avançar</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenFollowUp(proposal)}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="WhatsApp e Follow-up"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectProposal(proposal)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold transition-colors"
                            >
                              Ver Proposta
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP KANBAN BOARD VIEW (Visible only on md/lg desktop screens) */}
      <div className="hidden md:block">
        {viewMode === 'kanban' ? (
          <div className="overflow-x-auto pb-4 scrollbar-thin">
            <div className="flex gap-4 min-w-[1250px]">
              {CRM_STAGES.map((stage) => {
                const stageProposals = filteredProposals.filter(p => p.status === stage.id);
                const stageTotal = stageProposals.reduce((acc, p) => acc + p.financial.totalInvestment, 0);

                return (
                  <div 
                    key={stage.id} 
                    className="w-80 shrink-0 bg-slate-100/90 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col max-h-[75vh]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{stage.label}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                          {stageProposals.length}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">
                        {formatCurrencyBRL(stageTotal)}
                      </span>
                    </div>

                    {/* Deals List */}
                    <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                      {stageProposals.length === 0 ? (
                        <div className="h-28 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs text-center p-3">
                          Nenhum projeto nesta etapa
                        </div>
                      ) : (
                        stageProposals.map((proposal) => {
                          const daysSince = Math.floor((Date.now() - new Date(proposal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                          const needsFollowUp = daysSince >= 3 && proposal.status !== 'assinado' && proposal.status !== 'concluido';

                          return (
                            <div
                              key={proposal.id}
                              id={`deal-card-${proposal.id}`}
                              className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-amber-400 shadow-sm transition-all group hover:shadow-md space-y-2.5"
                            >
                              {/* Card Top: Code & Badges */}
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                  {proposal.proposalNumber}
                                </span>
                                {proposal.signature ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Assinada
                                  </span>
                                ) : needsFollowUp ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Follow-up {daysSince}d
                                  </span>
                                ) : null}
                              </div>

                              {/* Client Name & City */}
                              <div className="cursor-pointer" onClick={() => onSelectProposal(proposal)}>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                                  {proposal.client.name}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  {proposal.client.city} - {proposal.client.state}
                                </p>
                              </div>

                              {/* Sizing & Investment Summary */}
                              <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block text-[9px]">Potência</span>
                                  <span className="font-bold text-slate-800">{proposal.technical.systemPowerKwp} kWp</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px]">Investimento</span>
                                  <span className="font-bold text-slate-900">{formatCurrencyBRL(proposal.financial.totalInvestment)}</span>
                                </div>
                              </div>

                              {/* Savings Tag */}
                              <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold px-1">
                                <span>Economia mensal:</span>
                                <span>{formatCurrencyBRL(proposal.financial.monthlySavings)}/mês</span>
                              </div>

                              {/* Interactive Action Footer */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                {/* Stage shifter arrows */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    title="Etapa anterior"
                                    onClick={() => handleMoveStage(proposal.id, proposal.status, 'prev')}
                                    disabled={stage.id === 'novo_lead'}
                                    className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Próxima etapa"
                                    onClick={() => handleMoveStage(proposal.id, proposal.status, 'next')}
                                    disabled={stage.id === 'concluido'}
                                    className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    title="Follow-up e WhatsApp"
                                    onClick={() => onOpenFollowUp(proposal)}
                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    title="Visualizar Proposta"
                                    onClick={() => onSelectProposal(proposal)}
                                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Desktop Table View */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Proposta / Data</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Cidade/UF</th>
                  <th className="p-3.5">Potência</th>
                  <th className="p-3.5">Investimento</th>
                  <th className="p-3.5">Economia/mês</th>
                  <th className="p-3.5">Etapa Comercial</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600">
                {filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Nenhuma proposta encontrada com esses filtros.
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((proposal) => {
                    const currentStage = CRM_STAGES.find(s => s.id === proposal.status);
                    return (
                      <tr key={proposal.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-slate-900 block">{proposal.proposalNumber}</span>
                          <span className="text-[10px] text-slate-400">{new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {proposal.client.name}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {proposal.client.city} - {proposal.client.state}
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {proposal.technical.systemPowerKwp} kWp
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {formatCurrencyBRL(proposal.financial.totalInvestment)}
                        </td>
                        <td className="p-3.5 font-semibold text-emerald-600">
                          {formatCurrencyBRL(proposal.financial.monthlySavings)}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {currentStage?.label || proposal.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenFollowUp(proposal)}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Follow-up WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectProposal(proposal)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                            >
                              Ver
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
