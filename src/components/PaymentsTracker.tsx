import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  QrCode, 
  DollarSign, 
  Calendar, 
  Copy, 
  Check, 
  X, 
  Plus, 
  FileText,
  Building,
  Download,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { SolarProposal, PaymentInstallment } from '../types';
import { formatCurrencyBRL } from '../utils/solarCalculations';

interface PaymentsTrackerProps {
  proposals: SolarProposal[];
  onUpdatePayment: (proposalId: string, payment: PaymentInstallment) => void;
  onSelectProposal: (proposal: SolarProposal) => void;
}

export const PaymentsTracker: React.FC<PaymentsTrackerProps> = ({
  proposals,
  onUpdatePayment,
  onSelectProposal,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'pago' | 'atrasado'>('all');
  const [selectedPaymentForPay, setSelectedPaymentForPay] = useState<{
    proposal: SolarProposal;
    installment: PaymentInstallment;
  } | null>(null);

  const [pixModalData, setPixModalData] = useState<{
    proposal: SolarProposal;
    installment: PaymentInstallment;
    pixCode: string;
  } | null>(null);

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentInstallment['method']>('pix');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  // Flatten all installments with proposal references
  const allInstallments = useMemo(() => {
    const list: { proposal: SolarProposal; installment: PaymentInstallment }[] = [];
    proposals.forEach((prop) => {
      (prop.payments || []).forEach((inst) => {
        list.push({ proposal: prop, installment: inst });
      });
    });
    return list;
  }, [proposals]);

  // Aggregate totals
  const totalBilled = useMemo(() => {
    return allInstallments.reduce((acc, item) => acc + item.installment.amount, 0);
  }, [allInstallments]);

  const totalReceived = useMemo(() => {
    return allInstallments
      .filter(item => item.installment.status === 'pago')
      .reduce((acc, item) => acc + item.installment.amount, 0);
  }, [allInstallments]);

  const totalPending = totalBilled - totalReceived;

  // Filter list
  const filteredList = useMemo(() => {
    return allInstallments.filter(item => {
      if (filterStatus === 'all') return true;
      return item.installment.status === filterStatus;
    });
  }, [allInstallments, filterStatus]);

  // Handle Mark as Paid
  const handleConfirmPayment = () => {
    if (!selectedPaymentForPay) return;

    const updatedInstallment: PaymentInstallment = {
      ...selectedPaymentForPay.installment,
      status: 'pago',
      paidAt: paymentDate,
      method: paymentMethod,
      receiptNumber: receiptNumber || `REC-${Date.now().toString().slice(-6)}`,
    };

    onUpdatePayment(selectedPaymentForPay.proposal.id, updatedInstallment);
    setSelectedPaymentForPay(null);
    setReceiptNumber('');
  };

  // Open PIX Modal
  const handleOpenPixModal = (prop: SolarProposal, inst: PaymentInstallment) => {
    const pixCode = `00020126580014br.gov.bcb.pix0136solarpro@engenhariasolar.com.br520400005303986540${inst.amount.toFixed(2)}5802BR5925SOLARPRO ENGENHARIA6009SAO PAULO62070503***6304`;
    setPixModalData({
      proposal: prop,
      installment: inst,
      pixCode,
    });
    setCopiedPix(false);
  };

  const handleCopyPix = () => {
    if (!pixModalData) return;
    navigator.clipboard.writeText(pixModalData.pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Financial Health KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Total Faturado
          </span>
          <div className="text-base sm:text-xl font-black text-slate-900 font-display">
            {formatCurrencyBRL(totalBilled)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5">
            {allInstallments.length} parcelas
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Total Recebido
          </span>
          <div className="text-base sm:text-xl font-black text-emerald-600 font-display">
            {formatCurrencyBRL(totalReceived)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold block mt-0.5">
            {allInstallments.filter(i => i.installment.status === 'pago').length} pagas
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Saldo a Receber
          </span>
          <div className="text-base sm:text-xl font-black text-amber-600 font-display">
            {formatCurrencyBRL(totalPending)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5">
            Contratos ativos
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Taxa de Liquidação
          </span>
          <div className="text-base sm:text-xl font-black text-slate-900 font-display">
            {totalBilled > 0 ? `${Math.round((totalReceived / totalBilled) * 100)}%` : '0%'}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5">
            Fluxo saudável
          </span>
        </div>
      </div>

      {/* Filter Tabs (Responsive wrap without horizontal overflow) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          {[
            { id: 'all', label: 'Todas as Parcelas' },
            { id: 'pendente', label: 'Pendentes' },
            { id: 'pago', label: 'Pagas' },
            { id: 'atrasado', label: 'Atrasadas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-center ${
                filterStatus === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          Mostrando {filteredList.length} parcelas
        </span>
      </div>

      {/* MOBILE VIEW: Responsive Cards (Zero horizontal scroll) */}
      <div className="md:hidden space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Nenhuma parcela encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredList.map(({ proposal, installment }) => {
            const isPaid = installment.status === 'pago';
            const isOverdue = installment.status === 'atrasado' || 
              (!isPaid && new Date(installment.dueDate).getTime() < Date.now());

            return (
              <div 
                key={installment.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
              >
                {/* Card Header: Client & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div 
                    className="cursor-pointer group"
                    onClick={() => onSelectProposal(proposal)}
                  >
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-600 transition-colors">
                      {proposal.client.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {proposal.proposalNumber} • {proposal.client.city}
                    </span>
                  </div>

                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Pago
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 shrink-0">
                      <AlertCircle className="w-3 h-3" /> Atrasado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      <Clock className="w-3 h-3" /> Pendente
                    </span>
                  )}
                </div>

                {/* Description & Value block */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Etapa / Parcela</span>
                    <span className="font-bold text-slate-800">{installment.description}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Valor</span>
                    <span className="font-bold text-slate-900 text-sm">{formatCurrencyBRL(installment.amount)}</span>
                  </div>
                </div>

                {/* Date & Payment method detail */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vencimento: <b>{new Date(installment.dueDate).toLocaleDateString('pt-BR')}</b></span>
                  </div>
                  {isPaid && installment.paidAt && (
                    <span className="text-emerald-700 font-semibold">
                      Pago em: {new Date(installment.paidAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPixModal(proposal, installment)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-600" />
                    <span>PIX QR Code</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentForPay({ proposal, installment })}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 active:scale-95"
                      >
                        Quitar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectProposal(proposal)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                      title="Ver proposta"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: Structured Table (Hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Cliente / Proposta</th>
              <th className="p-3.5">Descrição da Parcela</th>
              <th className="p-3.5">Vencimento</th>
              <th className="p-3.5">Valor (R$)</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Forma</th>
              <th className="p-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-600">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Nenhuma parcela encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredList.map(({ proposal, installment }) => {
                const isPaid = installment.status === 'pago';
                const isOverdue = installment.status === 'atrasado' || 
                  (!isPaid && new Date(installment.dueDate).getTime() < Date.now());

                return (
                  <tr key={installment.id} className="hover:bg-slate-50 transition-colors">
                    {/* Client */}
                    <td className="p-3.5">
                      <div 
                        className="cursor-pointer group"
                        onClick={() => onSelectProposal(proposal)}
                      >
                        <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors block">
                          {proposal.client.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {proposal.proposalNumber}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="p-3.5 font-medium text-slate-800">
                      {installment.description}
                    </td>

                    {/* Due Date */}
                    <td className="p-3.5">
                      <span className="text-slate-700 font-medium">
                        {new Date(installment.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 font-bold text-slate-900 text-sm">
                      {formatCurrencyBRL(installment.amount)}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Pago
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle className="w-3 h-3" /> Atrasado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </td>

                    {/* Method */}
                    <td className="p-3.5 uppercase font-medium text-slate-500 text-[10px]">
                      {installment.method || 'PIX'}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPixModal(proposal, installment)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Gerar PIX Copia e Cola / QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {!isPaid ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentForPay({ proposal, installment })}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-colors"
                          >
                            Dar Baixa
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold pr-2">
                            ✓ Liquidado
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mark As Paid Modal */}
      {selectedPaymentForPay && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Registrar Liquidação de Parcela</h3>
              </div>
              <button 
                onClick={() => setSelectedPaymentForPay(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <p className="text-slate-500">Cliente: <b className="text-slate-900">{selectedPaymentForPay.proposal.client.name}</b></p>
              <p className="text-slate-500">Etapa: <b className="text-slate-900">{selectedPaymentForPay.installment.description}</b></p>
              <p className="text-slate-500">Valor a liquidar: <b className="text-emerald-600 text-sm">{formatCurrencyBRL(selectedPaymentForPay.installment.amount)}</b></p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data do Pagamento *</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Forma de Pagamento *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                >
                  <option value="pix">PIX Instantâneo</option>
                  <option value="ted">TED / Transferência Bancária</option>
                  <option value="boleto">Boleto Bancário Quitado</option>
                  <option value="financiamento">Liberação de Financiamento Bancário</option>
                  <option value="cartao">Cartão de Crédito / Débito</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número do Comprovante / Autenticação</label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Ex: DOC-9876251 ou ID Transação PIX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentForPay(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIX QR Code & Copia e Cola Modal */}
      {pixModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                PIX Recebimento Imediato
              </span>
              <button onClick={() => setPixModalData(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Valor da Parcela:</span>
              <span className="text-2xl font-black text-slate-900 font-display">
                {formatCurrencyBRL(pixModalData.installment.amount)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {pixModalData.proposal.client.name} • {pixModalData.installment.description}
              </span>
            </div>

            {/* Generated QR Code Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixModalData.pixCode)}`}
                alt="QR Code PIX"
                className="w-44 h-44 mx-auto rounded-lg"
              />
              <span className="text-[10px] text-slate-400 block mt-2">
                Aponte a câmera do aplicativo do seu banco
              </span>
            </div>

            {/* Pix Copia e Cola */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopyPix}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPix ? 'Código PIX Copiado!' : 'Copiar Código PIX'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
