import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { SolarProposal, FollowUpActivity } from '../types';
import { FOLLOW_UP_TEMPLATES } from '../data/solarDefaults';
import { formatCurrencyBRL } from '../utils/solarCalculations';
import { generateFollowUpMessage } from '../lib/solarAi';

interface FollowUpModalProps {
  proposal: SolarProposal;
  isOpen: boolean;
  onClose: () => void;
  onSaveFollowUp: (proposalId: string, activity: Omit<FollowUpActivity, 'id'>) => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onSaveFollowUp,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('apresentacao');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [activityType, setActivityType] = useState<FollowUpActivity['type']>('whatsapp');
  const [activityNotes, setActivityNotes] = useState<string>('');
  const [nextDate, setNextDate] = useState<string>('');
  const [objectionText, setObjectionText] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Initialize or update message when template changes
  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = FOLLOW_UP_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    let msg = tmpl.template
      .replace(/{nome}/g, proposal.client.name)
      .replace(/{cidade}/g, proposal.client.city)
      .replace(/{potencia}/g, `${proposal.technical.systemPowerKwp}`)
      .replace(/{economia_mensal}/g, formatCurrencyBRL(proposal.financial.monthlySavings))
      .replace(/{investimento}/g, formatCurrencyBRL(proposal.financial.totalInvestment))
      .replace(/{validade}/g, new Date(proposal.validUntil).toLocaleDateString('pt-BR'));

    setCustomMessage(msg);
  };

  React.useEffect(() => {
    if (isOpen) {
      applyTemplate('apresentacao');
      setActivityNotes('');
      setObjectionText('');
      setSavedSuccess(false);
    }
  }, [isOpen, proposal]);

  // AI Generator
  const handleGenerateAiMessage = async () => {
    setIsGeneratingAi(true);
    try {
      const msg = await generateFollowUpMessage({
        clientName: proposal.client.name,
        daysSinceSent: Math.max(Math.floor((Date.now() - new Date(proposal.createdAt).getTime()) / (1000 * 60 * 60 * 24)), 1),
        proposalValue: proposal.financial.totalInvestment,
        status: proposal.status,
        objection: objectionText || undefined,
        systemKwp: proposal.technical.systemPowerKwp,
        monthlySavings: proposal.financial.monthlySavings,
      });
      setCustomMessage(msg);
    } catch {
      // Fallback
      setCustomMessage(
        `Olá ${proposal.client.name}! Analisando o seu projeto de ${proposal.technical.systemPowerKwp} kWp, conseguimos uma condição bancária sem entrada onde a economia de ${formatCurrencyBRL(proposal.financial.monthlySavings)}/mês já cobre a parcela. Podemos conversar 3 minutos hoje para tirar qualquer dúvida?`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Launch WhatsApp
  const handleLaunchWhatsApp = () => {
    const phone = proposal.client.phone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank');

    // Auto-record activity
    onSaveFollowUp(proposal.id, {
      date: new Date().toISOString(),
      type: 'whatsapp',
      summary: `Mensagem de follow-up enviada via WhatsApp (${FOLLOW_UP_TEMPLATES.find(t => t.id === selectedTemplateId)?.title || 'Personalizada'}).`,
      nextFollowUpDate: nextDate || undefined,
      author: 'Consultor Solar',
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Save interaction without opening external app
  const handleSaveActivityOnly = () => {
    if (!activityNotes.trim() && !customMessage.trim()) return;

    onSaveFollowUp(proposal.id, {
      date: new Date().toISOString(),
      type: activityType,
      summary: activityNotes.trim() || `Follow-up registrado: "${customMessage.slice(0, 100)}..."`,
      nextFollowUpDate: nextDate || undefined,
      author: 'Consultor Solar',
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">CRM & Follow-up Automatizado</h3>
              <p className="text-xs text-slate-400">Cliente: {proposal.client.name} • {proposal.technical.systemPowerKwp} kWp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Cadence Templates */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Selecione o Momento do Follow-up (Cadência Automatizada)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FOLLOW_UP_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyTemplate(tmpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-500 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{tmpl.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{tmpl.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Script Assistant based on objections */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider">IA Assistente de Objeções</span>
              </div>
              <button
                type="button"
                id="btn-ai-followup"
                onClick={handleGenerateAiMessage}
                disabled={isGeneratingAi}
                className="text-xs font-bold px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isGeneratingAi ? 'Gerando Script...' : 'Personalizar com IA'}
              </button>
            </div>

            <input
              type="text"
              value={objectionText}
              onChange={(e) => setObjectionText(e.target.value)}
              placeholder="Ex: Achou a parcela alta, prefere esperar, comparando com outro integrador..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
            />
          </div>

          {/* Formatted Message Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mensagem Pronta para WhatsApp *</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {proposal.client.phone}
              </span>
            </div>
            <textarea
              rows={6}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 font-mono leading-relaxed"
            />
          </div>

          {/* Activity Logger Fields */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <span>Registrar no Histórico do Lead</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Canal de Contato
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as FollowUpActivity['type'])}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium bg-white"
                >
                  <option value="whatsapp">WhatsApp Comercial</option>
                  <option value="ligacao">Ligação Telefônica</option>
                  <option value="reuniao">Visita Técnica / Reunião</option>
                  <option value="email">E-mail</option>
                  <option value="nota">Nota Interna</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Agendar Próximo Contato (Opcional)
                </label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Resumo da Conversa / Anotações do Consultor
              </label>
              <input
                type="text"
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                placeholder="Ex: Cliente elogiou os módulos LONGi, vai mostrar ao sócio hoje à noite."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Follow-up registrado com sucesso no histórico do CRM!</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-save-note-only"
              onClick={handleSaveActivityOnly}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all"
            >
              Apenas Registrar Nota
            </button>

            <button
              type="button"
              id="btn-launch-whatsapp"
              onClick={handleLaunchWhatsApp}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Disparar WhatsApp & Salvar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
