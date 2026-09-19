import React, { useState, useEffect } from 'react';
import { SolarModule, SolarInverter } from '../types';
import { 
  getStoredModules, 
  saveModule, 
  deleteModule, 
  getStoredInverters, 
  saveInverter, 
  deleteInverter,
  resetEquipmentToDefaults
} from '../utils/storage';
import { formatCurrencyBRL } from '../utils/solarCalculations';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Layers, 
  Cpu, 
  DollarSign, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  Package, 
  Sliders, 
  Sparkles,
  Zap,
  Info,
  Building2,
  Tag
} from 'lucide-react';

interface EquipmentManagerProps {
  onSelectForSizing?: (type: 'module' | 'inverter', idOrModel: string) => void;
  onNavigateToSizing?: () => void;
}

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({
  onNavigateToSizing
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'modules' | 'inverters' | 'settings'>('modules');
  const [modules, setModules] = useState<SolarModule[]>([]);
  const [inverters, setInverters] = useState<SolarInverter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<SolarModule | null>(null);
  const [moduleForm, setModuleForm] = useState<Partial<SolarModule>>({
    brand: '',
    model: '',
    powerWp: 600,
    efficiency: 22.3,
    warrantyYears: 25,
    unitPrice: 430,
    technology: 'Monocristalino N-Type TOPCon',
    supplier: '',
    notes: ''
  });

  // Inverter Modal State
  const [isInverterModalOpen, setIsInverterModalOpen] = useState(false);
  const [editingInverter, setEditingInverter] = useState<SolarInverter | null>(null);
  const [inverterForm, setInverterForm] = useState<Partial<SolarInverter>>({
    brand: '',
    model: '',
    powerKw: 5.0,
    type: 'string',
    warrantyYears: 10,
    unitPrice: 4200,
    voltage: '220V Monofásico/Bifásico',
    mpptCount: 2,
    supplier: '',
    notes: ''
  });

  // Reset confirmation modal
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = () => {
    setModules(getStoredModules());
    setInverters(getStoredInverters());
  };

  const showFeedback = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // --- MODULE HANDLERS ---
  const handleOpenNewModule = () => {
    setEditingModule(null);
    setModuleForm({
      brand: '',
      model: '',
      powerWp: 600,
      efficiency: 22.3,
      warrantyYears: 25,
      unitPrice: 430,
      technology: 'Monocristalino N-Type TOPCon',
      supplier: '',
      notes: ''
    });
    setIsModuleModalOpen(true);
  };

  const handleEditModule = (mod: SolarModule) => {
    setEditingModule(mod);
    setModuleForm({ ...mod });
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.brand || !moduleForm.model || !moduleForm.powerWp) {
      alert('Preencha a Marca, Modelo e Potência do módulo.');
      return;
    }

    const payload: SolarModule = {
      id: editingModule?.id || `mod-${Date.now()}`,
      brand: moduleForm.brand.trim(),
      model: moduleForm.model.trim(),
      powerWp: Number(moduleForm.powerWp),
      efficiency: Number(moduleForm.efficiency || 22.0),
      warrantyYears: Number(moduleForm.warrantyYears || 25),
      unitPrice: Number(moduleForm.unitPrice || 0),
      technology: moduleForm.technology || 'Monocristalino',
      supplier: moduleForm.supplier?.trim() || '',
      notes: moduleForm.notes?.trim() || '',
      createdAt: editingModule?.createdAt || new Date().toISOString()
    };

    const updated = saveModule(payload);
    setModules(updated);
    setIsModuleModalOpen(false);
    showFeedback(`Módulo "${payload.model}" salvo com sucesso!`);
  };

  const handleDeleteModule = (mod: SolarModule) => {
    if (confirm(`Tem certeza que deseja excluir o módulo "${mod.model}"?`)) {
      const updated = deleteModule(mod.id || mod.model);
      setModules(updated);
      showFeedback(`Módulo excluído com sucesso.`);
    }
  };

  // --- INVERTER HANDLERS ---
  const handleOpenNewInverter = () => {
    setEditingInverter(null);
    setInverterForm({
      brand: '',
      model: '',
      powerKw: 5.0,
      type: 'string',
      warrantyYears: 10,
      unitPrice: 4200,
      voltage: '220V Monofásico/Bifásico',
      mpptCount: 2,
      supplier: '',
      notes: ''
    });
    setIsInverterModalOpen(true);
  };

  const handleEditInverter = (inv: SolarInverter) => {
    setEditingInverter(inv);
    setInverterForm({ ...inv });
    setIsInverterModalOpen(true);
  };

  const handleSaveInverter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inverterForm.brand || !inverterForm.model || !inverterForm.powerKw) {
      alert('Preencha a Marca, Modelo e Potência do inversor.');
      return;
    }

    const payload: SolarInverter = {
      id: editingInverter?.id || `inv-${Date.now()}`,
      brand: inverterForm.brand.trim(),
      model: inverterForm.model.trim(),
      powerKw: Number(inverterForm.powerKw),
      type: (inverterForm.type as any) || 'string',
      warrantyYears: Number(inverterForm.warrantyYears || 10),
      unitPrice: Number(inverterForm.unitPrice || 0),
      voltage: inverterForm.voltage?.trim() || '220V Monofásico/Bifásico',
      mpptCount: Number(inverterForm.mpptCount || 2),
      supplier: inverterForm.supplier?.trim() || '',
      notes: inverterForm.notes?.trim() || '',
      createdAt: editingInverter?.createdAt || new Date().toISOString()
    };

    const updated = saveInverter(payload);
    setInverters(updated);
    setIsInverterModalOpen(false);
    showFeedback(`Inversor "${payload.model}" salvo com sucesso!`);
  };

  const handleDeleteInverter = (inv: SolarInverter) => {
    if (confirm(`Tem certeza que deseja excluir o inversor "${inv.model}"?`)) {
      const updated = deleteInverter(inv.id || inv.model);
      setInverters(updated);
      showFeedback(`Inversor excluído com sucesso.`);
    }
  };

  const handleResetDefaults = () => {
    const { modules: m, inverters: i } = resetEquipmentToDefaults();
    setModules(m);
    setInverters(i);
    setConfirmResetOpen(false);
    showFeedback('Equipamentos restaurados para o catálogo padrão Tier 1.');
  };

  // Filter lists
  const filteredModules = modules.filter(m => 
    m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.technology && m.technology.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.supplier && m.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredInverters = inverters.filter(i => 
    i.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.supplier && i.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-amber-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                Catálogo do Integrador
              </span>
              <span className="text-xs text-slate-400">Preços Reais & Exatos</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-400" />
              Cadastro de Equipamentos & Preços
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Cadastre e gerencie os <strong>módulos fotovoltaicos</strong> e <strong>inversores</strong> que a sua empresa utiliza.
              Ao definir o preço unitário de cada item, o dimensionador calculará o <strong>valor exato e transparente ao cliente final</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onNavigateToSizing && (
              <button
                type="button"
                onClick={onNavigateToSizing}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Ir para Dimensionamento</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Restaurar equipamentos originais Tier 1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Padrões Tier 1</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 sm:gap-3 mt-6 border-t border-slate-800 pt-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSubTab('modules')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'modules'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Módulos Fotovoltaicos</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              activeSubTab === 'modules' ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400'
            }`}>
              {modules.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('inverters')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'inverters'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Inversores & Microinversores</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              activeSubTab === 'inverters' ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400'
            }`}>
              {inverters.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custos & Regras de Precificação</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND ACTION BAR */}
      {activeSubTab !== 'settings' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeSubTab === 'modules' ? "Buscar módulo por marca, modelo, tecnologia..." : "Buscar inversor por marca, tipo, distribuidor..."}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeSubTab === 'modules' ? (
              <button
                type="button"
                onClick={handleOpenNewModule}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Novo Módulo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenNewInverter}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Novo Inversor</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 1: MÓDULOS FOTOVOLTAICOS */}
      {activeSubTab === 'modules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((mod) => {
              const pricePerWp = mod.unitPrice && mod.powerWp > 0 
                ? (mod.unitPrice / mod.powerWp).toFixed(2) 
                : null;

              return (
                <div 
                  key={mod.id || mod.model}
                  className="bg-white border border-slate-200 hover:border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wide border border-slate-200">
                          {mod.brand}
                        </span>
                        {mod.technology && (
                          <span className="ml-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-[10px] border border-amber-200/60">
                            {mod.technology}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditModule(mod)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar módulo"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mod)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir módulo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {mod.model}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Potência</span>
                        <strong className="text-sm font-black text-slate-800 font-mono">
                          {mod.powerWp} <span className="text-[10px] font-normal">Wp</span>
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Eficiência</span>
                        <strong className="text-sm font-bold text-slate-800 font-mono">
                          {mod.efficiency}%
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Garantia</span>
                        <strong className="text-sm font-bold text-slate-800 font-mono">
                          {mod.warrantyYears} <span className="text-[10px] font-normal">anos</span>
                        </strong>
                      </div>
                    </div>

                    {mod.supplier && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Fornecedor: <strong className="text-slate-700">{mod.supplier}</strong></span>
                      </div>
                    )}

                    {mod.notes && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 mb-2">
                        "{mod.notes}"
                      </p>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">Preço Unitário / Placa:</span>
                      <strong className="text-base font-black text-emerald-600 font-mono">
                        {mod.unitPrice ? formatCurrencyBRL(mod.unitPrice) : 'Sob consulta'}
                      </strong>
                    </div>

                    {pricePerWp && (
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block">Custo por Watt</span>
                        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          R$ {pricePerWp}/Wp
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">Nenhum módulo encontrado</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Não localizamos módulos com os critérios buscados. Clique no botão acima para cadastrar seu módulo.
              </p>
              <button
                type="button"
                onClick={handleOpenNewModule}
                className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Módulo
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: INVERSORES & MICROINVERSORES */}
      {activeSubTab === 'inverters' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInverters.map((inv) => {
              const typeBadge = inv.type === 'microinversor' 
                ? { label: 'Microinversor', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
                : inv.type === 'hibrido'
                  ? { label: 'Híbrido c/ Bateria', color: 'bg-purple-50 text-purple-700 border-purple-200' }
                  : { label: 'Inversor String', color: 'bg-blue-50 text-blue-700 border-blue-200' };

              return (
                <div 
                  key={inv.id || inv.model}
                  className="bg-white border border-slate-200 hover:border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wide border border-slate-200">
                          {inv.brand}
                        </span>
                        <span className={`ml-1.5 px-2 py-0.5 rounded font-semibold text-[10px] border ${typeBadge.color}`}>
                          {typeBadge.label}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditInverter(inv)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar inversor"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInverter(inv)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir inversor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {inv.model}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Potência</span>
                        <strong className="text-sm font-black text-slate-800 font-mono">
                          {inv.powerKw} <span className="text-[10px] font-normal">kW</span>
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">MPPTs</span>
                        <strong className="text-sm font-bold text-slate-800 font-mono">
                          {inv.mpptCount || 2}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Garantia</span>
                        <strong className="text-sm font-bold text-slate-800 font-mono">
                          {inv.warrantyYears} <span className="text-[10px] font-normal">anos</span>
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-1 mb-2">
                      {inv.voltage && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tensão: <strong className="text-slate-700">{inv.voltage}</strong></span>
                        </div>
                      )}
                      {inv.supplier && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Fornecedor: <strong className="text-slate-700">{inv.supplier}</strong></span>
                        </div>
                      )}
                    </div>

                    {inv.notes && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 mb-2">
                        "{inv.notes}"
                      </p>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">Preço Unitário Inversor:</span>
                      <strong className="text-base font-black text-emerald-600 font-mono">
                        {inv.unitPrice ? formatCurrencyBRL(inv.unitPrice) : 'Sob consulta'}
                      </strong>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      Exato no cálculo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredInverters.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">Nenhum inversor encontrado</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Não localizamos inversores com os critérios buscados. Clique no botão acima para cadastrar seu inversor.
              </p>
              <button
                type="button"
                onClick={handleOpenNewInverter}
                className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Inversor
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: CUSTOS & REGRAS DE PRECIFICAÇÃO */}
      {activeSubTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              Como Funciona a Composição de Preço Exato
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Quando você utiliza o modo de cálculo <strong>"Preço Exato por Equipamentos"</strong> no Dimensionador, o sistema soma com precisão milimétrica cada componente do kit fotovoltaico:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-amber-600 font-bold text-xs">
                <Layers className="w-4 h-4" />
                1. Módulos & Inversor
              </div>
              <p className="text-xs text-slate-600">
                Multiplica a <strong>quantidade de placas</strong> pelo preço unitário cadastrado, mais o <strong>preço do inversor</strong> selecionado.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-xs">
                <Zap className="w-4 h-4" />
                2. Estrutura & Kit Elétrico
              </div>
              <p className="text-xs text-slate-600">
                Calcula o custo das estruturas conforme o tipo de telhado (cerâmico, metálico, laje, solo) e o kit elétrico (cabos solares, conectores, stringbox).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-emerald-600 font-bold text-xs">
                <DollarSign className="w-4 h-4" />
                3. Mão de Obra & BDI
              </div>
              <p className="text-xs text-slate-600">
                Soma a mão de obra especializada, engenharia/ART de homologação na concessionária e aplica a <strong>margem comercial (BDI %)</strong> desejada.
              </p>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Dica de Vendas:</strong> Você pode ajustar os preços unitários ou alterar a margem comercial diretamente na tela de dimensionamento em tempo real antes de emitir a proposta em PDF e enviar via WhatsApp!
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRO / EDIÇÃO DE MÓDULO */}
      {/* ========================================================================= */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn my-auto">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/95">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{editingModule ? 'Editar Módulo Fotovoltaico' : 'Cadastrar Novo Módulo'}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Preencha as características técnicas e o preço de custo/tabela
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModuleModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg -mr-1"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <form onSubmit={handleSaveModule} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                
                {/* Brand & Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fabricante / Marca *
                    </label>
                    <input
                      type="text"
                      value={moduleForm.brand}
                      onChange={(e) => setModuleForm({ ...moduleForm, brand: e.target.value })}
                      placeholder="Ex: LONGi Solar, Canadian, Jinko"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Potência (Wp) *
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="100"
                      max="1000"
                      value={moduleForm.powerWp}
                      onChange={(e) => setModuleForm({ ...moduleForm, powerWp: Number(e.target.value) })}
                      placeholder="Ex: 600"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Modelo Completo / Descrição Comercial *
                  </label>
                  <input
                    type="text"
                    value={moduleForm.model}
                    onChange={(e) => setModuleForm({ ...moduleForm, model: e.target.value })}
                    placeholder="Ex: Hi-MO 6 Explorer 600W Monocristalino"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Pricing Highlighted */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      Preço Unitário por Placa (R$) *
                    </label>
                    {moduleForm.unitPrice && moduleForm.powerWp ? (
                      <span className="text-[11px] font-mono text-emerald-400">
                        ~R$ {(Number(moduleForm.unitPrice) / Number(moduleForm.powerWp)).toFixed(2)}/Wp
                      </span>
                    ) : null}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={moduleForm.unitPrice}
                    onChange={(e) => setModuleForm({ ...moduleForm, unitPrice: Number(e.target.value) })}
                    placeholder="Ex: 430.00"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-500/60 rounded-xl text-sm font-bold text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Este valor será multiplicado pelo número de placas necessárias no projeto.
                  </span>
                </div>

                {/* Efficiency & Warranty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Eficiência (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="10"
                      max="30"
                      value={moduleForm.efficiency}
                      onChange={(e) => setModuleForm({ ...moduleForm, efficiency: Number(e.target.value) })}
                      placeholder="Ex: 22.3"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Garantia de Geração (anos)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="10"
                      max="40"
                      value={moduleForm.warrantyYears}
                      onChange={(e) => setModuleForm({ ...moduleForm, warrantyYears: Number(e.target.value) })}
                      placeholder="Ex: 25"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Technology & Supplier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tecnologia da Célula
                    </label>
                    <select
                      value={moduleForm.technology}
                      onChange={(e) => setModuleForm({ ...moduleForm, technology: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Monocristalino N-Type TOPCon">N-Type TOPCon</option>
                      <option value="Monocristalino N-Type Bifacial">N-Type Bifacial</option>
                      <option value="Monocristalino PERC">Monocristalino PERC</option>
                      <option value="Monocristalino HPBC">HPBC (Back Contact)</option>
                      <option value="HJT Heterojunção">HJT Heterojunção</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Distribuidor / Fornecedor
                    </label>
                    <input
                      type="text"
                      value={moduleForm.supplier}
                      onChange={(e) => setModuleForm({ ...moduleForm, supplier: e.target.value })}
                      placeholder="Ex: Aldo Solar, Solfácil, Genyx"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Observações Técnicas (opcional)
                  </label>
                  <textarea
                    value={moduleForm.notes}
                    onChange={(e) => setModuleForm({ ...moduleForm, notes: e.target.value })}
                    placeholder="Dimensões, peso, coeficientes térmicos ou diferenciais..."
                    rows={2}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

              </div>

              {/* Sticky Footer */}
              <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                >
                  {editingModule ? 'Salvar Alterações' : 'Cadastrar Módulo'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRO / EDIÇÃO DE INVERSOR */}
      {/* ========================================================================= */}
      {isInverterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn my-auto">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/95">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{editingInverter ? 'Editar Inversor' : 'Cadastrar Novo Inversor'}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Informe o modelo, potência em kW e o preço unitário do equipamento
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInverterModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg -mr-1"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <form onSubmit={handleSaveInverter} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                
                {/* Brand & Power */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fabricante / Marca *
                    </label>
                    <input
                      type="text"
                      value={inverterForm.brand}
                      onChange={(e) => setInverterForm({ ...inverterForm, brand: e.target.value })}
                      placeholder="Ex: Growatt, Deye, Huawei, Fronius"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Potência Nominal (kW) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="150"
                      value={inverterForm.powerKw}
                      onChange={(e) => setInverterForm({ ...inverterForm, powerKw: Number(e.target.value) })}
                      placeholder="Ex: 5.0"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Modelo Completo / Código *
                  </label>
                  <input
                    type="text"
                    value={inverterForm.model}
                    onChange={(e) => setInverterForm({ ...inverterForm, model: e.target.value })}
                    placeholder="Ex: MIN 5000TL-X Monofásico 2 MPPTs"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Price Box */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                  <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Preço Unitário do Inversor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={inverterForm.unitPrice}
                    onChange={(e) => setInverterForm({ ...inverterForm, unitPrice: Number(e.target.value) })}
                    placeholder="Ex: 4200.00"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-500/60 rounded-xl text-sm font-bold text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Valor base de custo ou revenda utilizado na composição do sistema.
                  </span>
                </div>

                {/* Type & Voltage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tipo de Inversor
                    </label>
                    <select
                      value={inverterForm.type}
                      onChange={(e) => setInverterForm({ ...inverterForm, type: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="string">Inversor String (Padrão)</option>
                      <option value="microinversor">Microinversor</option>
                      <option value="hibrido">Inversor Híbrido (c/ Bateria)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tensão da Rede Elétrica
                    </label>
                    <input
                      type="text"
                      value={inverterForm.voltage}
                      onChange={(e) => setInverterForm({ ...inverterForm, voltage: e.target.value })}
                      placeholder="Ex: 220V Monofásico ou 380V Trifásico"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* MPPTs & Warranty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Quantidade de MPPTs
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="12"
                      value={inverterForm.mpptCount}
                      onChange={(e) => setInverterForm({ ...inverterForm, mpptCount: Number(e.target.value) })}
                      placeholder="Ex: 2"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Garantia de Fábrica (anos)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="25"
                      value={inverterForm.warrantyYears}
                      onChange={(e) => setInverterForm({ ...inverterForm, warrantyYears: Number(e.target.value) })}
                      placeholder="Ex: 10"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Distribuidor / Fornecedor
                  </label>
                  <input
                    type="text"
                    value={inverterForm.supplier}
                    onChange={(e) => setInverterForm({ ...inverterForm, supplier: e.target.value })}
                    placeholder="Ex: Aldo Solar, Solfácil, HDT Energy, Ecori"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Observações Técnicas (opcional)
                  </label>
                  <textarea
                    value={inverterForm.notes}
                    onChange={(e) => setInverterForm({ ...inverterForm, notes: e.target.value })}
                    placeholder="Monitoramento Wi-Fi, proteção AFCI, compatibilidade com baterias..."
                    rows={2}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

              </div>

              {/* Sticky Footer */}
              <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsInverterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                >
                  {editingInverter ? 'Salvar Alterações' : 'Cadastrar Inversor'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRM RESET DEFAULTS MODAL */}
      {/* ========================================================================= */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3 mb-3 text-amber-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold">Restaurar Catálogo Tier 1</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Esta ação recarregará os módulos e inversores padrão homologados no mercado brasileiro (LONGi, Jinko, Canadian, Growatt, Deye, Huawei, Hoymiles, Fronius). Seus itens cadastrados manualmente serão sobrescritos.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Confirmar e Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
