import { SizingInput, FinancialResult, MonthlyData, SolarModule, SolarInverter, CostBreakdown } from '../types';
import { BRAZILIAN_STATES_SOLAR, AVAILABLE_MODULES, AVAILABLE_INVERTERS } from '../data/solarDefaults';
import { getStoredModules, getStoredInverters } from './storage';

const MONTH_WEIGHTS = [
  { month: 'Jan', factor: 1.08 },
  { month: 'Fev', factor: 1.05 },
  { month: 'Mar', factor: 1.02 },
  { month: 'Abr', factor: 0.95 },
  { month: 'Mai', factor: 0.88 },
  { month: 'Jun', factor: 0.84 },
  { month: 'Jul', factor: 0.87 },
  { month: 'Ago', factor: 0.96 },
  { month: 'Set', factor: 1.00 },
  { month: 'Out', factor: 1.06 },
  { month: 'Nov', factor: 1.12 },
  { month: 'Dez', factor: 1.15 },
];

export function calculateSolarSystem(input: SizingInput): FinancialResult {
  // Find state HSP if custom HSP not provided
  const stateData = BRAZILIAN_STATES_SOLAR.find(s => s.state === input.clientState);
  const hsp = input.customHsp && input.customHsp > 0 
    ? input.customHsp 
    : (stateData?.hsp || 4.8);

  const tariff = input.tariffRate > 0 ? input.tariffRate : (stateData?.averageTariff || 0.95);
  const cip = input.cipRate >= 0 ? input.cipRate : 30.0; // Contribuição iluminação pública
  const performanceRatio = 0.77; // Rendimento padrão (perdas de cabo, temperatura, sujidade, inversor)

  // Custo de disponibilidade (taxa mínima)
  const availabilityKwh = input.connectionType === 'monofasico' 
    ? 30 
    : input.connectionType === 'bifasico' 
      ? 50 
      : 100;

  // Consumo a compensar
  const targetMonthlyKwh = Math.max(input.monthlyAverageKwh - availabilityKwh, 100);

  // Potência do sistema em kWp = Consumo / (HSP * 30 * PR)
  const rawPowerKwp = targetMonthlyKwh / (hsp * 30 * performanceRatio);

  // Módulo selecionado (busca nos módulos cadastrados do cliente ou defaults)
  let modulesList: SolarModule[];
  try {
    modulesList = getStoredModules();
  } catch {
    modulesList = AVAILABLE_MODULES;
  }
  const selectedModule: SolarModule = modulesList.find(m => m.model === input.moduleModelId || m.id === input.moduleModelId) 
    || AVAILABLE_MODULES.find(m => m.model === input.moduleModelId)
    || modulesList[0] 
    || AVAILABLE_MODULES[0];
  const moduleKw = selectedModule.powerWp / 1000;

  // Quantidade de módulos necessária
  const moduleQuantity = Math.max(Math.ceil(rawPowerKwp / moduleKw), 2);
  const systemPowerKwp = Number((moduleQuantity * moduleKw).toFixed(2));

  // Área de telhado necessária (~2.6 m² por placa com espaçamento)
  const roofAreaRequiredM2 = Number((moduleQuantity * 2.6).toFixed(1));

  // Inversor sugerido (FDI ~ 1.25)
  const idealInverterKw = Number((systemPowerKwp / 1.25).toFixed(1));
  const inverterQuantity = 1;

  // Inversor selecionado
  let invertersList: SolarInverter[];
  try {
    invertersList = getStoredInverters();
  } catch {
    invertersList = AVAILABLE_INVERTERS;
  }

  const selectedInverter: SolarInverter = (input.inverterModelId 
    ? invertersList.find(i => i.model === input.inverterModelId || i.id === input.inverterModelId)
    : null)
    || invertersList.find(i => i.powerKw >= idealInverterKw && (input.inverterTypeId === 'microinversor' ? i.type === 'microinversor' : i.type !== 'microinversor')) 
    || invertersList[0] 
    || AVAILABLE_INVERTERS[0];

  // Geração média mensal estimada (kWh)
  const monthlyAverageGenerationKwh = Math.round(systemPowerKwp * hsp * 30 * performanceRatio);
  const annualGenerationKwh = Math.round(monthlyAverageGenerationKwh * 12);

  // Fatura atual sem solar
  const currentMonthlyBill = Number((input.monthlyAverageKwh * tariff + cip).toFixed(2));

  // Nova fatura estimada com solar (Disponibilidade + CIP + Pequeno resíduo Fio B da Lei 14.300 ~12%)
  const newAvailabilityCost = availabilityKwh * tariff;
  const estimatedNewMonthlyBill = Number((newAvailabilityCost + cip + (monthlyAverageGenerationKwh * 0.04)).toFixed(2));

  // Economias
  const monthlySavings = Number(Math.max(currentMonthlyBill - estimatedNewMonthlyBill, 50).toFixed(2));
  const annualSavings = Number((monthlySavings * 12).toFixed(2));

  // Projeção 25 anos com reajuste tarifário médio de 6.5% ao ano e degradação de 0.5% a.a. nos painéis
  let twentyFiveYearSavings = 0;
  let currentYearAnnualSavings = annualSavings;
  const annualInflation = (input.inflationRate || 6.5) / 100;
  for (let year = 1; year <= 25; year++) {
    twentyFiveYearSavings += currentYearAnnualSavings;
    currentYearAnnualSavings = currentYearAnnualSavings * (1 + annualInflation) * 0.995;
  }
  twentyFiveYearSavings = Math.round(twentyFiveYearSavings);

  // -------------------------------------------------------------
  // COMPOSIÇÃO DE CUSTOS & PRECIFICAÇÃO
  // -------------------------------------------------------------
  // 1. Custos exatos dos equipamentos cadastrados
  const moduleUnitPrice = input.customModuleUnitPrice ?? selectedModule.unitPrice ?? 430;
  const modulesTotal = Math.round(moduleQuantity * moduleUnitPrice);

  const inverterUnitPrice = input.customInverterUnitPrice ?? selectedInverter.unitPrice ?? 4200;
  const inverterTotal = Math.round(inverterQuantity * inverterUnitPrice);

  // Estruturas de fixação conforme tipo de telhado
  let defaultStructurePerModule = 90;
  if (input.roofType === 'solo') defaultStructurePerModule = 140;
  else if (input.roofType === 'laje') defaultStructurePerModule = 120;
  else if (input.roofType === 'metalico') defaultStructurePerModule = 80;
  const structuresTotal = input.customStructuresCost ?? Math.round(moduleQuantity * defaultStructurePerModule);

  // Kit elétrico (Cabos solares 4/6mm, conectores MC4, Stringbox CC/CA, aterramento, DPS)
  const electricalKitTotal = input.customElectricalKitCost ?? Math.round(systemPowerKwp * 220 + 850);

  // Mão de obra de instalação especializada
  const installationAndLaborTotal = input.customInstallationLaborCost ?? Math.round(systemPowerKwp * 450 + 1200);

  // Projeto de engenharia, ART e homologação na concessionária
  const homologationAndArtTotal = input.customHomologationCost ?? 1200;

  // Custo direto total
  const directCostsSubtotal = modulesTotal + inverterTotal + structuresTotal + electricalKitTotal + installationAndLaborTotal + homologationAndArtTotal;

  // Margem comercial / BDI (%)
  const marginPercent = input.customMarginPercent ?? 20;
  const commercialMarginTotal = Math.round(directCostsSubtotal * (marginPercent / 100));

  // Total do investimento com base exata nos equipamentos cadastrados
  const exactTotalInvestment = directCostsSubtotal + commercialMarginTotal;

  // 2. Custo Turnkey estimado por kWp
  let turnkeyCostPerKwp = 3900;
  if (systemPowerKwp > 20) {
    turnkeyCostPerKwp = 3100;
  } else if (systemPowerKwp > 10) {
    turnkeyCostPerKwp = 3400;
  } else if (systemPowerKwp > 5) {
    turnkeyCostPerKwp = 3700;
  }

  let structureMultiplier = 1.0;
  if (input.roofType === 'solo') structureMultiplier = 1.08;
  if (input.roofType === 'laje') structureMultiplier = 1.05;
  if (input.roofType === 'metalico') structureMultiplier = 0.96;

  if (input.inverterTypeId === 'microinversor') {
    turnkeyCostPerKwp *= 1.15;
  }

  const turnkeyTotalInvestment = Math.round(systemPowerKwp * turnkeyCostPerKwp * structureMultiplier);

  // O cliente pode optar pelo cálculo exato com base em seus equipamentos ou pelo turnkey estimado
  const isExact = input.pricingMode === 'equipment_exact' || (input.pricingMode !== 'turnkey' && (selectedModule.unitPrice !== undefined || input.customModuleUnitPrice !== undefined));
  const totalInvestment = isExact ? exactTotalInvestment : turnkeyTotalInvestment;

  const costBreakdown: CostBreakdown = {
    modulesTotal,
    inverterTotal,
    structuresTotal,
    electricalKitTotal,
    installationAndLaborTotal,
    homologationAndArtTotal,
    commercialMarginTotal,
    isExactCalculation: isExact,
  };

  // Payback
  const paybackYears = Number((totalInvestment / Math.max(annualSavings, 1)).toFixed(1));
  const paybackMonths = Math.round(paybackYears * 12);
  const roiPercentage = Number(((annualSavings / Math.max(totalInvestment, 1)) * 100).toFixed(1));

  // Impacto ambiental
  // Fator médio grid Brasil: 0.084 kg CO2 / kWh
  const co2AvoidedTonsPerYear = Number(((annualGenerationKwh * 0.084) / 1000).toFixed(1));
  // 1 árvore adulta absorve ~140 kg CO2 em 10 anos (~14 kg/ano)
  const treesPlantedEquivalent = Math.round((annualGenerationKwh * 0.084) / 14);

  // Curva de geração mês a mês
  const monthlyBreakdown: MonthlyData[] = MONTH_WEIGHTS.map(mw => {
    const gen = Math.round(monthlyAverageGenerationKwh * mw.factor);
    const cons = Math.round(input.monthlyAverageKwh * (0.95 + (Math.sin(mw.factor) * 0.1)));
    const sav = Number(Math.max(cons * tariff + cip - (availabilityKwh * tariff + cip), 20).toFixed(2));
    return {
      month: mw.month,
      consumptionKwh: cons,
      generationKwh: gen,
      savingsReais: sav,
    };
  });

  return {
    systemPowerKwp,
    moduleQuantity,
    moduleUnitPowerWp: selectedModule.powerWp,
    roofAreaRequiredM2,
    inverterPowerKw: idealInverterKw,
    inverterQuantity,
    annualGenerationKwh,
    monthlyAverageGenerationKwh,
    currentMonthlyBill,
    estimatedNewMonthlyBill,
    monthlySavings,
    annualSavings,
    twentyFiveYearSavings,
    totalInvestment,
    paybackYears,
    paybackMonths,
    roiPercentage,
    co2AvoidedTonsPerYear,
    treesPlantedEquivalent,
    monthlyBreakdown,
    costBreakdown,
  };
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatNumberBR(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
