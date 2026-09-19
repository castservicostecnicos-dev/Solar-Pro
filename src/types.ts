export type InstallationType = 'residencial' | 'comercial' | 'rural' | 'industrial';
export type RoofType = 'ceramico' | 'metalico' | 'fibrocimento' | 'laje' | 'solo';
export type ConnectionType = 'monofasico' | 'bifasico' | 'trifasico';

export type LeadStatus = 
  | 'novo_lead' 
  | 'dimensionamento' 
  | 'proposta_enviada' 
  | 'follow_up' 
  | 'assinado' 
  | 'instalacao' 
  | 'concluido'
  | 'perdido';

export interface SolarModule {
  id?: string;
  model: string;
  brand: string;
  powerWp: number;
  efficiency: number;
  warrantyYears: number;
  unitPrice?: number; // Preço unitário por módulo em R$ para compor valor exato
  technology?: string; // N-Type TOPCon, Monocristalino, Bifacial, PERC
  supplier?: string;
  notes?: string;
  createdAt?: string;
}

export interface SolarInverter {
  id?: string;
  model: string;
  brand: string;
  powerKw: number;
  type: 'string' | 'microinversor' | 'hibrido';
  warrantyYears: number;
  unitPrice?: number; // Preço unitário do inversor em R$
  voltage?: string; // 220V Monofásico / 220V Bifásico / 380V Trifásico
  mpptCount?: number;
  supplier?: string;
  notes?: string;
  createdAt?: string;
}

export interface CostBreakdown {
  modulesTotal: number;
  inverterTotal: number;
  structuresTotal: number;
  electricalKitTotal: number;
  installationAndLaborTotal: number;
  homologationAndArtTotal: number;
  commercialMarginTotal: number;
  isExactCalculation: boolean;
}

export interface SizingInput {
  clientName: string;
  clientDoc: string; // CPF or CNPJ
  clientPhone: string;
  clientEmail: string;
  clientCity: string;
  clientState: string;
  installationType: InstallationType;
  roofType: RoofType;
  connectionType: ConnectionType;
  monthlyAverageKwh: number;
  tariffRate: number; // R$/kWh
  cipRate: number; // Iluminação pública R$
  customHsp?: number; // Horas de Sol Pleno
  inflationRate: number; // % anuidade inflação energética
  moduleModelId: string;
  inverterTypeId: 'string' | 'microinversor' | 'hibrido';
  inverterModelId?: string;
  pricingMode?: 'turnkey' | 'equipment_exact'; // Modo de precificação: turnkey ou exato por equipamentos
  customModuleUnitPrice?: number;
  customInverterUnitPrice?: number;
  customInstallationLaborCost?: number;
  customStructuresCost?: number;
  customElectricalKitCost?: number;
  customHomologationCost?: number;
  customMarginPercent?: number;
}

export interface MonthlyData {
  month: string;
  consumptionKwh: number;
  generationKwh: number;
  savingsReais: number;
}

export interface FinancialResult {
  systemPowerKwp: number;
  moduleQuantity: number;
  moduleUnitPowerWp: number;
  roofAreaRequiredM2: number;
  inverterPowerKw: number;
  inverterQuantity: number;
  annualGenerationKwh: number;
  monthlyAverageGenerationKwh: number;
  currentMonthlyBill: number;
  estimatedNewMonthlyBill: number;
  monthlySavings: number;
  annualSavings: number;
  twentyFiveYearSavings: number;
  totalInvestment: number;
  paybackYears: number;
  paybackMonths: number;
  roiPercentage: number;
  co2AvoidedTonsPerYear: number;
  treesPlantedEquivalent: number;
  monthlyBreakdown: MonthlyData[];
  costBreakdown?: CostBreakdown;
}

export interface PaymentInstallment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pendente' | 'pago' | 'atrasado';
  method: 'pix' | 'boleto' | 'cartao' | 'financiamento';
  receiptNumber?: string;
  notes?: string;
}

export interface DigitalSignatureData {
  signedBy: string;
  documentNumber: string;
  signedAt: string;
  ipAddress: string;
  validationHash: string;
  signatureDataUrl: string; // Base64 canvas image
  acceptedTerms: boolean;
}

export interface FollowUpActivity {
  id: string;
  date: string;
  type: 'whatsapp' | 'ligacao' | 'email' | 'reuniao' | 'nota';
  summary: string;
  nextFollowUpDate?: string;
  author: string;
}

export interface SolarProposal {
  id: string;
  proposalNumber: string;
  createdAt: string;
  updatedAt: string;
  validUntil: string;
  status: LeadStatus;
  
  // Client & Location
  client: {
    name: string;
    document: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    consumerUnit?: string;
    concessionaire: string;
  };

  // Technical
  technical: {
    installationType: InstallationType;
    roofType: RoofType;
    connectionType: ConnectionType;
    monthlyAverageKwh: number;
    tariffRate: number;
    hsp: number;
    module: SolarModule;
    inverter: SolarInverter;
    systemPowerKwp: number;
    moduleCount: number;
    areaM2: number;
  };

  // Financial
  financial: FinancialResult;

  // Custom AI Pitch / Commercial presentation
  executiveSummary?: string;

  // Payments
  payments: PaymentInstallment[];
  
  // Signature
  signature?: DigitalSignatureData;

  // Follow-up history
  followUps: FollowUpActivity[];

  // Notes
  internalNotes?: string;
}

export interface StateSolarData {
  state: string;
  name: string;
  hsp: number; // Horas de Sol Pleno diárias
  defaultConcessionaire: string;
  averageTariff: number; // R$/kWh
}

export type UserRole = 'dev' | 'cliente';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email?: string;
  document?: string; // CPF ou CNPJ
  company?: string;
  phone?: string;
  status: 'ativo' | 'bloqueado';
  createdAt: string;
  lastLogin?: string;
  passwordResetAt?: string;
  notes?: string;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  username: string;
  name: string;
  role: UserRole;
  status: 'sucesso' | 'falha' | 'bloqueado';
  details?: string;
}
