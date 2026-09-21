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
  // Verificação estrita: Se o técnico ainda não selecionou a placa, o inversor ou a potência/consumo,
  // a proposta é carregada 100% LIMPA com todos os valores zerados (R$ 0,00, 0 kWp, 0 módulos).
  const hasModule = Boolean(input.moduleModelId && input.moduleModelId.trim() !== '');
  const hasInverter = Boolean(input.inverterModelId && input.inverterModelId.trim() !== '');
  const hasPowerOrConsumption = Boolean(
    (input.monthlyAverageKwh && input.monthlyAverageKwh > 0) ||
    (input.directSystemPowerKwp && input.directSystemPowerKwp > 0) ||
    (input.directModuleQuantity && input.directModuleQuantity > 0)
  );

  if (!hasModule || !hasInverter || !hasPowerOrConsumption) {
    return {
      systemPowerKwp: 0,
      moduleQuantity: 0,
      moduleUnitPowerWp: 0,
      roofAreaRequiredM2: 0,
      inverterPowerKw: 0,
      inverterQuantity: 0,
      annualGenerationKwh: 0,
      monthlyAverageGenerationKwh: 0,
      currentMonthlyBill: 0,
      estimatedNewMonthlyBill: 0,
      monthlySavings: 0,
      annualSavings: 0,
      twentyFiveYearSavings: 0,
      totalInvestment: 0,
      paybackYears: 0,
      paybackMonths: 0,
      roiPercentage: 0,
      co2AvoidedTonsPerYear: 0,
      treesPlantedEquivalent: 0,
      monthlyBreakdown: MONTH_WEIGHTS.map(mw => ({
        month: mw.month,
        consumptionKwh: 0,
        generationKwh: 0,
        savingsReais: 0,
      })),
      costBreakdown: {
        modulesTotal: 0,
        inverterTotal: 0,
        structuresTotal: 0,
        electricalKitTotal: 0,
        installationAndLaborTotal: 0,
        homologationAndArtTotal: 0,
        commercialMarginTotal: 0,
        isExactCalculation: false,
      },
    };
  }

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

  // Módulo selecionado (busca nos módulos cadastrados do cliente ou defaults)
  let modulesList: SolarModule[];
  try {
    modulesList = getStoredModules();
  } catch {
    modulesList = AVAILABLE_MODULES;
  }
  const selectedModule: SolarModule = modulesList.find(m => m.model === input.moduleModelId || m.id === input.moduleModelId) 
    || AVAILABLE_MODULES.find(m => m.model === input.moduleModelId)
    || { model: input.moduleModelId, brand: 'Módulo Selecionado', powerWp: 550, efficiency: 21.5, warrantyYears: 25, unitPrice: 450 };
  const moduleKw = selectedModule.powerWp / 1000;

  // Dimensionamento: Potência e Quantidade de Placas
  let moduleQuantity = 0;
  let systemPowerKwp = 0;

  if (input.directSystemPowerKwp && input.directSystemPowerKwp > 0) {
    // Modo 1: O técnico informou a quantidade exata de quilowatts (kWp)
    moduleQuantity = Math.max(Math.ceil((input.directSystemPowerKwp * 1000) / selectedModule.powerWp), 1);
    systemPowerKwp = Number((moduleQuantity * moduleKw).toFixed(2));
  } else if (input.directModuleQuantity && input.directModuleQuantity > 0) {
    // Modo 2: O técnico informou a quantidade exata de placas
    moduleQuantity = Math.max(input.directModuleQuantity, 1);
    systemPowerKwp = Number((moduleQuantity * moduleKw).toFixed(2));
  } else {
    // Modo 3: Calculado a partir do consumo em kWh informado
    const effectiveConsumption = Math.max(input.monthlyAverageKwh || 0, availabilityKwh + 10);
    const targetMonthlyKwh = Math.max(effectiveConsumption - availabilityKwh, 30);
    const rawPowerKwp = targetMonthlyKwh / (hsp * 30 * performanceRatio);
    moduleQuantity = Math.max(Math.ceil(rawPowerKwp / moduleKw), 1);
    systemPowerKwp = Number((moduleQuantity * moduleKw).toFixed(2));
  }

  // Área de telhado necessária (~2.6 m² por placa com espaçamento)
  const roofAreaRequiredM2 = Number((moduleQuantity * 2.6).toFixed(1));

  // Inversor selecionado
  let invertersList: SolarInverter[];
  try {
    invertersList = getStoredInverters();
  } catch {
    invertersList = AVAILABLE_INVERTERS;
  }

  const idealInverterKw = Number((systemPowerKwp / 1.25).toFixed(1));
  const selectedInverter: SolarInverter = invertersList.find(i => i.model === input.inverterModelId || i.id === input.inverterModelId)
    || AVAILABLE_INVERTERS.find(i => i.model === input.inverterModelId || i.id === input.inverterModelId)
    || { model: input.inverterModelId || 'Inversor', brand: 'Inversor', powerKw: idealInverterKw, type: input.inverterTypeId, warrantyYears: 10, unitPrice: 3800 };

  const inverterQuantity = 1;

  // Geração média mensal estimada (kWh)
  const monthlyAverageGenerationKwh = Math.round(systemPowerKwp * hsp * 30 * performanceRatio);
  const annualGenerationKwh = Math.round(monthlyAverageGenerationKwh * 12);

  // Consumo de referência para a fatura atual
  const effectiveMonthlyKwh = input.monthlyAverageKwh > 0 
    ? input.monthlyAverageKwh 
    : Math.round(monthlyAverageGenerationKwh + availabilityKwh);

  // Fatura atual sem solar
  const currentMonthlyBill = Number((effectiveMonthlyKwh * tariff + cip).toFixed(2));

  // Nova fatura estimada com solar (Disponibilidade + CIP + Pequeno resíduo Fio B da Lei 14.300 ~12%)
  const newAvailabilityCost = availabilityKwh * tariff;
  const estimatedNewMonthlyBill = Number((newAvailabilityCost + cip + (monthlyAverageGenerationKwh * 0.04)).toFixed(2));

  // Economias
  const monthlySavings = Number(Math.max(currentMonthlyBill - estimatedNewMonthlyBill, 10).toFixed(2));
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
