import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  ShieldCheck, 
  Calendar, 
  User, 
  MapPin, 
  Zap, 
  CheckCircle, 
  Clock, 
  FileText, 
  ArrowLeft,
  DollarSign,
  Building,
  Check,
  Send
} from 'lucide-react';
import { SolarProposal, DigitalSignatureData } from '../types';
import { generateProposalPDF } from '../utils/pdfGenerator';
import { formatCurrencyBRL, formatNumberBR } from '../utils/solarCalculations';
import { DigitalSignatureModal } from './DigitalSignatureModal';

interface ProposalViewerProps {
  proposal: SolarProposal;
  onBack: () => void;
  onSignProposal: (proposalId: string, signature: DigitalSignatureData) => void;
  onOpenFollowUp: (proposal: SolarProposal) => void;
}

export const ProposalViewer: React.FC<ProposalViewerProps> = ({
  proposal,
  onBack,
  onSignProposal,
  onOpenFollowUp,
}) => {
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownloadPDF = () => {
    generateProposalPDF(proposal);
  };

  const handleSendWhatsApp = () => {
    const phone = proposal.client.phone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;
    const text = encodeURIComponent(
      `Olá ${proposal.client.name}! ☀️\n\nSegue o resumo da sua proposta técnica fotovoltaica de ${proposal.technical.systemPowerKwp} kWp:\n\n• Economia Mensal Estimada: ${formatCurrencyBRL(proposal.financial.monthlySavings)}\n• Economia em 25 anos: ${formatCurrencyBRL(proposal.financial.twentyFiveYearSavings)}\n• Retorno do investimento (Payback): ${proposal.financial.paybackYears} anos\n• Equipamentos Tier 1: ${proposal.technical.moduleCount} módulos ${proposal.technical.module.brand} (${proposal.technical.module.powerWp}W) + Inversor ${proposal.technical.inverter.brand}\n\nVocê pode assinar digitalmente e garantir as condições especiais! Abraços da equipe CAST Solar.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleCopySummary = () => {
    const summary = `Proposta CAST SolarPro - ${proposal.proposalNumber}\nCliente: ${proposal.client.name}\nPotência: ${proposal.technical.systemPowerKwp} kWp\nEconomia: ${formatCurrencyBRL(proposal.financial.monthlySavings)}/mês\nInvestimento: ${formatCurrencyBRL(proposal.financial.totalInvestment)}`;
    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isSigned = !!proposal.signature;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-copy-summary"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copiado!' : 'Copiar Resumo'}</span>
          </button>

          <button
            type="button"
            id="btn-send-whatsapp"
            onClick={handleSendWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            type="button"
            id="btn-open-followup"
            onClick={() => onOpenFollowUp(proposal)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Follow-up</span>
          </button>

          {!isSigned && (
            <button
              type="button"
              id="btn-sign-proposal"
              onClick={() => setIsSignModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Assinar Digitalmente</span>
            </button>
          )}

          <button
            type="button"
            id="btn-download-pdf"
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Baixar PDF Oficial</span>
          </button>
        </div>
      </div>

      {/* Main Proposal Sheet (A4 format style) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        
        {/* Proposal Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 border-b-4 border-amber-500 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                Proposta Técnica e Comercial
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mt-1">
                {proposal.proposalNumber}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                CAST Solar Engenharia & Soluções Fotovoltaicas • CNPJ: 42.189.900/0001-30
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Emitido em: {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Válido até: {new Date(proposal.validUntil).toLocaleDateString('pt-BR')}</span>
              </div>
              {isSigned ? (
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3 h-3" /> Assinada Digitalmente
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Aguardando Assinatura
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Client & Installation Info Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              Dados do Cliente & Instalação
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Cliente Contratante</span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">{proposal.client.name}</span>
                <span className="text-slate-500">{proposal.client.document || 'Documento não informado'}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Localização</span>
                <span className="font-bold text-slate-900 block mt-0.5">{proposal.client.city} - {proposal.client.state}</span>
                <span className="text-slate-500">{proposal.client.address}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Concessionária de Energia</span>
                <span className="font-bold text-slate-900 block mt-0.5">{proposal.client.concessionaire}</span>
                <span className="text-slate-500">{proposal.client.consumerUnit ? `UC: ${proposal.client.consumerUnit}` : 'Ligação em baixa tensão'}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Contato & WhatsApp</span>
                <span className="font-bold text-slate-900 block mt-0.5">{proposal.client.phone}</span>
                <span className="text-slate-500">{proposal.client.email || 'Email não cadastrado'}</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          {proposal.executiveSummary && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                Apresentação Executiva do Projeto
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {proposal.executiveSummary}
              </p>
            </div>
          )}

          {/* Sizing & Engineering Card */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              1. Dimensionamento do Sistema Fotovoltaico
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Potência Pico</span>
                <span className="text-xl font-bold text-slate-900 block mt-1">{proposal.technical.systemPowerKwp} kWp</span>
                <span className="text-[10px] text-slate-500">Capacidade geradora</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Módulos Fotovoltaicos</span>
                <span className="text-xl font-bold text-slate-900 block mt-1">{proposal.technical.moduleCount} painéis</span>
                <span className="text-[10px] text-slate-500">{proposal.technical.module.powerWp}W {proposal.technical.module.brand}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Geração Estimada</span>
                <span className="text-xl font-bold text-amber-600 block mt-1">{formatNumberBR(proposal.financial.monthlyAverageGenerationKwh)} kWh</span>
                <span className="text-[10px] text-slate-500">Média mensal</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Área & Telhado</span>
                <span className="text-xl font-bold text-slate-900 block mt-1">{proposal.technical.areaM2} m²</span>
                <span className="text-[10px] text-slate-500">Telha {proposal.technical.roofType}</span>
              </div>
            </div>

            {/* Equipments Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Componente</th>
                    <th className="p-3">Fabricante & Modelo</th>
                    <th className="p-3">Quantidade</th>
                    <th className="p-3">Garantia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  <tr>
                    <td className="p-3 font-medium text-slate-900">Módulos Fotovoltaicos Tier 1</td>
                    <td className="p-3">{proposal.technical.module.brand} {proposal.technical.module.model}</td>
                    <td className="p-3">{proposal.technical.moduleCount} unidades ({proposal.technical.module.powerWp}W)</td>
                    <td className="p-3 font-semibold text-emerald-700">{proposal.technical.module.warrantyYears} anos linear</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">Inversor Interativo Inteligente</td>
                    <td className="p-3">{proposal.technical.inverter.brand} {proposal.technical.inverter.model}</td>
                    <td className="p-3">1 unidade ({proposal.technical.inverter.powerKw} kW)</td>
                    <td className="p-3 font-semibold text-emerald-700">{proposal.technical.inverter.warrantyYears} anos de fábrica</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">Estrutura de Fixação</td>
                    <td className="p-3">Alumínio Anodizado e Inox para telhado {proposal.technical.roofType}</td>
                    <td className="p-3">Kit completo para {proposal.technical.moduleCount} módulos</td>
                    <td className="p-3 font-semibold text-emerald-700">12 anos contra corrosão</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">Engenharia & Homologação</td>
                    <td className="p-3">Projeto elétrico, ART/TRT no CREA e vistoria da concessionária</td>
                    <td className="p-3">Serviço Turnkey Integral</td>
                    <td className="p-3 font-semibold text-emerald-700">5 anos de garantia de instalação</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Return Card */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              2. Retorno Financeiro & Economia Projetada
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-800 block">Economia Média Mensal</span>
                <span className="text-2xl font-black text-emerald-700 block mt-1">
                  {formatCurrencyBRL(proposal.financial.monthlySavings)}
                </span>
                <span className="text-[10px] text-emerald-600">Redução de até 95% na conta</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-800 block">Economia no 1º Ano</span>
                <span className="text-2xl font-black text-emerald-700 block mt-1">
                  {formatCurrencyBRL(proposal.financial.annualSavings)}
                </span>
                <span className="text-[10px] text-emerald-600">Total poupado em 12 meses</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-semibold text-amber-800 block">Economia em 25 Anos</span>
                <span className="text-2xl font-black text-amber-900 block mt-1">
                  {formatCurrencyBRL(proposal.financial.twentyFiveYearSavings)}
                </span>
                <span className="text-[10px] text-amber-700">Considerando inflação da energia</span>
              </div>
            </div>
          </div>

          {/* Investment & Payment Terms */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                  Investimento Total do Sistema (Turnkey)
                </span>
                <div className="text-3xl font-black font-display text-white mt-1">
                  {formatCurrencyBRL(proposal.financial.totalInvestment)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Inclui equipamentos, estruturas, cabos solares, engenharia com ART e homologação.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Payback Estimado:</span>
                <span className="text-2xl font-extrabold text-amber-400">{proposal.financial.paybackYears} anos</span>
                <span className="text-xs text-slate-400 block">(apenas ~{proposal.financial.paybackMonths} meses)</span>
              </div>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs font-bold text-amber-400 block">Opção 1: À Vista com 5% de Desconto</span>
                <span className="text-xl font-bold text-white block mt-1">
                  {formatCurrencyBRL(Math.round(proposal.financial.totalInvestment * 0.95))}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Sinal no aceite + saldo na entrega dos equipamentos.
                </span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs font-bold text-amber-400 block">Opção 2: Financiamento Solar Bancário</span>
                <span className="text-xl font-bold text-white block mt-1">
                  72x de ~{formatCurrencyBRL(Math.round((proposal.financial.totalInvestment * 1.58) / 72))}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Sem entrada • Carência de até 90 dias • Substitui a fatura de luz!
                </span>
              </div>
            </div>
          </div>

          {/* Digital Signature Box */}
          <div className="pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              3. Autenticação & Assinatura Digital
            </h2>

            {isSigned && proposal.signature ? (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">Documento Assinado Digitalmente</h4>
                      <p className="text-xs text-emerald-800">
                        Autenticado via CAST Solar Certificate • Em conformidade com a MP 2.200-2/2001
                      </p>
                    </div>
                  </div>

                  <div className="px-3 py-1 bg-emerald-200/80 text-emerald-950 text-xs font-mono font-bold rounded-lg border border-emerald-300">
                    HASH: {proposal.signature.validationHash}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Signatário</span>
                    <span className="font-bold text-slate-900 block">{proposal.signature.signedBy}</span>
                    <span className="text-slate-500">Documento: {proposal.signature.documentNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Data e Horário</span>
                    <span className="font-bold text-slate-900 block">
                      {new Date(proposal.signature.signedAt).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-slate-500">{proposal.signature.ipAddress}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Rubrica Registrada</span>
                    <div className="mt-1 p-2 bg-white rounded-lg border border-emerald-200 inline-block">
                      <img 
                        src={proposal.signature.signatureDataUrl} 
                        alt="Assinatura" 
                        className="h-10 max-w-[140px] object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Esta proposta ainda não foi assinada</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Colete a assinatura digital do seu cliente diretamente na tela do tablet, celular ou computador com validade legal e carimbo de tempo.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-sign-prompt"
                  onClick={() => setIsSignModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Assinar Proposta Agora</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Signature Modal */}
      <DigitalSignatureModal
        proposal={proposal}
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirmSignature={(sig) => onSignProposal(proposal.id, sig)}
      />

    </div>
  );
};
