import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  CheckCircle, 
  Award, 
  Leaf, 
  RotateCcw,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { SolarProposal } from '../types';
import { generatePerformanceReportPDF, exportProposalsToCSV } from '../utils/pdfGenerator';
import { formatCurrencyBRL, formatNumberBR } from '../utils/solarCalculations';

interface ReportsDashboardProps {
  proposals: SolarProposal[];
  onResetDefaults: () => void;
}

const COLORS = ['#3b82f6', '#06b6d4', '#6366f1', '#f59e0b', '#10b981', '#a855f7', '#64748b'];

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  proposals,
  onResetDefaults,
}) => {
  // Aggregate statistics
  const stats = useMemo(() => {
    const totalCount = proposals.length;
    const signedProposals = proposals.filter(p => 
      p.status === 'assinado' || p.status === 'instalacao' || p.status === 'concluido'
    );
    const signedCount = signedProposals.length;
    const conversionRate = totalCount > 0 ? (signedCount / totalCount) * 100 : 0;

    const totalRevenueSigned = signedProposals.reduce((acc, p) => acc + p.financial.totalInvestment, 0);
    const totalPipeline = proposals.reduce((acc, p) => acc + p.financial.totalInvestment, 0);
    const averageTicket = signedCount > 0 ? totalRevenueSigned / signedCount : (totalCount > 0 ? totalPipeline / totalCount : 0);

    const totalKwpSigned = signedProposals.reduce((acc, p) => acc + p.technical.systemPowerKwp, 0);
    const totalKwpAll = proposals.reduce((acc, p) => acc + p.technical.systemPowerKwp, 0);

    const total25YearSavings = proposals.reduce((acc, p) => acc + p.financial.twentyFiveYearSavings, 0);
    const totalCo2Avoided = proposals.reduce((acc, p) => acc + p.financial.co2AvoidedTonsPerYear, 0);

    // Distribution by Stage
    const stageCounts: Record<string, number> = {};
    proposals.forEach(p => {
      stageCounts[p.status] = (stageCounts[p.status] || 0) + 1;
    });

    const stageData = [
      { name: 'Novo Lead', value: stageCounts['novo_lead'] || 0 },
      { name: 'Dimensionamento', value: stageCounts['dimensionamento'] || 0 },
      { name: 'Proposta Enviada', value: stageCounts['proposta_enviada'] || 0 },
      { name: 'Em Follow-up', value: stageCounts['follow_up'] || 0 },
      { name: 'Assinada / Ganho', value: stageCounts['assinado'] || 0 },
      { name: 'Instalação', value: stageCounts['instalacao'] || 0 },
      { name: 'Concluído', value: stageCounts['concluido'] || 0 },
    ].filter(s => s.value > 0);

    // Distribution by Brazilian State
    const stateCounts: Record<string, { count: number; revenue: number; kwp: number }> = {};
    proposals.forEach(p => {
      const uf = p.client.state || 'Outros';
      if (!stateCounts[uf]) {
        stateCounts[uf] = { count: 0, revenue: 0, kwp: 0 };
      }
      stateCounts[uf].count += 1;
      stateCounts[uf].revenue += p.financial.totalInvestment;
      stateCounts[uf].kwp += p.technical.systemPowerKwp;
    });

    const stateData = Object.keys(stateCounts).map(uf => ({
      uf,
      receita: Math.round(stateCounts[uf].revenue / 1000), // in thousand R$
      kwp: Math.round(stateCounts[uf].kwp * 10) / 10,
      projetos: stateCounts[uf].count,
    }));

    return {
      totalCount,
      signedCount,
      conversionRate,
      totalRevenueSigned,
      totalPipeline,
      averageTicket,
      totalKwpSigned,
      totalKwpAll,
      total25YearSavings,
      totalCo2Avoided,
      stageData,
      stateData,
    };
  }, [proposals]);

  const handleExportPDF = () => {
    generatePerformanceReportPDF(proposals);
  };

  const handleExportCSV = () => {
    exportProposalsToCSV(proposals);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Relatórios Executivos & Desempenho Solar
            </h1>
            <p className="text-xs text-slate-500">
              Análise analítica de conversão, potência instalada, faturamento e impacto ambiental.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV / Planilha</span>
          </button>

          <button
            type="button"
            id="btn-export-pdf"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Relatório Executivo PDF</span>
          </button>

          <button
            type="button"
            onClick={onResetDefaults}
            title="Recarregar projetos modelo para demonstração"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Vendas Fechadas
          </span>
          <div className="text-xl font-black text-emerald-600 font-display">
            {formatCurrencyBRL(stats.totalRevenueSigned)}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {stats.signedCount} propostas assinadas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total em Orçamentos
          </span>
          <div className="text-xl font-black text-slate-900 font-display">
            {formatCurrencyBRL(stats.totalPipeline)}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {stats.totalCount} projetos cotados
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Ticket Médio
          </span>
          <div className="text-xl font-black text-slate-900 font-display">
            {formatCurrencyBRL(stats.averageTicket)}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            por sistema instalado
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Taxa de Conversão
          </span>
          <div className="text-xl font-black text-amber-600 font-display">
            {Math.round(stats.conversionRate)}%
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Lead para Assinatura
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Potência Total
          </span>
          <div className="flex items-baseline gap-1 text-xl font-black text-slate-900 font-display">
            <span>{stats.totalKwpAll.toFixed(1)}</span>
            <span className="text-xs text-amber-600 font-bold">kWp</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {stats.totalKwpSigned.toFixed(1)} kWp contratados
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            CO2 Evitado
          </span>
          <div className="flex items-baseline gap-1 text-xl font-black text-emerald-600 font-display">
            <span>{stats.totalCo2Avoided.toFixed(1)}</span>
            <span className="text-xs text-slate-600 font-bold">ton/ano</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Impacto socioambiental
          </span>
        </div>

      </div>

      {/* Two Chart Modules: Geographical & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Revenue and kWp by Brazilian State (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Desempenho por Estado (UF)
              </h3>
              <p className="text-[11px] text-slate-500">
                Faturamento em Milhares de Reais (R$ mil) e volume de potência (kWp)
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.stateData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="uf" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    name === 'receita' ? `R$ ${value} mil` : `${value} kWp`,
                    name === 'receita' ? 'Faturamento Total' : 'Potência Instalada'
                  ]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={30}
                  formatter={(v) => v === 'receita' ? 'Faturamento (R$ mil)' : 'Potência (kWp)'}
                />
                <Bar dataKey="receita" fill="#f59e0b" radius={[4, 4, 0, 0]} name="receita" />
                <Bar dataKey="kwp" fill="#0f172a" radius={[4, 4, 0, 0]} name="kwp" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Funnel Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Distribuição por Etapa Comercial
            </h3>
            <p className="text-[11px] text-slate-500">
              Proporção de negócios por status comercial
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.stageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {stats.stageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} propostas`, 'Quantidade']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Environmental & Lifetime Savings Summary Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Impacto Econômico e Ambiental Acumulado</h3>
              <p className="text-xs text-slate-400">
                Total acumulado gerado para a base de clientes nos próximos 25 anos de operação.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Economia Gerada em 25 Anos</span>
              <span className="text-2xl font-black text-amber-400">{formatCurrencyBRL(stats.total25YearSavings)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
