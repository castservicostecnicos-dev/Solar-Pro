import { jsPDF } from 'jspdf';
import { SolarProposal, FinancialResult } from '../types';
import { formatCurrencyBRL, formatNumberBR } from './solarCalculations';

export function generateProposalPDF(proposal: SolarProposal) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 14;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Accent Line
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 32, pageWidth, 2.5, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SOLARPRO ENERGIA INTELIGENTE', margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Proposta Técnica e Comercial de Engenharia Solar Fotovoltaica', margin, 21);
  doc.text('CNPJ: 42.189.900/0001-30 • contato@solarpro.eng.br • (11) 3456-7890', margin, 26);

  // Proposal Meta (Right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(245, 158, 11);
  doc.text(proposal.proposalNumber, pageWidth - margin, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Data: ${new Date(proposal.createdAt).toLocaleDateString('pt-BR')}`, pageWidth - margin, 21, { align: 'right' });
  doc.text(`Validade: ${new Date(proposal.validUntil).toLocaleDateString('pt-BR')}`, pageWidth - margin, 26, { align: 'right' });

  y = 42;

  // Client Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('DADOS DO CLIENTE E DO LOCAL DE INSTALAÇÃO', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Cliente: ${proposal.client.name}`, margin + 4, y + 12);
  doc.text(`CPF/CNPJ: ${proposal.client.document || 'Não informado'}`, margin + 4, y + 17);
  doc.text(`Telefone/WhatsApp: ${proposal.client.phone}`, margin + 4, y + 22);

  const col2X = margin + 95;
  doc.text(`Endereço: ${proposal.client.address || 'Localização padrão'}`, col2X, y + 12);
  doc.text(`Cidade/UF: ${proposal.client.city} - ${proposal.client.state}`, col2X, y + 17);
  doc.text(`Concessionária: ${proposal.client.concessionaire} ${proposal.client.consumerUnit ? `(UC: ${proposal.client.consumerUnit})` : ''}`, col2X, y + 22);

  y += 32;

  // Executive Pitch Box
  if (proposal.executiveSummary) {
    doc.setFillColor(254, 243, 199); // amber-50
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 17, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14);
    doc.text('RESUMO EXECUTIVO DO SEU PROJETO', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const splitSummary = doc.splitTextToSize(proposal.executiveSummary, pageWidth - (margin * 2) - 8);
    doc.text(splitSummary, margin + 4, y + 9.5);

    y += 22;
  }

  // Section 1: Especificações Técnicas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. DIMENSIONAMENTO TÉCNICO DO SISTEMA FOTOVOLTAICO', margin, y);
  y += 4;

  // 4 Specs Boxes Grid
  const cardW = (pageWidth - (margin * 2) - 9) / 4;
  const cardH = 20;

  const techCards = [
    { title: 'POTÊNCIA TOTAL', val: `${proposal.technical.systemPowerKwp} kWp`, sub: 'Pico nominal' },
    { title: 'MÓDULOS TIER 1', val: `${proposal.technical.moduleCount} un`, sub: `${proposal.technical.module.powerWp}W Monocristalino` },
    { title: 'GERAÇÃO MÉDIA', val: `${formatNumberBR(proposal.financial.monthlyAverageGenerationKwh)} kWh`, sub: 'Mensal estimada' },
    { title: 'ÁREA DE TELHADO', val: `${proposal.technical.areaM2} m²`, sub: `Tipo: ${proposal.technical.roofType.toUpperCase()}` },
  ];

  techCards.forEach((c, idx) => {
    const cx = margin + (idx * (cardW + 3));
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(c.title, cx + (cardW / 2), y + 5, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(c.val, cx + (cardW / 2), y + 11.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text(c.sub, cx + (cardW / 2), y + 16.5, { align: 'center' });
  });

  y += cardH + 4;

  // Equipment List Table
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - (margin * 2), 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Item / Componente', margin + 3, y + 4.5);
  doc.text('Fabricante / Modelo', margin + 45, y + 4.5);
  doc.text('Qtd / Potência', margin + 115, y + 4.5);
  doc.text('Garantia', margin + 155, y + 4.5);

  doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  
  // Row 1 - Modules
  doc.text('Módulos Fotovoltaicos', margin + 3, y + 11);
  doc.text(`${proposal.technical.module.brand} - ${proposal.technical.module.model}`, margin + 45, y + 11);
  doc.text(`${proposal.technical.moduleCount} un (${proposal.technical.module.powerWp}W)`, margin + 115, y + 11);
  doc.text(`${proposal.technical.module.warrantyYears} anos`, margin + 155, y + 11);

  // Row 2 - Inverter
  doc.text('Inversor Interativo', margin + 3, y + 16);
  doc.text(`${proposal.technical.inverter.brand} - ${proposal.technical.inverter.model}`, margin + 45, y + 16);
  doc.text(`1 un (${proposal.technical.inverter.powerKw} kW)`, margin + 115, y + 16);
  doc.text(`${proposal.technical.inverter.warrantyYears} anos`, margin + 155, y + 16);

  // Row 3 - Structure
  doc.text('Estrutura & Engenharia', margin + 3, y + 20.5);
  doc.text(`Estrutura em Alumínio Anodizado para ${proposal.technical.roofType} + ART`, margin + 45, y + 20.5);
  doc.text('Completo', margin + 115, y + 20.5);
  doc.text('5 anos instal.', margin + 155, y + 20.5);

  y += 28;

  // Section 2: Estudo Financeiro e Economia
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ANÁLISE ECONÔMICA, PAYBACK E ECONOMIA', margin, y);
  y += 4;

  // Financial Cards Grid
  const finCards = [
    { title: 'ECONOMIA MENSAL', val: formatCurrencyBRL(proposal.financial.monthlySavings), sub: 'Redução na fatura' },
    { title: 'ECONOMIA ANUAL', val: formatCurrencyBRL(proposal.financial.annualSavings), sub: 'Ano 1 projetado' },
    { title: 'RETORNO (PAYBACK)', val: `${proposal.financial.paybackYears} anos`, sub: `~${proposal.financial.paybackMonths} meses` },
    { title: 'ECONOMIA EM 25 ANOS', val: formatCurrencyBRL(proposal.financial.twentyFiveYearSavings), sub: 'Com inflação energética' },
  ];

  finCards.forEach((c, idx) => {
    const cx = margin + (idx * (cardW + 3));
    doc.setFillColor(240, 253, 244); // green-50
    doc.setDrawColor(187, 247, 208); // green-200
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(21, 128, 61); // green-700
    doc.text(c.title, cx + (cardW / 2), y + 5, { align: 'center' });

    doc.setFontSize(9.5);
    doc.setTextColor(22, 101, 52); // green-800
    doc.text(c.val, cx + (cardW / 2), y + 11.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(22, 101, 52);
    doc.text(c.sub, cx + (cardW / 2), y + 16.5, { align: 'center' });
  });

  y += cardH + 4;

  // Environmental impact strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 8, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Sustentabilidade: Evita a emissão de ${proposal.financial.co2AvoidedTonsPerYear} toneladas de CO2/ano • Equivalente a ${proposal.financial.treesPlantedEquivalent} árvores plantadas`, pageWidth / 2, y + 5, { align: 'center' });

  y += 12;

  // Section 3: Condições Comerciais e Investimento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. VALOR DO INVESTIMENTO E FORMAS DE PAGAMENTO', margin, y);
  y += 4;

  const totalInv = proposal.financial.totalInvestment;
  const cashDiscount = Math.round(totalInv * 0.95);
  const parcel36 = Math.round((totalInv * 1.25) / 36);
  const parcel60 = Math.round((totalInv * 1.45) / 60);
  const parcel72 = Math.round((totalInv * 1.56) / 72);

  // Investment Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 25, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('INVESTIMENTO TURNKEY (EQUIPAMENTOS + PROJETO + HOMOLOGAÇÃO + INSTALAÇÃO)', margin + 4, y + 6);

  doc.setFontSize(13);
  doc.setTextColor(245, 158, 11);
  doc.text(formatCurrencyBRL(totalInv), margin + 4, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`• À vista com 5% de desconto: ${formatCurrencyBRL(cashDiscount)} (Sinal + entrega)`, margin + 4, y + 19.5);
  doc.text(`• Financiamento bancário em até 72x com carência de até 90 dias`, margin + 4, y + 23);

  // Simulation column
  const simX = margin + 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Simulação de Financiamento Solar:', simX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`36x de ~${formatCurrencyBRL(parcel36)} / mês`, simX, y + 11);
  doc.text(`60x de ~${formatCurrencyBRL(parcel60)} / mês (próximo da economia)`, simX, y + 15.5);
  doc.text(`72x de ~${formatCurrencyBRL(parcel72)} / mês (substitui a conta)`, simX, y + 20);

  y += 30;

  // Section 4: Assinatura Digital / Aceite
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. TERMO DE ACEITE E ASSINATURA DIGITAL', margin, y);
  y += 4;

  const signBoxH = 34;
  doc.setDrawColor(203, 213, 225);

  if (proposal.signature) {
    // Verified Signature Box
    doc.setFillColor(240, 253, 244); // light green
    doc.roundedRect(margin, y, pageWidth - (margin * 2), signBoxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 128, 61);
    doc.text('DOCUMENTO ASSINADO DIGITALMENTE VIA SOLARPRO CERTIFICATE', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Assinado por: ${proposal.signature.signedBy}`, margin + 4, y + 12);
    doc.text(`Documento (CPF): ${proposal.signature.documentNumber}`, margin + 4, y + 17);
    doc.text(`Data e Horário: ${new Date(proposal.signature.signedAt).toLocaleString('pt-BR')}`, margin + 4, y + 22);
    doc.text(`IP / Hash de Integridade: ${proposal.signature.validationHash} (${proposal.signature.ipAddress})`, margin + 4, y + 27);
    doc.text('Declaração: O contratante declara ter conferido e aprovado todas as especificações técnicas.', margin + 4, y + 31);

    // Stamp badge on right
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(pageWidth - margin - 38, y + 5, 34, 16, 2, 2, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text('AUTENTICADO', pageWidth - margin - 21, y + 12, { align: 'center' });
    doc.setFontSize(6);
    doc.text('ASSINATURA VÁLIDA', pageWidth - margin - 21, y + 17, { align: 'center' });
  } else {
    // Blank signature placeholder for manual or future digital signature
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), signBoxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Para aprovar e garantir as condições técnicas e tarifárias desta proposta, assine digitalmente pelo app SolarPro', margin + 4, y + 6);

    const signLineY = y + 24;
    doc.setDrawColor(148, 163, 184);
    doc.line(margin + 15, signLineY, margin + 85, signLineY);
    doc.line(pageWidth - margin - 85, signLineY, pageWidth - margin - 15, signLineY);

    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(proposal.client.name, margin + 50, signLineY + 4, { align: 'center' });
    doc.text('Cliente Contratante', margin + 50, signLineY + 7.5, { align: 'center' });

    doc.text('SolarPro Engenharia', pageWidth - margin - 50, signLineY + 4, { align: 'center' });
    doc.text('Responsável Técnico - CREA', pageWidth - margin - 50, signLineY + 7.5, { align: 'center' });
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Proposta ${proposal.proposalNumber} • Documento gerado pelo app SolarPro PWA • Página 1 de 1`, pageWidth / 2, 290, { align: 'center' });

  // Save the generated PDF
  doc.save(`${proposal.proposalNumber}_${proposal.client.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export function generatePerformanceReportPDF(proposals: SolarProposal[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 14;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RELATÓRIO DE DESEMPENHO E CRM SOLAR', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Análise gerencial de vendas, dimensionamento e conversão de propostas', margin, 20);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - margin, 20, { align: 'right' });

  y = 38;

  // Calculate Metrics
  const totalProposals = proposals.length;
  const wonProposals = proposals.filter(p => p.status === 'assinado' || p.status === 'instalacao' || p.status === 'concluido');
  const conversionRate = totalProposals > 0 ? ((wonProposals.length / totalProposals) * 100).toFixed(1) : '0';
  const totalPipelineValue = proposals.reduce((acc, p) => acc + p.financial.totalInvestment, 0);
  const totalWonValue = wonProposals.reduce((acc, p) => acc + p.financial.totalInvestment, 0);
  const totalKwp = proposals.reduce((acc, p) => acc + p.technical.systemPowerKwp, 0);
  const averageTicket = totalProposals > 0 ? Math.round(totalPipelineValue / totalProposals) : 0;

  // Key KPI Cards
  const kpis = [
    { label: 'TOTAL DE PROPOSTAS', val: `${totalProposals}`, sub: `${wonProposals.length} fechadas` },
    { label: 'TAXA DE CONVERSÃO', val: `${conversionRate}%`, sub: 'Propostas ganhas' },
    { label: 'PIPELINE TOTAL', val: formatCurrencyBRL(totalPipelineValue), sub: `Fechado: ${formatCurrencyBRL(totalWonValue)}` },
    { label: 'POTÊNCIA TOTAL', val: `${totalKwp.toFixed(1)} kWp`, sub: `Ticket médio: ${formatCurrencyBRL(averageTicket)}` },
  ];

  const cardW = (pageWidth - (margin * 2) - 9) / 4;
  kpis.forEach((k, idx) => {
    const cx = margin + (idx * (cardW + 3));
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(cx, y, cardW, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(k.label, cx + (cardW / 2), y + 5, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(k.val, cx + (cardW / 2), y + 11.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text(k.sub, cx + (cardW / 2), y + 16.5, { align: 'center' });
  });

  y += 28;

  // Table of Proposals
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('DETALHAMENTO DE PROPOSTAS E PIPELINE DE NEGÓCIOS', margin, y);
  y += 4;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('Código', margin + 2, y + 4.5);
  doc.text('Cliente', margin + 30, y + 4.5);
  doc.text('Cidade/UF', margin + 80, y + 4.5);
  doc.text('Potência', margin + 115, y + 4.5);
  doc.text('Investimento', margin + 138, y + 4.5);
  doc.text('Status', margin + 168, y + 4.5);

  y += 7;

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);

  proposals.forEach((prop) => {
    if (y > 270) {
      doc.addPage();
      y = 15;
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);

    doc.setTextColor(15, 23, 42);
    doc.text(prop.proposalNumber, margin + 2, y + 4);
    doc.text(prop.client.name.substring(0, 26), margin + 30, y + 4);
    doc.text(`${prop.client.city}/${prop.client.state}`, margin + 80, y + 4);
    doc.text(`${prop.technical.systemPowerKwp} kWp`, margin + 115, y + 4);
    doc.text(formatCurrencyBRL(prop.financial.totalInvestment), margin + 138, y + 4);

    // Status label
    const statusMap: Record<string, string> = {
      novo_lead: 'Novo Lead',
      dimensionamento: 'Dimensionando',
      proposta_enviada: 'Enviada',
      follow_up: 'Follow-up',
      assinado: 'Assinada',
      instalacao: 'Instalação',
      concluido: 'Concluído',
      perdido: 'Perdido',
    };
    doc.text(statusMap[prop.status] || prop.status, margin + 168, y + 4);

    y += 7.5;
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('SolarPro PWA • Relatório de Inteligência Comercial e Desempenho Fotovoltaico', pageWidth / 2, 290, { align: 'center' });

  doc.save(`Relatorio_Desempenho_SolarPro_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportProposalsToCSV(proposals: SolarProposal[]) {
  const headers = [
    'Número da Proposta',
    'Data de Criação',
    'Cliente',
    'CPF/CNPJ',
    'Telefone',
    'Email',
    'Cidade',
    'Estado',
    'Concessionária',
    'Tipo de Instalação',
    'Tipo de Telhado',
    'Consumo Mensal (kWh)',
    'Potência do Sistema (kWp)',
    'Qtd Módulos',
    'Modelo Módulo',
    'Inversor',
    'Área Telhado (m2)',
    'Economia Mensal Estimada (R$)',
    'Economia Anual (R$)',
    'Investimento Total (R$)',
    'Payback (Anos)',
    'Status CRM',
    'Assinado Digitalmente',
    'Data da Assinatura'
  ];

  const rows = proposals.map(p => [
    `"${p.proposalNumber}"`,
    `"${new Date(p.createdAt).toLocaleDateString('pt-BR')}"`,
    `"${p.client.name.replace(/"/g, '""')}"`,
    `"${p.client.document || ''}"`,
    `"${p.client.phone}"`,
    `"${p.client.email || ''}"`,
    `"${p.client.city}"`,
    `"${p.client.state}"`,
    `"${p.client.concessionaire}"`,
    `"${p.technical.installationType}"`,
    `"${p.technical.roofType}"`,
    p.technical.monthlyAverageKwh,
    p.technical.systemPowerKwp,
    p.technical.moduleCount,
    `"${p.technical.module.model}"`,
    `"${p.technical.inverter.model}"`,
    p.technical.areaM2,
    p.financial.monthlySavings,
    p.financial.annualSavings,
    p.financial.totalInvestment,
    p.financial.paybackYears,
    `"${p.status}"`,
    p.signature ? 'SIM' : 'NÃO',
    p.signature ? `"${new Date(p.signature.signedAt).toLocaleDateString('pt-BR')}"` : ''
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Propostas_SolarPro_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
