import { Apple, Brain, Smile, Stethoscope, Syringe } from 'lucide-react'
import { Especialidade } from './tipos'

/**
 * Fonte única das especialidades e das perguntas de anamnese por tipo de
 * atendimento — perguntas definitivas, baseadas na pesquisa sobre o
 * Protocolo de Manchester e nas respostas do formulário enviado a médicos
 * ("Pesquisa Médica TCC.docx", seção "Perguntas definitivas e peso").
 *
 * O peso de cada resposta NÃO vive aqui — o cálculo de nível de urgência é
 * feito só pelo backend (AnamneseService.defineUrgencia), a partir do
 * especialidadeId + idade + respostas enviados. Os ids de cada pergunta
 * (e das opções de "selecao") precisam bater exatamente com os literais
 * usados lá — ver backend/.../service/AnamneseService.java.
 *
 * Duas perguntas do documento original davam duas respostas possíveis pra
 * um "Sim" sem um critério objetivo de corte entre elas (ex.: "dor no
 * peito ou falta de ar" valendo peso 10 OU 8) — nesses casos, usei sempre o
 * peso mais alto, seguindo o princípio de segurança do próprio documento
 * ("na dúvida, considera-se o discriminador positivo... elevando a
 * prioridade em vez de reduzi-la"). Duas outras perguntas foram reescritas
 * pra manter a convenção de que "Sim" sempre indica o sinal de alerta
 * (nunca o oposto), preservando o critério clínico original:
 * "Você consegue caminhar e se manter em pé sem ajuda?" (peso valia para
 * "não consegue") virou "Você tem dificuldade para caminhar ou se manter
 * em pé sem ajuda?"; mesma ideia para a pergunta de ingestão de
 * água/alimentos da Nutrição.
 */
export const especialidades: Especialidade[] = [
  {
    id: 'clinico_geral',
    nome: 'Clínico Geral',
    descricaoCurta: 'Dores agudas, febre, acompanhamento de crônicos.',
    icone: Stethoscope,
    perguntas: [
      { id: 'dor_peito_falta_ar', tipo: 'sim_nao', texto: 'Você está sentindo dor no peito ou falta de ar neste momento?' },
      { id: 'alteracao_consciencia', tipo: 'sim_nao', texto: 'Você desmaiou, está confuso ou com dificuldade de se manter acordado?' },
      { id: 'intensidade_dor', tipo: 'escala_0_10', texto: 'Em uma escala de 0 a 10, qual a intensidade da sua dor?' },
      { id: 'temperatura', tipo: 'numero', texto: 'Você está com febre? Se sim, qual a temperatura medida?', unidade: '°C', placeholder: 'Ex: 36.5' },
      {
        id: 'tempo_sintomas',
        tipo: 'selecao',
        texto: 'Há quanto tempo começaram os sintomas?',
        opcoes: [
          { id: 'antigo_estavel', label: 'Já faz vários dias, estável' },
          { id: 'recente', label: 'Começou hoje/agora' },
        ],
      },
    ],
  },
  {
    id: 'enfermagem',
    nome: 'Enfermagem',
    descricaoCurta: 'Triagem inicial, vacinas, curativos, testes rápidos.',
    icone: Syringe,
    perguntas: [
      { id: 'sinais_vitais_alterados', tipo: 'sim_nao', texto: 'Na aferição, seus sinais vitais (pressão, pulso, saturação) estão alterados?' },
      {
        id: 'sangramento',
        tipo: 'selecao',
        texto: 'Há algum sangramento ativo?',
        opcoes: [
          { id: 'nao', label: 'Não' },
          { id: 'pequeno', label: 'Sim, sangramento pequeno' },
          { id: 'grande', label: 'Sim, sangramento grande, não para com compressão' },
        ],
      },
      { id: 'doenca_cronica_descompensada', tipo: 'sim_nao', texto: 'Você tem alguma doença crônica (diabetes, hipertensão) descompensada agora?' },
      { id: 'intensidade_dor', tipo: 'escala_0_10', texto: 'Qual a intensidade da sua dor, de 0 a 10?' },
      { id: 'dificuldade_ficar_em_pe', tipo: 'sim_nao', texto: 'Você tem dificuldade para caminhar ou se manter em pé sem ajuda?' },
    ],
  },
  {
    id: 'odontologia',
    nome: 'Dentista',
    descricaoCurta: 'Dores de dente, profilaxia, extrações.',
    icone: Smile,
    perguntas: [
      { id: 'inchaco_via_aerea', tipo: 'sim_nao', texto: 'Você tem inchaço no rosto ou pescoço com dificuldade para engolir ou respirar?' },
      { id: 'sangramento_boca', tipo: 'sim_nao', texto: 'Há sangramento na boca que não para (após extração ou trauma)?' },
      { id: 'intensidade_dor', tipo: 'escala_0_10', texto: 'Qual a intensidade da sua dor de dente, de 0 a 10?' },
      { id: 'trauma_recente', tipo: 'sim_nao', texto: 'O problema foi causado por trauma ou acidente recente (dente quebrado ou avulsionado)?' },
      { id: 'problema_eletivo', tipo: 'sim_nao', texto: 'É um problema antigo, sem dor ou sangramento (estético ou revisão)?' },
    ],
  },
  {
    id: 'psicologia',
    nome: 'Psicólogo',
    descricaoCurta: 'Ansiedade, depressão, acolhimento.',
    icone: Brain,
    perguntas: [
      { id: 'risco_autolesao', tipo: 'sim_nao', texto: 'Há risco imediato de a pessoa se machucar ou de machucar outras pessoas agora?' },
      { id: 'agitacao_intensa', tipo: 'sim_nao', texto: 'A pessoa está muito agitada, agressiva ou aparentemente fora de controle?' },
      { id: 'sofrimento_agudo', tipo: 'sim_nao', texto: 'Há sofrimento emocional intenso e agudo neste momento (crise de ansiedade ou pânico)?' },
      { id: 'agravamento_recente', tipo: 'sim_nao', texto: 'Os sintomas surgiram ou pioraram recentemente, ou após um evento específico?' },
      { id: 'acompanhamento_rotina', tipo: 'sim_nao', texto: 'É um acompanhamento de rotina, sem crise ou risco atual?' },
    ],
  },
  {
    id: 'nutricao',
    nome: 'Nutricionista',
    descricaoCurta: 'Controle de diabetes, hipertensão, obesidade.',
    icone: Apple,
    perguntas: [
      { id: 'glicemia_alterada', tipo: 'sim_nao', texto: 'Você é diabético e está com sintomas de glicemia muito alta ou muito baixa agora?' },
      { id: 'dificuldade_ingestao', tipo: 'sim_nao', texto: 'Você tem recusa ou incapacidade de se alimentar ou beber água?' },
      { id: 'perda_peso_rapida', tipo: 'sim_nao', texto: 'Houve perda de peso rápida e não intencional recentemente?' },
      { id: 'dificuldade_engolir', tipo: 'sim_nao', texto: 'Você tem dificuldade ou dor para engolir os alimentos?' },
      { id: 'acompanhamento_rotina', tipo: 'sim_nao', texto: 'É um acompanhamento de rotina (reeducação alimentar, plano alimentar), sem sintomas agudos?' },
    ],
  },
]

export function buscarEspecialidade(id: string): Especialidade | undefined {
  return especialidades.find(e => e.id === id)
}
