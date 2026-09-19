import { StateSolarData, SolarModule, SolarInverter, SolarProposal, LeadStatus } from '../types';

export const CRM_STAGES: { id: LeadStatus; label: string; description: string; color: string }[] = [
  { id: 'novo_lead', label: '1. Novo Lead', description: 'Contato inicial recebido', color: 'bg-blue-500' },
  { id: 'dimensionamento', label: '2. Dimensionamento', description: 'Cálculo técnico e financeiro', color: 'bg-indigo-500' },
  { id: 'proposta_enviada', label: '3. Proposta Enviada', description: 'PDF entregue ao cliente', color: 'bg-purple-500' },
  { id: 'follow_up', label: '4. Follow-up', description: 'Em negociação e cadência', color: 'bg-amber-500' },
  { id: 'assinado', label: '5. Proposta Assinada', description: 'Contrato assinado digitalmente', color: 'bg-emerald-500' },
  { id: 'instalacao', label: '6. Em Instalação', description: 'Homologação e montagem', color: 'bg-cyan-500' },
  { id: 'concluido', label: '7. Concluído', description: 'Sistema conectado e gerando', color: 'bg-emerald-700' },
];

export const BRAZILIAN_STATES_SOLAR: StateSolarData[] = [
  { state: 'AC', name: 'Acre', hsp: 4.4, defaultConcessionaire: 'Energisa Acre', averageTariff: 0.98 },
  { state: 'AL', name: 'Alagoas', hsp: 5.4, defaultConcessionaire: 'Equatorial Alagoas', averageTariff: 0.94 },
  { state: 'AM', name: 'Amazonas', hsp: 4.3, defaultConcessionaire: 'Amazonas Energia', averageTariff: 0.99 },
  { state: 'AP', name: 'Amapá', hsp: 4.8, defaultConcessionaire: 'CEA Equatorial', averageTariff: 0.92 },
  { state: 'BA', name: 'Bahia', hsp: 5.7, defaultConcessionaire: 'Neoenergia Coelba', averageTariff: 0.93 },
  { state: 'CE', name: 'Ceará', hsp: 5.8, defaultConcessionaire: 'Enel Ceará', averageTariff: 0.96 },
  { state: 'DF', name: 'Distrito Federal', hsp: 5.3, defaultConcessionaire: 'Neoenergia Brasília', averageTariff: 0.88 },
  { state: 'ES', name: 'Espírito Santo', hsp: 4.9, defaultConcessionaire: 'EDP Espírito Santo', averageTariff: 0.89 },
  { state: 'GO', name: 'Goiás', hsp: 5.4, defaultConcessionaire: 'Equatorial Goiás', averageTariff: 0.92 },
  { state: 'MA', name: 'Maranhão', hsp: 5.3, defaultConcessionaire: 'Equatorial Maranhão', averageTariff: 0.97 },
  { state: 'MG', name: 'Minas Gerais', hsp: 5.2, defaultConcessionaire: 'CEMIG', averageTariff: 0.98 },
  { state: 'MS', name: 'Mato Grosso do Sul', hsp: 5.1, defaultConcessionaire: 'Energisa MS', averageTariff: 0.95 },
  { state: 'MT', name: 'Mato Grosso', hsp: 5.2, defaultConcessionaire: 'Energisa MT', averageTariff: 0.99 },
  { state: 'PA', name: 'Pará', hsp: 4.7, defaultConcessionaire: 'Equatorial Pará', averageTariff: 1.05 },
  { state: 'PB', name: 'Paraíba', hsp: 5.6, defaultConcessionaire: 'Energisa PB', averageTariff: 0.91 },
  { state: 'PE', name: 'Pernambuco', hsp: 5.5, defaultConcessionaire: 'Neoenergia Pernambuco', averageTariff: 0.93 },
  { state: 'PI', name: 'Piauí', hsp: 5.7, defaultConcessionaire: 'Equatorial Piauí', averageTariff: 0.97 },
  { state: 'PR', name: 'Paraná', hsp: 4.3, defaultConcessionaire: 'Copel', averageTariff: 0.86 },
  { state: 'RJ', name: 'Rio de Janeiro', hsp: 4.8, defaultConcessionaire: 'Light / Enel RJ', averageTariff: 1.08 },
  { state: 'RN', name: 'Rio Grande do Norte', hsp: 5.7, defaultConcessionaire: 'Neoenergia Cosern', averageTariff: 0.92 },
  { state: 'RO', name: 'Rondônia', hsp: 4.5, defaultConcessionaire: 'Energisa RO', averageTariff: 0.96 },
  { state: 'RR', name: 'Roraima', hsp: 4.6, defaultConcessionaire: 'Roraima Energia', averageTariff: 0.91 },
  { state: 'RS', name: 'Rio Grande do Sul', hsp: 4.2, defaultConcessionaire: 'CPFL RGE / CEEE', averageTariff: 0.94 },
  { state: 'SC', name: 'Santa Catarina', hsp: 4.1, defaultConcessionaire: 'Celesc', averageTariff: 0.82 },
  { state: 'SE', name: 'Sergipe', hsp: 5.4, defaultConcessionaire: 'Energisa SE', averageTariff: 0.90 },
  { state: 'SP', name: 'São Paulo', hsp: 4.6, defaultConcessionaire: 'CPFL Paulista / Enel SP', averageTariff: 0.92 },
  { state: 'TO', name: 'Tocantins', hsp: 5.3, defaultConcessionaire: 'Energisa TO', averageTariff: 0.99 }
];

