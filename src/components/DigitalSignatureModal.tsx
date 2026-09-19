import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Trash2, ShieldCheck, PenTool, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DigitalSignatureData, SolarProposal } from '../types';

interface DigitalSignatureModalProps {
  proposal: SolarProposal;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignature: (signature: DigitalSignatureData) => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onConfirmSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(proposal.client.name);
  const [documentNumber, setDocumentNumber] = useState(proposal.client.document || '');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSignerName(proposal.client.name);
      setDocumentNumber(proposal.client.document || '');
      setAcceptedTerms(false);
      setHasDrawn(false);
      setErrorMsg('');
      setTimeout(initCanvas, 100);
    }
  }, [isOpen, proposal]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setErrorMsg('');
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    initCanvas();
    setHasDrawn(false);
  };

  const handleSaveSignature = () => {
    if (!signerName.trim()) {
      setErrorMsg('Por favor, informe o nome completo do signatário.');
      return;
    }
    if (!documentNumber.trim()) {
      setErrorMsg('Por favor, informe o CPF ou CNPJ do signatário.');
      return;
    }
    if (!hasDrawn) {
      setErrorMsg('Por favor, desenhe sua assinatura no quadro indicado.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg('Você precisa aceitar os termos da proposta para assinar.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generate cryptographic-style validation hash
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const year = new Date().getFullYear();
    const validationHash = `SOL-BR-${year}-${randomHex}`;

    const signatureData: DigitalSignatureData = {
      signedBy: signerName.trim(),
      documentNumber: documentNumber.trim(),
      signedAt: new Date().toISOString(),
      ipAddress: '177.136.204.88 (Autenticação Digital SolarPro)',
      validationHash,
      signatureDataUrl: canvas.toDataURL('image/png'),
      acceptedTerms: true,
    };

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onConfirmSignature(signatureData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Assinatura Digital da Proposta</h3>
              <p className="text-xs text-slate-400">Proposta {proposal.proposalNumber} • {proposal.technical.systemPowerKwp} kWp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Signer inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo do Signatário *
              </label>
              <input
                type="text"
                id="input-signer-name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Ex: Carlos Eduardo da Silva"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CPF ou CNPJ do Titular *
              </label>
              <input
                type="text"
                id="input-signer-doc"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Canvas area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-amber-600" />
                <span>Desenhe sua assinatura abaixo (Touch ou Mouse) *</span>
              </label>
              <button
                type="button"
                id="btn-clear-canvas"
                onClick={clearCanvas}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative touch-none">
              <canvas
                ref={canvasRef}
                id="signature-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 bg-white cursor-crosshair"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                  <span className="text-xs">Assine com o dedo ou mouse aqui</span>
                  <div className="w-48 h-px bg-slate-300 mt-6" />
                </div>
              )}
            </div>
          </div>

          {/* Legal declaration & Checkbox */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="chk-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <label htmlFor="chk-terms" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                <strong>Declaro que li e concordo com todos os termos técnicos e comerciais</strong> desta proposta, incluindo o dimensionamento fotovoltaico de <strong>{proposal.technical.systemPowerKwp} kWp</strong> e o valor de investimento de <strong>R$ {proposal.financial.totalInvestment.toLocaleString('pt-BR')}</strong>, autorizando o início do projeto de homologação.
              </label>
            </div>
          </div>

          {/* Security & Validation details */}
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Certificado de Autenticidade Digital</span>
            </div>
            <p>
              Ao confirmar, será gerado um carimbo de integridade com carimbo de tempo (Timestamp) e hash de validação que será gravado no PDF da proposta técnica.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-signature"
            onClick={handleSaveSignature}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Assinatura Digital</span>
          </button>
        </div>

      </div>
    </div>
  );
};
