export type DimType = 'products' | 'production'

export interface Dimension {
  id: string
  label: string
  descs: string[]
  type: DimType
}

export const DIMS: Record<DimType, Dimension[]> = {
  products: [
    {
      id: 'p1', type: 'products',
      label: 'Integração de sensores/atuadores',
      descs: [
        'Nenhum uso de sensores ou atuadores',
        'Sensores/atuadores integrados ao produto',
        'Leituras de sensores processadas pelo produto',
        'Dados avaliados analiticamente pelo produto',
        'Produto responde autonomamente com base nos dados',
      ],
    },
    {
      id: 'p2', type: 'products',
      label: 'Comunicação / Conectividade',
      descs: [
        'Produto sem interfaces de comunicação',
        'Produto envia/recebe sinais I/O',
        'Produto possui field bus interfaces',
        'Produto possui Industrial Ethernet',
        'Produto possui acesso à internet',
      ],
    },
    {
      id: 'p3', type: 'products',
      label: 'Armazenamento e troca de dados',
      descs: [
        'Sem funcionalidades de dados',
        'Possibilidade de identificação individual',
        'Produto possui data store passivo',
        'Armazenamento para troca autônoma de informações',
        'Troca de dados como parte integral do produto',
      ],
    },
    {
      id: 'p4', type: 'products',
      label: 'Monitoramento',
      descs: [
        'Sem monitoramento pelo produto',
        'Detecção de falhas',
        'Registro de condições operacionais para diagnóstico',
        'Prognóstico de condição funcional',
        'Produto adota controle autônomo',
      ],
    },
    {
      id: 'p5', type: 'products',
      label: 'Serviços de TI relacionados',
      descs: [
        'Sem serviços de TI',
        'Serviços via portais online',
        'Execução de serviço diretamente via produto',
        'Serviços executados independentemente',
        'Integração total à infraestrutura de TI',
      ],
    },
    {
      id: 'p6', type: 'products',
      label: 'Modelos de negócio',
      descs: [
        'Lucro com venda de produtos padronizados',
        'Venda e consultoria sobre o produto',
        'Venda, consultoria e customização por cliente',
        'Venda adicional de serviços relacionados',
        'Venda de funções do produto',
      ],
    },
  ],
  production: [
    {
      id: 'pr1', type: 'production',
      label: 'Processamento de dados',
      descs: [
        'Sem processamento de dados',
        'Armazenamento de dados para documentação',
        'Análise de dados para monitoramento de processo',
        'Avaliação para planejamento e controle de processo',
        'Controle automático de processos',
      ],
    },
    {
      id: 'pr2', type: 'production',
      label: 'Comunicação M2M',
      descs: [
        'Sem comunicação entre máquinas',
        'Field bus interfaces',
        'Industrial Ethernet',
        'Máquinas com acesso à internet',
        'Web services e M2M software',
      ],
    },
    {
      id: 'pr3', type: 'production',
      label: 'Networking empresa-produção',
      descs: [
        'Sem networking com outras unidades',
        'Troca via e-mail / telecomunicação',
        'Formatos e regras uniformes de dados',
        'Formatos uniformes + servidores de dados vinculados',
        'TI totalmente interconectada entre divisões',
      ],
    },
    {
      id: 'pr4', type: 'production',
      label: 'Infraestrutura ICT na produção',
      descs: [
        'Troca via e-mail e telefone',
        'Servidores centrais de dados na produção',
        'Portais internet-based com compartilhamento de dados',
        'Troca automatizada de informações (ex: rastreamento)',
        'Fornecedores/clientes integrados ao design de processo',
      ],
    },
    {
      id: 'pr5', type: 'production',
      label: 'Interfaces Homem-Máquina',
      descs: [
        'Sem troca de informação operador-máquina',
        'Uso de interfaces locais de usuário',
        'Monitoramento centralizado/descentralizado da produção',
        'Uso de interfaces móveis',
        'Realidade aumentada e realidade assistida',
      ],
    },
    {
      id: 'pr6', type: 'production',
      label: 'Eficiência com pequenos lotes',
      descs: [
        'Produção rígida e pequena proporção de peças idênticas',
        'Sistemas de produção flexíveis e peças idênticas',
        'Produção flexível + designs modulares',
        'Produção modular orientada a componentes (interna)',
        'Produção modular em redes de criação de valor',
      ],
    },
  ],
}

export const ALL_DIMS = [...DIMS.products, ...DIMS.production]

export function avg(ids: string[], map: Record<string, number>): number | null {
  const vals = ids.map(id => map[id] || 0).filter(v => v > 0)
  if (!vals.length) return null
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

export interface Assessment {
  id: string
  share_id: string
  company: string
  sector: string
  eval_date: string
  scores: Record<string, number>
  goals: Record<string, number>
  notes: Record<string, string>
  created_at: string
  updated_at: string
}
