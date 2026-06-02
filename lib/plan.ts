import { ALL_DIMS, type DimType, type Assessment } from './dims'

export interface DimDetail {
  id: string
  label: string
  type: DimType
  score: number
  goal: number
  gap: number
  currentDesc: string
  nextStep: string | null
}

export interface PlannedInitiative {
  n: number
  title: string
  body: string
  horizon: string
  priority: 'Alta' | 'Média' | 'Baixa'
  relevanceScore: number
  dims: DimDetail[]
}

const INITIATIVES_DEF = [
  {
    n: 1,
    title: 'Diagnóstico e quick wins',
    body: 'Mapear processos críticos, identificar automações de baixo custo e alta visibilidade. Implementar sensoriamento básico nas linhas prioritárias.',
    horizon: '0–6 meses',
    dimIds: ['pr1', 'pr5', 'pr6'],
  },
  {
    n: 2,
    title: 'Conectividade e integração de dados',
    body: 'Estabelecer backbone de comunicação industrial (fieldbus ou Ethernet industrial). Centralizar dados de produção em plataforma única com dashboard operacional.',
    horizon: '0–12 meses',
    dimIds: ['pr2', 'pr3', 'p2', 'p3'],
  },
  {
    n: 3,
    title: 'Digitalização de produtos',
    body: 'Incorporar sensores e interfaces de comunicação nos produtos. Desenvolver portais de serviço, monitoramento remoto e coleta de dados em campo.',
    horizon: '6–18 meses',
    dimIds: ['p1', 'p4', 'p5'],
  },
  {
    n: 4,
    title: 'Capacitação e cultura digital',
    body: 'Treinar equipes em tecnologias 4.0, criar times multidisciplinares de TI + operação, definir KPIs de transformação digital e governança de dados.',
    horizon: '6–18 meses',
    dimIds: ['pr4', 'pr5', 'p5'],
  },
  {
    n: 5,
    title: 'Automação e controle inteligente',
    body: 'Implementar controles CNC/SCADA/MES. Integrar sistemas ERP à produção. Evoluir para monitoramento preditivo com IA e machine learning.',
    horizon: '12–24 meses',
    dimIds: ['pr1', 'pr2', 'pr4'],
  },
  {
    n: 6,
    title: 'Modelos de negócio baseados em dados',
    body: 'Desenvolver serviços por assinatura e manutenção preditiva. Explorar novas receitas com dados dos produtos em campo. Construir ecossistema de parceiros digitais.',
    horizon: '18–36 meses',
    dimIds: ['p6', 'p4', 'p3'],
  },
]