export const AVAILABLE_MODULES: SolarModule[] = [
  {
    id: 'mod-longi-600',
    model: 'Hi-MO 6 Explorer 600W Monocristalino',
    brand: 'LONGi Solar',
    powerWp: 600,
    efficiency: 22.3,
    warrantyYears: 25,
    unitPrice: 430.00,
    technology: 'Monocristalino HPBC',
    supplier: 'Aldo Solar / Solfácil',
    notes: 'Alta eficiência e menor coeficiente térmico.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mod-jinko-575',
    model: 'Tiger Neo N-Type 575W Bifacial',
    brand: 'Jinko Solar',
    powerWp: 575,
    efficiency: 22.2,
    warrantyYears: 30,
    unitPrice: 410.00,
    technology: 'N-Type TOPCon Bifacial',
    supplier: 'Genyx Solar / Fortlev',
    notes: 'Ganho bifacial de até 20% na face traseira.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mod-canadian-550',
    model: 'TOPHiKu6 550W Monoperg',
    brand: 'Canadian Solar',
    powerWp: 550,
    efficiency: 21.8,
    warrantyYears: 25,
    unitPrice: 385.00,
    technology: 'Mono PERC Half-Cell',
    supplier: 'Canadian Solar Brasil',
    notes: 'Alta durabilidade e excelente custo-benefício.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mod-jasolar-620',
    model: 'DeepBlue 4.0 Pro 620Wp',
    brand: 'JA Solar',
    powerWp: 620,
    efficiency: 22.5,
    warrantyYears: 25,
    unitPrice: 450.00,
    technology: 'N-Type Bycium+',
    supplier: 'Leveros Solar',
    notes: 'Ideal para usinas e grandes coberturas.',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const AVAILABLE_INVERTERS: SolarInverter[] = [
  {
    id: 'inv-growatt-5000',
    model: 'MIN 5000TL-X Monofásico 2 MPPTs',
    brand: 'Growatt',
    powerKw: 5.0,
    type: 'string',
    warrantyYears: 10,
    unitPrice: 4200.00,
    voltage: '220V Monofásico/Bifásico',
    mpptCount: 2,
    supplier: 'Aldo Solar',
    notes: 'Monitoramento Wi-Fi incluso e display OLED.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'inv-deye-8k',
    model: 'SUN-8K-SG04LP3 Trifásico Híbrido',
    brand: 'Deye',
    powerKw: 8.0,
    type: 'hibrido',
    warrantyYears: 10,
    unitPrice: 9800.00,
    voltage: '220V/380V Trifásico',
    mpptCount: 2,
    supplier: 'Deye Brasil / Solfácil',
    notes: 'Suporte a baterias de lítio e função backup anti-apagão.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'inv-huawei-10k',
    model: 'SUN2000-10KTL-M1 Smart Energy',
    brand: 'Huawei',
    powerKw: 10.0,
    type: 'string',
    warrantyYears: 10,
    unitPrice: 7900.00,
    voltage: '380V Trifásico',
    mpptCount: 2,
    supplier: 'HDT Energy',
    notes: 'Proteção IA contra arcos elétricos AFCI.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'inv-hoymiles-2k',
    model: 'HMS-2000-4T Microinversor Quad',
    brand: 'Hoymiles',
    powerKw: 2.0,
    type: 'microinversor',
    warrantyYears: 15,
    unitPrice: 1950.00,
    voltage: '220V Monofásico',
    mpptCount: 4,
    supplier: 'Ecori Energia Solar',
    notes: '4 MPPTs independentes por módulo para máximo rendimento.',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'inv-fronius-6k',
    model: 'Primo GEN24 Plus 6.0 kW',
    brand: 'Fronius',
    powerKw: 6.0,
    type: 'string',
    warrantyYears: 10,
    unitPrice: 8400.00,
    voltage: '220V Monofásico',
    mpptCount: 2,
    supplier: 'Fronius Brasil',
    notes: 'Qualidade austríaca com ponto de tomada de emergência PV Point.',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const FOLLOW_UP_TEMPLATES = [
  {
    id: 'apresentacao',
    title: '1. Envio da Proposta Comercial',
    badge: 'Dia 1',
    description: 'Mensagem formal e calorosa enviada junto com o PDF do projeto.',
    template: `Olá {nome}, tudo bem? Aqui é da SolarPro! ☀️\n\nConforme conversamos, elaborei o estudo personalizado de engenharia solar para o seu imóvel em {cidade}.\n\nSeu sistema projetado de {potencia} kWp vai gerar uma economia média de {economia_mensal}/mês, reduzindo até 95% do valor da sua fatura!\n\nSegue a proposta detalhada em anexo. Vamos agendar uma rápida ligação de 5 minutos para eu te apresentar as melhores condições de pagamento?`
  },
  {
    id: 'duvidas_financiamento',
    title: '2. Economia e Financiamento Sem Entrada',
    badge: 'Dia 3',
    description: 'Enfatiza a substituição do custo fixo da conta por parcelas fixas.',
    template: `Oi {nome}, como vai?\n\nPassando para saber se conseguiu dar uma olhada na proposta solar de {potencia} kWp.\n\nUma informação importante: com as linhas de crédito solar parceiras (BV, Santander e SolFácil), é possível fazer em até 72x SEM ENTRADA e com até 90 dias de carência.\n\nNa prática, a economia de {economia_mensal}/mês paga praticamente a parcela do projeto! O que acha de fazermos uma simulação bancária sem compromisso hoje?`
  },
  {
    id: 'escassez_garantia',
    title: '3. Garantia de Tabela e Bônus de Monitoramento',
    badge: 'Dia 7',
    description: 'Gera senso de urgência com validade da cotação e homologação ágil.',
    template: `Olá {nome}! Tudo bem?\n\nEstou acompanhando os lotes de módulos fotovoltaicos deste mês com a distribuidora. A cotação especial do seu projeto de {potencia} kWp está reservada até {validade}.\n\nFechando esta semana, consigo incluir como cortesia a homologação completa na concessionária e o aplicativo de monitoramento em tempo real via celular para toda a vida útil do sistema!\n\nPodemos confirmar o seu pedido?`
  },
  {
    id: 'reativacao',
    title: '4. Reativação de Lead / Novo Aumento Tarifário',
    badge: 'Dia 15+',
    description: 'Reativa clientes que deixaram de responder com foco em perdas por inação.',
    template: `Olá {nome}, tudo bem por aí?\n\nCom o recente anúncio de reajuste nas bandeiras tarifárias de energia elétrica, cada mês sem energia solar representa cerca de {economia_mensal} que você continua entregando para a concessionária.\n\nGostaria de saber se o projeto fotovoltaico ainda está nos seus planos para este trimestre, ou se prefere que eu retome o contato mais para frente? Abraços!`
  }
];

export const INITIAL_SAMPLE_PROPOSALS: SolarProposal[] = [
  {
    id: 'prop-001',
    proposalNumber: 'PROP-2026-0841',
    createdAt: '2026-08-28T14:30:00Z',
    updatedAt: '2026-08-29T10:15:00Z',
    validUntil: '2026-09-12T23:59:59Z',
    status: 'assinado',
    client: {
      name: 'Dr. Roberto Mendes Silveira',
      document: '214.892.418-05',
      phone: '11987654321',
      email: 'roberto.mendes@clinica.com.br',
      address: 'Rua das Palmeiras, 450 - Jardim Paulista',
      city: 'São Paulo',
      state: 'SP',
      consumerUnit: '00784912-3',
      concessionaire: 'Enel SP'
    },
    technical: {
      installationType: 'comercial',
      roofType: 'ceramico',
      connectionType: 'trifasico',
      monthlyAverageKwh: 1250,
      tariffRate: 0.94,
      hsp: 4.6,
      module: AVAILABLE_MODULES[0],
      inverter: AVAILABLE_INVERTERS[2],
      systemPowerKwp: 10.2,
      moduleCount: 17,
      areaM2: 44.2
    },
    financial: {
      systemPowerKwp: 10.2,
      moduleQuantity: 17,
      moduleUnitPowerWp: 600,
      roofAreaRequiredM2: 44.2,
      inverterPowerKw: 10.0,
      inverterQuantity: 1,
      annualGenerationKwh: 14850,
      monthlyAverageGenerationKwh: 1237,
      currentMonthlyBill: 1175.0,
      estimatedNewMonthlyBill: 94.0, // Custo de disponibilidade trifásico + CIP
      monthlySavings: 1081.0,
      annualSavings: 12972.0,
      twentyFiveYearSavings: 468000.0,
      totalInvestment: 38900.0,
      paybackYears: 3.0,
      paybackMonths: 36,
      roiPercentage: 33.3,
      co2AvoidedTonsPerYear: 7.4,
      treesPlantedEquivalent: 53,
      monthlyBreakdown: [
        { month: 'Jan', consumptionKwh: 1300, generationKwh: 1380, savingsReais: 1205 },
        { month: 'Fev', consumptionKwh: 1250, generationKwh: 1310, savingsReais: 1140 },
        { month: 'Mar', consumptionKwh: 1280, generationKwh: 1290, savingsReais: 1120 },
        { month: 'Abr', consumptionKwh: 1200, generationKwh: 1220, savingsReais: 1060 },
        { month: 'Mai', consumptionKwh: 1150, generationKwh: 1130, savingsReais: 980 },
        { month: 'Jun', consumptionKwh: 1100, generationKwh: 1080, savingsReais: 940 },
        { month: 'Jul', consumptionKwh: 1120, generationKwh: 1110, savingsReais: 965 },
        { month: 'Ago', consumptionKwh: 1180, generationKwh: 1240, savingsReais: 1075 },
        { month: 'Set', consumptionKwh: 1220, generationKwh: 1270, savingsReais: 1100 },
        { month: 'Out', consumptionKwh: 1290, generationKwh: 1320, savingsReais: 1145 },
        { month: 'Nov', consumptionKwh: 1310, generationKwh: 1360, savingsReais: 1180 },
        { month: 'Dez', consumptionKwh: 1400, generationKwh: 1400, savingsReais: 1220 }
      ]
    },
    executiveSummary: 'Projeto solar de alta performance dimensionado para a Clínica Silveira. Substitui faturas mensais de mais de R$ 1.100,00 por geração própria limpa, gerando mais de R$ 460 mil de economia acumulada em 25 anos.',
    payments: [
      {
        id: 'pay-001',
        description: 'Entrada / Sinal de Aceite do Projeto (20%)',
        amount: 7780.0,
        dueDate: '2026-08-30',
        paidDate: '2026-08-30',
        status: 'pago',
        method: 'pix',
        receiptNumber: 'REC-2026-091',
        notes: 'Pago via PIX com comprovante autenticado'
      },
      {
        id: 'pay-002',
        description: 'Entrega dos Módulos LONGi e Inversor Huawei (50%)',
        amount: 19450.0,
        dueDate: '2026-09-15',
        status: 'pendente',
        method: 'boleto',
        notes: 'Boleto faturado direto da distribuidora'
      },
      {
        id: 'pay-003',
        description: 'Conclusão da Instalação e Homologação na Concessionária (30%)',
        amount: 11670.0,
        dueDate: '2026-10-05',
        status: 'pendente',
        method: 'pix',
        notes: 'Liberado após vistoria da Enel SP'
      }
    ],
    signature: {
      signedBy: 'Dr. Roberto Mendes Silveira',
      documentNumber: '214.892.418-05',
      signedAt: '2026-08-29T10:15:22-03:00',
      ipAddress: '177.136.204.88 (São Paulo, BR)',
      validationHash: 'SOL-BR-A94F-77D1-2026',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10, 90 35 T 180 20" stroke="%231e293b" stroke-width="3" fill="none"/></svg>',
      acceptedTerms: true
    },
    followUps: [
      {
        id: 'f-1',
        date: '2026-08-28T14:40:00Z',
        type: 'whatsapp',
        summary: 'Envio da proposta inicial e vídeo explicativo dos módulos bifaciais.',
        author: 'Consultor Solar'
      },
      {
        id: 'f-2',
        date: '2026-08-29T09:30:00Z',
        type: 'ligacao',
        summary: 'Alinhamento sobre prazo de entrega e aprovação do projeto na Enel. Cliente assinou digitalmente.',
        author: 'Consultor Solar'
      }
    ],
    internalNotes: 'Cliente muito rigoroso com estética no telhado frontal. Fixadores pretos aprovados.'
  },
  {
    id: 'prop-002',
    proposalNumber: 'PROP-2026-0842',
    createdAt: '2026-08-29T11:00:00Z',
    updatedAt: '2026-08-30T16:00:00Z',
    validUntil: '2026-09-13T23:59:59Z',
    status: 'follow_up',
    client: {
      name: 'Mariana Castro Fernandes',
      document: '345.678.910-12',
      phone: '31991234567',
      email: 'mariana.fernandes@gmail.com',
      address: 'Alameda dos Ipês, 120 - Belvedere',
      city: 'Belo Horizonte',
      state: 'MG',
      consumerUnit: '10984214-0',
      concessionaire: 'CEMIG'
    },
    technical: {
      installationType: 'residencial',
      roofType: 'ceramico',
      connectionType: 'bifasico',
      monthlyAverageKwh: 650,
      tariffRate: 0.98,
      hsp: 5.2,
      module: AVAILABLE_MODULES[1],
      inverter: AVAILABLE_INVERTERS[0],
      systemPowerKwp: 4.6,
      moduleCount: 8,
      areaM2: 20.8
    },
    financial: {
      systemPowerKwp: 4.6,
      moduleQuantity: 8,
      moduleUnitPowerWp: 575,
      roofAreaRequiredM2: 20.8,
      inverterPowerKw: 5.0,
      inverterQuantity: 1,
      annualGenerationKwh: 7150,
      monthlyAverageGenerationKwh: 595,
      currentMonthlyBill: 637.0,
      estimatedNewMonthlyBill: 49.0, // Custo de disponibilidade bifásico (50kWh)
      monthlySavings: 588.0,
      annualSavings: 7056.0,
      twentyFiveYearSavings: 254000.0,
      totalInvestment: 18500.0,
      paybackYears: 2.6,
      paybackMonths: 31,
      roiPercentage: 38.1,
      co2AvoidedTonsPerYear: 3.5,
      treesPlantedEquivalent: 26,
      monthlyBreakdown: [
        { month: 'Jan', consumptionKwh: 680, generationKwh: 640, savingsReais: 620 },
        { month: 'Fev', consumptionKwh: 650, generationKwh: 620, savingsReais: 600 },
        { month: 'Mar', consumptionKwh: 660, generationKwh: 610, savingsReais: 595 },
        { month: 'Abr', consumptionKwh: 620, generationKwh: 590, savingsReais: 575 },
        { month: 'Mai', consumptionKwh: 600, generationKwh: 550, savingsReais: 535 },
        { month: 'Jun', consumptionKwh: 590, generationKwh: 530, savingsReais: 515 },
        { month: 'Jul', consumptionKwh: 610, generationKwh: 560, savingsReais: 545 },
        { month: 'Ago', consumptionKwh: 640, generationKwh: 600, savingsReais: 585 },
        { month: 'Set', consumptionKwh: 670, generationKwh: 620, savingsReais: 605 },
        { month: 'Out', consumptionKwh: 700, generationKwh: 640, savingsReais: 625 },
        { month: 'Nov', consumptionKwh: 690, generationKwh: 650, savingsReais: 635 },
        { month: 'Dez', consumptionKwh: 720, generationKwh: 660, savingsReais: 645 }
      ]
    },
    executiveSummary: 'Solução residencial completa para eliminar as contas de energia da CEMIG. Retorno acelerado em 2,6 anos com módulos fotovoltaicos N-Type de última geração.',
    payments: [
      {
        id: 'pay-004',
        description: 'Financiamento Bancário BV em 60x',
        amount: 18500.0,
        dueDate: '2026-09-20',
        status: 'pendente',
        method: 'financiamento',
        notes: 'Aguardando aprovação de crédito na BV'
      }
    ],
    followUps: [
      {
        id: 'f-3',
        date: '2026-08-29T11:15:00Z',
        type: 'whatsapp',
        summary: 'Envio do comparativo entre pagar a conta da CEMIG vs parcelar o gerador solar.',
        author: 'Consultor Solar'
      },
      {
        id: 'f-4',
        date: '2026-08-30T15:30:00Z',
        type: 'ligacao',
        summary: 'Mariana gostou do projeto, aguardando aprovação do marido para assinar.',
        nextFollowUpDate: '2026-09-02',
        author: 'Consultor Solar'
      }
    ],
    internalNotes: 'Agendar follow-up dia 02/09 com simulação de 72x.'
  },
  {
    id: 'prop-003',
    proposalNumber: 'PROP-2026-0843',
    createdAt: '2026-08-30T09:00:00Z',
    updatedAt: '2026-08-30T09:00:00Z',
    validUntil: '2026-09-14T23:59:59Z',
    status: 'proposta_enviada',
    client: {
      name: 'Agropecuária Fazenda Boa Esperança Ltda',
      document: '18.940.112/0001-44',
      phone: '62988776655',
      email: 'contato@fazendaboaesperanca.agr.br',
      address: 'Rodovia GO-020, Km 42 - Zona Rural',
      city: 'Goiânia',
      state: 'GO',
      consumerUnit: '88219401-2',
      concessionaire: 'Equatorial Goiás'
    },
    technical: {
      installationType: 'rural',
      roofType: 'solo',
      connectionType: 'trifasico',
      monthlyAverageKwh: 3500,
      tariffRate: 0.92,
      hsp: 5.4,
      module: AVAILABLE_MODULES[3],
      inverter: AVAILABLE_INVERTERS[2],
      systemPowerKwp: 28.5,
      moduleCount: 46,
      areaM2: 120.0
    },
    financial: {
      systemPowerKwp: 28.5,
      moduleQuantity: 46,
      moduleUnitPowerWp: 620,
      roofAreaRequiredM2: 120.0,
      inverterPowerKw: 30.0,
      inverterQuantity: 1,
      annualGenerationKwh: 45000,
      monthlyAverageGenerationKwh: 3750,
      currentMonthlyBill: 3220.0,
      estimatedNewMonthlyBill: 120.0,
      monthlySavings: 3100.0,
      annualSavings: 37200.0,
      twentyFiveYearSavings: 1350000.0,
      totalInvestment: 98000.0,
      paybackYears: 2.6,
      paybackMonths: 32,
      roiPercentage: 37.9,
      co2AvoidedTonsPerYear: 22.5,
      treesPlantedEquivalent: 160,
      monthlyBreakdown: [
        { month: 'Jan', consumptionKwh: 3500, generationKwh: 3800, savingsReais: 3150 },
        { month: 'Fev', consumptionKwh: 3400, generationKwh: 3700, savingsReais: 3080 },
        { month: 'Mar', consumptionKwh: 3500, generationKwh: 3750, savingsReais: 3110 },
        { month: 'Abr', consumptionKwh: 3450, generationKwh: 3700, savingsReais: 3070 },
        { month: 'Mai', consumptionKwh: 3300, generationKwh: 3600, savingsReais: 2980 },
        { month: 'Jun', consumptionKwh: 3250, generationKwh: 3550, savingsReais: 2950 },
        { month: 'Jul', consumptionKwh: 3300, generationKwh: 3650, savingsReais: 3020 },
        { month: 'Ago', consumptionKwh: 3600, generationKwh: 3900, savingsReais: 3240 },
        { month: 'Set', consumptionKwh: 3700, generationKwh: 3950, savingsReais: 3280 },
        { month: 'Out', consumptionKwh: 3800, generationKwh: 4000, savingsReais: 3320 },
        { month: 'Nov', consumptionKwh: 3750, generationKwh: 3900, savingsReais: 3240 },
        { month: 'Dez', consumptionKwh: 3850, generationKwh: 3950, savingsReais: 3280 }
      ]
    },
    executiveSummary: 'Projeto em usina de solo com estrutura em alumínio anodizado para pivô de irrigação e ordenha mecânica. Economia projetada superior a 1,3 milhão de reais em 25 anos com linha de financiamento Pronaf/Plano Safra.',
    payments: [
      {
        id: 'pay-005',
        description: 'Financiamento Rural Plano Safra Banco do Brasil',
        amount: 98000.0,
        dueDate: '2026-10-01',
        status: 'pendente',
        method: 'financiamento',
        notes: 'Protocolado no Banco do Brasil'
      }
    ],
    followUps: [
      {
        id: 'f-5',
        date: '2026-08-30T09:30:00Z',
        type: 'email',
        summary: 'Envio da documentação técnica e memorial descritivo para o engenheiro agrônomo da fazenda.',
        author: 'Consultor Solar'
      }
    ],
    internalNotes: 'Aguardando parecer do agrônomo sobre localização do inversor na cabine.'
  }
];
