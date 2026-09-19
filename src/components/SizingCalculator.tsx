import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sun, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Leaf, 
  Home, 
  Building2, 
  Tractor, 
  Factory,
  Layers,
  BarChart2,
  FileCheck,
  Package,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  SizingInput, 
  SolarProposal, 
  InstallationType, 
  RoofType, 
  ConnectionType,
  SolarModule,
  SolarInverter
} from '../types';
import { 
  BRAZILIAN_STATES_SOLAR, 
  AVAILABLE_MODULES, 
  AVAILABLE_INVERTERS 
} from '../data/solarDefaults';
import { 
  calculateSolarSystem, 
  formatCurrencyBRL, 
  formatNumberBR 
} from '../utils/solarCalculations';
import { 
  getStoredModules, 
  getStoredInverters 
} from '../utils/storage';

interface SizingCalculatorProps {
  onProposalCreated: (proposal: SolarProposal) => void;
  initialValues?: Partial<SizingInput>;
  onNavigateToEquipment?: () => void;
}

export const SizingCalculator: React.FC<SizingCalculatorProps> = ({
  onProposalCreated,
  initialValues,
  onNavigateToEquipment
}) => {
  const [storedModules, setStoredModules] = useState<SolarModule[]>(() => getStoredModules());
  const [storedInverters, setStoredInverters] = useState<SolarInverter[]>(() => getStoredInverters());
  const [showCostBreakdownDetails, setShowCostBreakdownDetails] = useState(false);

  // Refresh equipment catalog on mount
  useEffect(() => {
    setStoredModules(getStoredModules());
    setStoredInverters(getStoredInverters());
  }, []);

  const [formData, setFormData] = useState<SizingInput>({
    clientName: initialValues?.clientName || '',
    clientDoc: initialValues?.clientDoc || '',
    clientPhone: initialValues?.clientPhone || '',
    clientEmail: initialValues?.clientEmail || '',
    clientCity: initialValues?.clientCity || 'São Paulo',
    clientState: initialValues?.clientState || 'SP',
    installationType: initialValues?.installationType || 'residencial',
    roofType: initialValues?.roofType || 'ceramico',
    connectionType: initialValues?.connectionType || 'bifasico',
    monthlyAverageKwh: initialValues?.monthlyAverageKwh || 650,
    tariffRate: initialValues?.tariffRate || 0.95,
    cipRate: initialValues?.cipRate || 30.0,
    customHsp: undefined,
    inflationRate: 6.5,
    moduleModelId: initialValues?.moduleModelId || (storedModules[0]?.model || AVAILABLE_MODULES[0].model),
    inverterTypeId: initialValues?.inverterTypeId || 'string',
    inverterModelId: initialValues?.inverterModelId,
    pricingMode: initialValues?.pricingMode || 'equipment_exact',
    customMarginPercent: initialValues?.customMarginPercent ?? 22,
  });

  const [aiPitch, setAiPitch] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [clientAddress, setClientAddress] = useState('');
  const [consumerUnit, setConsumerUnit] = useState('');

  // Handle state change and auto-update tariff and concessionaire
  const handleStateChange = (stateCode: string) => {
    const st = BRAZILIAN_STATES_SOLAR.find(s => s.state === stateCode);
    setFormData(prev => ({
      ...prev,
      clientState: stateCode,
      tariffRate: st?.averageTariff || prev.tariffRate,
    }));
  };

  // Sizing calculations memoized
  const calculations = useMemo(() => {
    return calculateSolarSystem(formData);
  }, [formData]);

  // Selected module and inverter dynamically from stored equipment list
  const selectedModule = useMemo(() => {
    return storedModules.find(m => m.model === formData.moduleModelId || m.id === formData.moduleModelId) 
      || storedModules[0] 
      || AVAILABLE_MODULES[0];
  }, [storedModules, formData.moduleModelId]);

  const selectedInverter = useMemo(() => {
    if (formData.inverterModelId) {
      const byId = storedInverters.find(i => i.id === formData.inverterModelId || i.model === formData.inverterModelId);
      if (byId) return byId;
    }
    const kw = calculations.inverterPowerKw;
    return storedInverters.find(i => i.powerKw >= kw && (formData.inverterTypeId === 'microinversor' ? i.type === 'microinversor' : i.type !== 'microinversor')) 
      || storedInverters[0] 
      || AVAILABLE_INVERTERS[0];
  }, [storedInverters, calculations.inverterPowerKw, formData.inverterTypeId, formData.inverterModelId]);

  // AI pitch generator
  const handleGenerateAiPitch = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName || 'Cliente',
          systemKwp: calculations.systemPowerKwp,
          monthlySavings: calculations.monthlySavings,
          investment: calculations.totalInvestment,
          paybackYears: calculations.paybackYears,
          roofType: formData.roofType,
          state: formData.clientState,
        }),
      });
      const data = await res.json();
      if (data.text) {
        setAiPitch(data.text);
      }
    } catch {
      // Fallback
      setAiPitch(
        `Olá ${formData.clientName || "Cliente"}! O seu projeto solar de ${calculations.systemPowerKwp} kWp foi planejado para reduzir a sua conta de luz em até 95%, economizando cerca de ${formatCurrencyBRL(calculations.monthlySavings)} todos os meses. Com garantia de 25 anos nos módulos e retorno do investimento em apenas ${calculations.paybackYears} anos, sua economia acumulada superará ${formatCurrencyBRL(calculations.twentyFiveYearSavings)}!`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Create proposal action
  const handleCreateProposal = () => {
    const stateObj = BRAZILIAN_STATES_SOLAR.find(s => s.state === formData.clientState);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(100 + Math.random() * 900);
    const propNumber = `PROP-${dateStr}-${randCode}`;

    const newProposal: SolarProposal = {
      id: `prop-${Date.now()}`,
      proposalNumber: propNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'proposta_enviada',
      client: {
        name: formData.clientName.trim() || 'Cliente Solar',
        document: formData.clientDoc.trim(),
        phone: formData.clientPhone.trim() || 'Não informado',
        email: formData.clientEmail.trim(),
        address: clientAddress.trim() || `${formData.clientCity} - ${formData.clientState}`,
        city: formData.clientCity.trim(),
        state: formData.clientState,
        consumerUnit: consumerUnit.trim(),
        concessionaire: stateObj?.defaultConcessionaire || 'Concessionária Local',
      },
      technical: {
        installationType: formData.installationType,
        roofType: formData.roofType,
        connectionType: formData.connectionType,
        monthlyAverageKwh: formData.monthlyAverageKwh,
        tariffRate: formData.tariffRate,
        hsp: formData.customHsp || stateObj?.hsp || 4.8,
        module: selectedModule,
        inverter: selectedInverter,
        systemPowerKwp: calculations.systemPowerKwp,
        moduleCount: calculations.moduleQuantity,
        areaM2: calculations.roofAreaRequiredM2,
      },
      financial: calculations,
      executiveSummary: aiPitch || `Proposta de engenharia fotovoltaica personalizada de ${calculations.systemPowerKwp} kWp gerando ${formatCurrencyBRL(calculations.monthlySavings)}/mês de economia para ${formData.clientName || 'o cliente'}.`,
      payments: [
        {
          id: `pay-${Date.now()}-1`,
          description: 'Entrada / Aceite do Projeto (20%)',
          amount: Math.round(calculations.totalInvestment * 0.2),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: 'pendente',
          method: 'pix',
        },
        {
          id: `pay-${Date.now()}-2`,
          description: 'Entrega dos Módulos e Inversor (50%)',
          amount: Math.round(calculations.totalInvestment * 0.5),
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: 'pendente',
          method: 'boleto',
        },
        {
          id: `pay-${Date.now()}-3`,
          description: 'Conclusão e Homologação na Concessionária (30%)',
          amount: Math.round(calculations.totalInvestment * 0.3),
          dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: 'pendente',
          method: 'pix',
        },
      ],
      followUps: [
        {
          id: `act-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'nota',
          summary: 'Dimensionamento fotovoltaico concluído e proposta comercial gerada no sistema.',
          author: 'Engenharia SolarPro',
        },
      ],
    };

    onProposalCreated(newProposal);
  };

  const stateInfo = BRAZILIAN_STATES_SOLAR.find(s => s.state === formData.clientState);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Dimensionamento & Cálculo de Economia
            </h1>
            <p className="text-xs text-slate-500">
              Dimensionamento fotovoltaico de alta precisão para o mercado solar brasileiro.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-generate-proposal-top"
          onClick={handleCreateProposal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <FileCheck className="w-4 h-4" />
          <span>Gerar Proposta Oficial em PDF</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Section 1: Client Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
              Dados do Cliente & Localização
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Cliente / Empresa *
                </label>
                <input
                  type="text"
                  id="calc-client-name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ex: João da Silva / Padaria Central"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp / Celular *
                  </label>
                  <input
                    type="text"
                    id="calc-client-phone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="(11) 98888-7777"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF / CNPJ
                  </label>
                  <input
                    type="text"
                    id="calc-client-doc"
                    value={formData.clientDoc}
                    onChange={(e) => setFormData({ ...formData, clientDoc: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado (UF) *
                  </label>
                  <select
                    id="calc-client-state"
                    value={formData.clientState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium bg-white"
                  >
                    {BRAZILIAN_STATES_SOLAR.map((st) => (
                      <option key={st.state} value={st.state}>
                        {st.state} - {st.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    id="calc-client-city"
                    value={formData.clientCity}
                    onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
                    placeholder="Ex: Ribeirão Preto"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço / Bairro
                  </label>
                  <input
                    type="text"
                    id="calc-client-address"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Rua, número e bairro"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta Contrato / UC
                  </label>
                  <input
                    type="text"
                    id="calc-client-uc"
                    value={consumerUnit}
                    onChange={(e) => setConsumerUnit(e.target.value)}
                    placeholder="Número da instalação"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Concessionaire & Irradiance Badge */}
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center justify-between">
                <span>Concessionária: <strong>{stateInfo?.defaultConcessionaire}</strong></span>
                <span>Irradiação (HSP): <strong>{stateInfo?.hsp} h/dia</strong></span>
              </div>
            </div>
          </div>

          {/* Section 2: Consumption & Energy Grid Parameters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
              Consumo de Energia & Fatura
            </h2>

            <div className="space-y-3">
              {/* Type of Installation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipo de Imóvel
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'residencial', label: 'Residência', icon: Home },
                    { id: 'comercial', label: 'Comércio', icon: Building2 },
                    { id: 'rural', label: 'Rural', icon: Tractor },
                    { id: 'industrial', label: 'Indústria', icon: Factory },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = formData.installationType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, installationType: t.id as InstallationType })}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                          isSelected 
                            ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Consumption Slider & Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Consumo Médio Mensal (kWh/mês) *
                  </label>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {formatNumberBR(formData.monthlyAverageKwh)} kWh
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={20}
                  value={formData.monthlyAverageKwh}
                  onChange={(e) => setFormData({ ...formData, monthlyAverageKwh: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>100 kWh</span>
                  <span>1.500 kWh</span>
                  <span>3.000 kWh</span>
                  <span>5.000 kWh</span>
                </div>
              </div>

              {/* Tariff & Connection Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Padrão de Ligação
                  </label>
                  <select
                    value={formData.connectionType}
                    onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as ConnectionType })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 font-medium bg-white"
                  >
                    <option value="monofasico">Monofásico (30 kWh)</option>
                    <option value="bifasico">Bifásico (50 kWh)</option>
                    <option value="trifasico">Trifásico (100 kWh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tarifa (R$/kWh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tariffRate}
                    onChange={(e) => setFormData({ ...formData, tariffRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ilum. Pública (CIP)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.cipRate}
                    onChange={(e) => setFormData({ ...formData, cipRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              </div>

              {/* Roof Type */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tipo de Telhado / Fixação
                </label>
                <select
                  value={formData.roofType}
                  onChange={(e) => setFormData({ ...formData, roofType: e.target.value as RoofType })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium bg-white"
                >
                  <option value="ceramico">Telha Cerâmica (Colonial/Francesa)</option>
                  <option value="metalico">Telhado Metálico (Trapezoidal/Sanduíche)</option>
                  <option value="fibrocimento">Telha de Fibrocimento</option>
                  <option value="laje">Laje de Concreto Plano</option>
                  <option value="solo">Estrutura de Solo (Usinas)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 3: Equipment Selection & Exact Pricing */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                Equipamentos & Composição de Preço
              </h2>

              {onNavigateToEquipment && (
                <button
                  type="button"
                  onClick={onNavigateToEquipment}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Cadastrar Equipamentos</span>
                </button>
              )}
            </div>

            {/* Pricing Mode Switch */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                Modo de Formação do Preço ao Cliente Final
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pricingMode: 'equipment_exact' })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    formData.pricingMode === 'equipment_exact'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Preço Exato por Equipamentos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pricingMode: 'turnkey' })}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    formData.pricingMode === 'turnkey'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>Estimativa Turnkey (R$/kWp)</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Module selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Módulo Fotovoltaico (Placa Solar)
                  </label>
                  {selectedModule.unitPrice ? (
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      {formatCurrencyBRL(selectedModule.unitPrice)}/placa
                    </span>
                  ) : null}
                </div>
                <select
                  value={formData.moduleModelId}
                  onChange={(e) => setFormData({ ...formData, moduleModelId: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
                >
                  {storedModules.map((m) => (
                    <option key={m.id || m.model} value={m.model}>
                      {m.brand} • {m.model} ({m.powerWp}Wp) {m.unitPrice ? `• ${formatCurrencyBRL(m.unitPrice)}` : ''}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
                  <span>Necessários: <strong>{calculations.moduleQuantity} painéis</strong> ({calculations.systemPowerKwp} kWp)</span>
                  {selectedModule.unitPrice && (
                    <span className="font-mono font-semibold text-slate-700">
                      Subtotal: {formatCurrencyBRL(calculations.moduleQuantity * selectedModule.unitPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Inverter selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Inversor Solar Homologado
                  </label>
                  {selectedInverter.unitPrice ? (
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      {formatCurrencyBRL(selectedInverter.unitPrice)}
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, inverterTypeId: 'string', inverterModelId: undefined })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      formData.inverterTypeId === 'string'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Inversor String
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, inverterTypeId: 'microinversor', inverterModelId: undefined })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      formData.inverterTypeId === 'microinversor'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Microinversor
                  </button>
                </div>

                <select
                  value={formData.inverterModelId || selectedInverter.model}
                  onChange={(e) => setFormData({ ...formData, inverterModelId: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
                >
                  {storedInverters.map((inv) => (
                    <option key={inv.id || inv.model} value={inv.model}>
                      {inv.brand} • {inv.model} ({inv.powerKw} kW • {inv.type}) {inv.unitPrice ? `• ${formatCurrencyBRL(inv.unitPrice)}` : ''}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
                  <span>Recomendado para {calculations.systemPowerKwp} kWp: <strong>{calculations.inverterPowerKw} kW</strong></span>
                  <span className="font-mono font-semibold text-slate-700">1 unidade</span>
                </div>
              </div>

              {/* Exact Cost Breakdown Details Accordion */}
              {formData.pricingMode === 'equipment_exact' && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCostBreakdownDetails(!showCostBreakdownDetails)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-amber-950 text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-600" />
                      <span>Composição Detalhada dos Custos & Margem Comercial</span>
                    </div>
                    {showCostBreakdownDetails ? (
                      <ChevronUp className="w-4 h-4 text-amber-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-amber-700" />
                    )}
                  </button>

                  {showCostBreakdownDetails && calculations.costBreakdown && (
                    <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-fadeIn">
                      
                      {/* Margin Percent Input */}
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <label className="font-bold text-slate-800 block text-xs">
                            Margem Comercial da Sua Empresa (BDI %)
                          </label>
                          <span className="text-[10px] text-slate-500">
                            Lucro bruto e cobertura operacional sobre o custo direto
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={formData.customMarginPercent ?? 22}
                            onChange={(e) => setFormData({ ...formData, customMarginPercent: Number(e.target.value) })}
                            className="w-16 px-2 py-1 text-xs text-center font-bold font-mono border border-slate-300 rounded bg-slate-50 focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-xs font-bold text-slate-700">%</span>
                        </div>
                      </div>

                      {/* Itemized direct costs table */}
                      <div className="divide-y divide-slate-200 bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="p-2 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-600">1. Módulos ({calculations.moduleQuantity} un):</span>
                          <span className="font-bold text-slate-900">{formatCurrencyBRL(calculations.costBreakdown.modulesTotalPrice)}</span>
                        </div>
                        <div className="p-2 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-600">2. Inversor ({selectedInverter.brand}):</span>
                          <span className="font-bold text-slate-900">{formatCurrencyBRL(calculations.costBreakdown.inverterTotalPrice)}</span>
                        </div>
                        <div className="p-2 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-600">3. Estruturas (Telha {formData.roofType}):</span>
                          <span className="font-bold text-slate-900">{formatCurrencyBRL(calculations.costBreakdown.structuresTotal)}</span>
                        </div>
                        <div className="p-2 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-600">4. Kit Elétrico (Cabos, DPS, Stringbox):</span>
                          <span className="font-bold text-slate-900">{formatCurrencyBRL(calculations.costBreakdown.electricalKitTotal)}</span>
                        </div>
                        <div className="p-2 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-600">5. Mão de Obra de Instalação:</span>
                          <span className="font-bold text-slate-900">{formatCurrencyBRL(calculations.costBreakdown.installationLaborTotal)}</span>
                        </div>
                        <div className="p-2 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-600">6. Engenharia, ART & Homologação:</span>
                          <span className="font-bold text-slate-900">{formatCurrencyBRL(calculations.costBreakdown.homologationAndArtTotal)}</span>
                        </div>
                        <div className="p-2 flex items-center justify-between font-mono text-[11px] bg-amber-50/50">
                          <span className="text-amber-900 font-semibold">+ Margem Comercial ({formData.customMarginPercent ?? 22}%):</span>
                          <span className="font-bold text-amber-700">{formatCurrencyBRL(calculations.costBreakdown.commercialMarginTotal)}</span>
                        </div>
                        <div className="p-2.5 flex items-center justify-between font-mono text-xs bg-slate-900 text-white font-bold">
                          <span>= Investimento Total do Cliente:</span>
                          <span className="text-amber-400 font-black text-sm">{formatCurrencyBRL(calculations.totalInvestment)}</span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: AI Pitch Generator */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Apresentação Comercial com IA
                </h3>
              </div>
              <button
                type="button"
                id="btn-generate-ai-pitch"
                onClick={handleGenerateAiPitch}
                disabled={isGeneratingAi}
                className="text-xs font-bold px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isGeneratingAi ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>

            <textarea
              rows={3}
              value={aiPitch}
              onChange={(e) => setAiPitch(e.target.value)}
              placeholder="Clique em 'Gerar com IA' para criar um texto comercial persuasivo adaptado à potência e economia do cliente..."
              className="w-full p-2.5 text-xs rounded-xl border border-amber-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800 placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* Right Column: Live Results & Graphs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Potência do Sistema
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 font-display">
                  {calculations.systemPowerKwp}
                </span>
                <span className="text-xs font-bold text-amber-600">kWp</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {calculations.moduleQuantity} módulos ({selectedModule.powerWp}W)
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Economia Mensal
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-600 font-display">
                  {formatCurrencyBRL(calculations.monthlySavings)}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Redução de até 95%
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {formData.pricingMode === 'equipment_exact' ? 'Investimento Exato' : 'Investimento Estimado'}
                </span>
                {formData.pricingMode === 'equipment_exact' && (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Real
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900 font-display">
                  {formatCurrencyBRL(calculations.totalInvestment)}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {formData.pricingMode === 'equipment_exact' ? 'Equipamentos + BDI calculados' : 'Equipamento + Instalação'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Retorno (Payback)
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-600 font-display">
                  {calculations.paybackYears}
                </span>
                <span className="text-xs font-bold text-slate-600">anos</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                ~{calculations.paybackMonths} meses
              </span>
            </div>

          </div>

          {/* Comparison Cards: Current Bill vs New Bill */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Comparativo de Faturas de Energia
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-100">
                <span className="text-[11px] font-medium text-red-700 block">Fatura Atual (Sem Solar)</span>
                <span className="text-lg font-bold text-red-900 block mt-1">
                  {formatCurrencyBRL(calculations.currentMonthlyBill)}
                </span>
                <span className="text-[10px] text-red-600 block mt-0.5">
                  Gasto contínuo para concessionária
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-medium text-emerald-700 block">Nova Fatura com Solar</span>
                <span className="text-lg font-bold text-emerald-900 block mt-1">
                  {formatCurrencyBRL(calculations.estimatedNewMonthlyBill)}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  Apenas disponibilidade + CIP
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-[11px] font-medium text-amber-800 block">Economia em 25 Anos</span>
                <span className="text-lg font-bold text-amber-950 block mt-1">
                  {formatCurrencyBRL(calculations.twentyFiveYearSavings)}
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  Protegido contra a inflação
                </span>
              </div>
            </div>
          </div>

          {/* Recharts: Monthly Generation vs Consumption */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-amber-600" />
                  Curva de Geração Solar vs Consumo (12 Meses)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Geração média mensal de {formatNumberBR(calculations.monthlyAverageGenerationKwh)} kWh com sazonalidade solar.
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calculations.monthlyBreakdown} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" kWh" />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `${value} kWh`, 
                      name === 'generationKwh' ? 'Geração Solar' : 'Consumo do Imóvel'
                    ]}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={30}
                    formatter={(val) => val === 'generationKwh' ? 'Geração Fotovoltaica Estimada' : 'Consumo Médio'}
                  />
                  <Bar dataKey="generationKwh" fill="#f59e0b" radius={[4, 4, 0, 0]} name="generationKwh" />
                  <Bar dataKey="consumptionKwh" fill="#94a3b8" radius={[4, 4, 0, 0]} name="consumptionKwh" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Technical Specifications Summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Resumo Técnico de Engenharia
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px]">Módulos Solares</span>
                <span className="font-bold text-slate-800">{calculations.moduleQuantity} painéis</span>
                <span className="text-[10px] text-slate-500 block">{selectedModule.brand} {selectedModule.powerWp}W</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px]">Área de Telhado</span>
                <span className="font-bold text-slate-800">{calculations.roofAreaRequiredM2} m²</span>
                <span className="text-[10px] text-slate-500 block">Telha {formData.roofType}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px]">Inversor Sugerido</span>
                <span className="font-bold text-slate-800">{calculations.inverterPowerKw} kW</span>
                <span className="text-[10px] text-slate-500 block">{selectedInverter.brand} {selectedInverter.type}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px]">Geração Anual</span>
                <span className="font-bold text-slate-800">{formatNumberBR(calculations.annualGenerationKwh)} kWh</span>
                <span className="text-[10px] text-slate-500 block">Ano 1</span>
              </div>
            </div>
          </div>

          {/* Financing Simulation Strip */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Simulação de Financiamento Solar (Sem Entrada)
                </h3>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                Carência de até 90 dias
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { months: 24, mult: 1.18 },
                { months: 36, mult: 1.28 },
                { months: 60, mult: 1.48 },
                { months: 72, mult: 1.58 },
              ].map((p) => {
                const installment = Math.round((calculations.totalInvestment * p.mult) / p.months);
                const isUnderSavings = installment <= calculations.monthlySavings;
                return (
                  <div key={p.months} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 font-semibold block">{p.months} parcelas</span>
                    <span className="text-base font-extrabold text-amber-400 block mt-0.5">
                      {formatCurrencyBRL(installment)}
                    </span>
                    <span className="text-[9px] text-slate-400 block">ao mês</span>
                    {isUnderSavings && (
                      <span className="text-[9px] text-emerald-400 font-bold block mt-1">
                        ✓ Paga com a economia
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environmental Impact Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Energia 100% Limpa e Renovável</h4>
                <p className="text-[11px] text-emerald-800">
                  Evita {calculations.co2AvoidedTonsPerYear} toneladas de CO2/ano • Equivalente ao plantio de {calculations.treesPlantedEquivalent} árvores!
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-generate-proposal-bottom"
              onClick={handleCreateProposal}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Gerar Proposta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