// 48 next-step strings: NEXT_STEPS[dimId][currentScore] → what to do to advance to score+1
const NEXT_STEPS: Record<string, Record<number, string>> = {
  p1: {
    1: 'Selecionar e instalar sensores e atuadores adequados ao produto. Integrar o hardware para que o produto passe a capturar leituras do ambiente.',
    2: 'Implementar microcontrolador ou processador embarcado para processar localmente as leituras dos sensores. Criar lógica de firmware para tratamento e filtragem de dados.',
    3: 'Desenvolver módulo analítico embarcado que avalie padrões nos dados coletados e gere indicadores de condição. Aplicar algoritmos básicos de detecção de anomalias.',
    4: 'Implementar lógica de controle autônomo no produto para que ele tome decisões e acione atuadores sem intervenção humana. Validar comportamento em campo com casos de uso reais.',
  },
  p2: {
    1: 'Adicionar interfaces de entrada/saída digitais (I/O) ao produto para envio e recebimento de sinais básicos. Definir protocolo mínimo de troca de estado.',
    2: 'Implementar interfaces field bus (CAN, Profibus, Modbus) no produto para comunicação determinística em rede industrial. Documentar endereçamento e mapa de registradores.',
    3: 'Migrar ou complementar a comunicação para Industrial Ethernet (EtherNet/IP, PROFINET, EtherCAT). Garantir largura de banda e latência compatíveis com o ciclo do produto.',
    4: 'Adicionar conectividade internet ao produto (Wi-Fi, 4G/5G ou Ethernet IP). Implementar protocolo seguro (MQTT, HTTPS) para comunicação com nuvem ou servidores remotos.',
  },
  p3: {
    1: 'Implementar identificação única por produto (código de série, RFID, QR code). Assegurar rastreabilidade mínima do produto ao longo do ciclo de vida.',
    2: 'Adicionar capacidade de armazenamento passivo de dados ao produto (EEPROM, flash, cartão SD). Definir estrutura de dados para histórico de operação local.',
    3: 'Desenvolver mecanismo de troca autônoma de dados entre produto e sistemas externos (upload agendado, sincronização por evento). Implementar esquema de dados padronizado (JSON, XML).',
    4: 'Integrar a troca de dados como função central do produto, com APIs abertas e integração nativa a plataformas. Garantir integridade e versionamento dos dados trocados.',
  },
  p4: {
    1: 'Implementar rotinas básicas de detecção de falha no produto (sensores de estado, watchdogs). Criar indicadores de alerta acessíveis ao operador.',
    2: 'Instrumentar o produto para registrar condições operacionais (temperatura, vibração, ciclos) em log persistente. Disponibilizar histórico para diagnóstico técnico.',
    3: 'Desenvolver modelos de prognóstico de condição funcional baseados no histórico acumulado. Gerar previsões de manutenção e alertas preventivos.',
    4: 'Implementar controle adaptativo autônomo para que o produto corrija sua própria operação com base nas previsões de condição. Fechar o loop diagnóstico-atuação sem intervenção humana.',
  },
  p5: {
    1: 'Criar um portal online básico (web ou app) com informações de suporte, manuais e FAQ do produto. Migrar o primeiro ponto de contato do cliente para o canal digital.',
    2: 'Permitir que o produto execute ou acione serviços diretamente (solicitação de manutenção, download de atualização, abertura de ticket). Integrar o produto ao portal de serviços.',
    3: 'Implementar execução independente de serviços pelo produto (autodiagnóstico, atualização automática de firmware, relatórios automáticos). Reduzir dependência de ação do usuário.',
    4: 'Integrar o produto à infraestrutura de TI da empresa e do cliente de forma completa (ERP, CRM, MES). Automatizar fluxos de dados entre o produto e todos os sistemas envolvidos.',
  },
  p6: {
    1: 'Estruturar oferta de consultoria técnica e serviço pós-venda como produto comercial. Criar catálogo de serviços com condições contratuais diferenciadas por perfil de cliente.',
    2: 'Desenvolver capacidade de customização por cliente com custo controlado (configuradores, módulos opcionais, personalização de firmware). Mapear os pedidos de customização mais frequentes.',
    3: 'Lançar linha de serviços complementares ao produto físico (garantia estendida, manutenção preventiva contratada, monitoramento remoto). Precificar com base em valor entregue.',
    4: 'Criar modelos de receita baseados em uso ou desempenho do produto (pay-per-use, outcome-based). Explorar dados do produto em campo para monetizar insights e gerar novos serviços.',
  },
  pr1: {
    1: 'Implementar sistema básico de armazenamento e documentação de dados de produção (planilhas centralizadas, banco de dados simples). Definir quais variáveis de processo devem ser registradas.',
    2: 'Conectar dados de processo a ferramentas de análise (dashboards, relatórios automáticos). Criar monitores de KPI operacional em tempo real ou próximo disso.',
    3: 'Usar os dados analisados como insumo ativo para planejamento e controle de processo (ajuste de ordens, alocação de recursos, priorização de filas). Fechar o ciclo dado-decisão-ação.',
    4: 'Implementar controle automático de processos guiado por dados (MES integrado, algoritmos de otimização, lógica de decisão autônoma). Minimizar intervenção humana no ciclo operacional.',
  },
  pr2: {
    1: 'Instalar field bus (Profibus, Modbus, DeviceNet) para conectar os equipamentos principais. Mapear todos os dispositivos e criar endereçamento de rede padronizado.',
    2: 'Migrar a comunicação de campo para Industrial Ethernet (PROFINET, EtherNet/IP). Aumentar largura de banda e viabilizar integração com sistemas de supervisão.',
    3: 'Conectar máquinas à internet ou à rede corporativa via gateway seguro. Habilitar coleta de dados remota e acesso a serviços externos.',
    4: 'Implementar web services e protocolos M2M modernos (OPC-UA, MQTT, REST). Permitir integração entre máquinas de fornecedores diferentes e com sistemas em nuvem.',
  },
  pr3: {
    1: 'Estruturar fluxo formal de comunicação entre produção e demais áreas usando canais digitais padronizados. Criar templates e rotinas definidas de troca de informação.',
    2: 'Padronizar formatos de dados entre áreas (planilhas-modelo, ERP mínimo, codificação comum de produtos). Reduzir o retrabalho de conversão e interpretação de dados.',
    3: 'Implementar servidor de dados compartilhado acessível por produção, engenharia e comercial. Garantir que as principais informações sejam consultadas na mesma fonte.',
    4: 'Alcançar interconexão total de TI entre produção, engenharia, vendas, logística e gestão. Usar plataforma integrada (ERP+MES) com visibilidade em tempo real para todas as divisões.',
  },
  pr4: {
    1: 'Instalar servidores centrais de dados na produção para substituir troca ad hoc por e-mail. Criar repositório central de documentos e registros de produção.',
    2: 'Implantar portais web internos de compartilhamento de dados acessíveis ao chão de fábrica (ordens, indicadores, procedimentos). Garantir acesso a todos os operadores.',
    3: 'Implementar rastreamento automatizado de materiais, ordens e equipamentos (códigos de barras, RFID, MES básico). Eliminar registros manuais nos pontos críticos do processo.',
    4: 'Integrar fornecedores e clientes ao design do processo produtivo via plataformas de colaboração (EDI, portais de fornecedor, visibilidade de estoque em tempo real).',
  },
  pr5: {
    1: 'Instalar interfaces locais de usuário nos equipamentos (painéis HMI, telas de operação). Garantir que o operador tenha visibilidade do estado da máquina sem ferramentas externas.',
    2: 'Implantar sistema de monitoramento centralizado ou descentralizado da produção (SCADA básico, painéis de supervisão). Dar ao supervisor visão integrada do chão de fábrica.',
    3: 'Equipar operadores e técnicos com interfaces móveis (tablets, smartphones industriais). Habilitar consulta de ordens, manuais e registros diretamente no campo.',
    4: 'Pilotar realidade aumentada (AR) ou assistida para suporte à operação e manutenção. Avaliar casos de uso como sobreposição de informações técnicas em campo com óculos AR.',
  },
  pr6: {
    1: 'Introduzir sistemas de produção flexíveis (setup rápido, troca de ferramentas padronizada). Identificar e atacar os maiores tempos de setup e changeover nas linhas principais.',
    2: 'Adotar designs modulares de produto e processo que permitam reconfiguração ágil. Mapear quais componentes ou operações podem ser padronizados sem perder flexibilidade.',
    3: 'Estruturar produção modular orientada a componentes internamente, com células de manufatura intercambiáveis. Implementar lógica de sequenciamento dinâmico de ordens.',
    4: 'Expandir a produção modular para redes de criação de valor externas (co-manufatura, subcontratação coordenada digitalmente). Integrar parceiros à cadeia produtiva com visibilidade compartilhada.',
  },
}

