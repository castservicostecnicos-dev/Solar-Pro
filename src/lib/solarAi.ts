/**
 * Gerador de Textos de Apresentação e Follow-up Comercial com IA.
 * 
 * Arquitetura Híbrida / Static-Site Ready:
 * Se o app estiver rodando com o servidor Node.js backend ativo (/api/ai/pitch), ele consome a rota do servidor.
 * Se o app for publicado como STATIC SITE no Render (sem servidor backend ligado), ele gera instantaneamente
 * modelos determinísticos e contextuais de alta qualidade e alta conversão para o WhatsApp e Proposta,
 * sem travar, sem dar erro 404 e sem cold start!
 */

export interface PitchParams {
  clientName?: string;
  systemKwp: number;
  monthlySavings: number;
  investment: number;
  paybackYears: number;
  roofType?: string;
  state?: string;
  twentyFiveYearSavings?: number;
}

export interface FollowUpParams {
  clientName: string;
  daysSinceSent: number;
  proposalValue: number;
  status: string;
  objection?: string;
  systemKwp?: number;
  monthlySavings?: number;
}

export async function generateSolarPitch(params: PitchParams): Promise<string> {
  // 1. Tenta chamar o endpoint de backend caso o servidor esteja presente
  try {
    const res = await fetch('/api/ai/pitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) return data.text;
    }
  } catch {
    // Modo Static Site (sem backend /api disponível)
  }

  // 2. Geração Contextual Autônoma de Alta Performance (Static Site)
  const client = params.clientName?.trim() || 'Cliente';
  const kwp = params.systemKwp ? params.systemKwp.toFixed(2).replace('.', ',') : '5,50';
  const savings = params.monthlySavings 
    ? params.monthlySavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 650,00';
  const investment = params.investment 
    ? params.investment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 18.500,00';
  const payback = params.paybackYears ? params.paybackYears.toFixed(1).replace('.', ',') : '3,2';
  const roof = params.roofType || 'Cerâmico';

  return `Olá ${client}! Com a instalação do seu sistema solar fotovoltaico de ${kwp} kWp (estrutura adaptada para telhado ${roof}), você deixará de ser refém dos constantes aumentos tarifários da distribuidora e economizará cerca de ${savings} todos os meses na sua conta de energia.

Com um investimento total de ${investment} e tempo estimado de retorno (payback) em apenas ${payback} anos, a economia proporcionada pela usina paga as parcelas do projeto. Além disso, com garantia de 25 anos na geração dos módulos, você transforma uma despesa fixa em patrimônio limpo, valorizando o seu imóvel desde o primeiro dia de operação.`;
}

export async function generateFollowUpMessage(params: FollowUpParams): Promise<string> {
  // 1. Tenta chamar o endpoint de backend caso o servidor esteja presente
  try {
    const res = await fetch('/api/ai/followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.message) return data.message;
    }
  } catch {
    // Modo Static Site (sem backend /api disponível)
  }

  // 2. Geração Contextual Autônoma de Alta Performance para WhatsApp (Static Site)
  const clientFirstName = params.clientName?.trim().split(' ')[0] || 'Cliente';
  const kwp = params.systemKwp ? `${params.systemKwp.toFixed(2).replace('.', ',')} kWp` : '';
  const savings = params.monthlySavings 
    ? params.monthlySavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '';

  if (params.objection) {
    return `Olá ${clientFirstName}, tudo bem? Estive analisando o que conversamos sobre ${params.objection.toLowerCase()}. Preparamos uma alternativa especial com carência de até 90 dias na primeira parcela do financiamento, para que você já comece a pagar apenas quando a economia solar estiver ativa na sua conta. Podemos conversar 3 minutos hoje?`;
  }

  if (params.status === 'negotiating') {
    return `Olá ${clientFirstName}! Sobre o seu projeto solar ${kwp ? `de ${kwp} ` : ''}da CAST SolarPro: conseguimos aprovação prévia com taxas reduzidas em até 72x bancárias. A parcela fica menor do que a sua economia mensal estimada (${savings || 'na conta'}). Você teria 5 minutos hoje para alinharmos os detalhes finais?`;
  }

  if (params.daysSinceSent > 4) {
    return `Olá ${clientFirstName}, tudo bem? Passando para saber se você conseguiu dar uma olhada na proposta solar que montamos. Conseguimos segurar a cotação dos módulos e do inversor desta semana para garantir as melhores condições financeiras para você. Se quiser tirar alguma dúvida técnica ou alterar a potência, estou à disposição!`;
  }

  return `Olá ${clientFirstName}, tudo bem? Aqui é da CAST SolarPro! Passando para checar se você recebeu o estudo solar que personalizamos para o seu consumo. O projeto foi desenhado para maximizar a sua economia mensal de forma rápida e segura. Ficou com alguma dúvida sobre o payback ou sobre as opções de parcelamento?`;
}