export function generatePlan(assessment: Assessment): PlannedInitiative[] {
  const result: PlannedInitiative[] = []

  for (const ini of INITIATIVES_DEF) {
    const dimDetails: DimDetail[] = []

    for (const dimId of ini.dimIds) {
      const score = assessment.scores[dimId] || 0
      if (score === 0) continue

      const goal = assessment.goals[dimId] || 0
      let gap: number

      if (goal > 0) {
        gap = goal - score
        if (gap <= 0) continue
      } else {
        gap = 3 - score
        if (gap <= 0) continue
      }

      const dim = ALL_DIMS.find(d => d.id === dimId)!
      dimDetails.push({
        id: dimId,
        label: dim.label,
        type: dim.type,
        score,
        goal,
        gap,
        currentDesc: dim.descs[score - 1],
        nextStep: score < 5 ? (NEXT_STEPS[dimId]?.[score] ?? null) : null,
      })
    }

    if (dimDetails.length === 0) continue

    const relevanceScore = Math.round(
      (dimDetails.reduce((s, d) => s + d.gap, 0) / dimDetails.length) * 10
    ) / 10

    const priority: PlannedInitiative['priority'] =
      relevanceScore > 1.5 ? 'Alta' : relevanceScore >= 0.5 ? 'Média' : 'Baixa'

    dimDetails.sort((a, b) => b.gap - a.gap)

    result.push({
      n: ini.n,
      title: ini.title,
      body: ini.body,
      horizon: ini.horizon,
      priority,
      relevanceScore,
      dims: dimDetails,
    })
  }

  result.sort((a, b) => b.relevanceScore - a.relevanceScore)
  return result
}
