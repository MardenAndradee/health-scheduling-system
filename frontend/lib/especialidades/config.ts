import { Apple, Brain, Smile, Stethoscope, Syringe } from 'lucide-react'
import { Especialidade } from './tipos'

/**
 * Fonte única das especialidades e das perguntas de anamnese por tipo de
 * atendimento. O texto exato (e a lista de perguntas em si) é um rascunho do
 * posto de saúde e deve mudar com o tempo — editar aqui nunca deve exigir
 * mexer em componente (ver PerguntaField.tsx).
 */
export const especialidades: Especialidade[] = [
  {
    id: 'clinico_geral',
    nome: 'Clínico Geral',
    descricaoCurta: 'Dores agudas, febre, acompanhamento de crônicos.',
    icone: Stethoscope,
    grupos: [
      {
        id: 'sintomas_alarme',
        titulo: 'Sintomas de Alarme',
        pesoMin: 9,
        pesoMax: 10,
        perguntas: [
          {
            id: 'sinais_alarme',
            tipo: 'checkbox_multiplo',
            texto: 'Apresenta algum destes sinais agora?',
            opcoes: [
              { id: 'dor_peito', label: 'Dor no peito' },
              { id: 'falta_ar_severa', label: 'Falta de ar severa' },
              { id: 'paralisia_formigamento', label: 'Paralisia ou formigamento repentino em um lado do corpo' },
              { id: 'perda_consciencia', label: 'Perda de consciência' },
            ],
          },
        ],
      },
      {
        id: 'intensidade_evolucao',
        titulo: 'Intensidade e Evolução',
        pesoMin: 6,
        pesoMax: 8,
        perguntas: [
          { id: 'intensidade_dor', tipo: 'escala_0_10', texto: 'Qual a intensidade da dor (escala de 0 a 10)?' },
          { id: 'dor_subita', tipo: 'sim_nao', texto: 'A dor começou de forma súbita?' },
          {
            id: 'febre_vomitos',
            tipo: 'checkbox_multiplo',
            texto: 'Apresenta algum destes sintomas?',
            opcoes: [
              { id: 'febre_persistente', label: 'Febre persistente (acima de 38,5°C)' },
              { id: 'vomitos_frequentes', label: 'Vômitos frequentes' },
            ],
          },
        ],
      },
      {
        id: 'sinais_inflamatorios_gastro',
        titulo: 'Sinais Inflamatórios / Gastro',
        pesoMin: 4,
        pesoMax: 5,
        perguntas: [
          {
            id: 'sinais_gastro',
            tipo: 'checkbox_multiplo',
            texto: 'Apresenta algum destes sinais?',
            opcoes: [
              { id: 'diarreia', label: 'Diarreia' },
              { id: 'dor_abdominal_moderada', label: 'Dor abdominal moderada' },
              { id: 'tontura_ao_levantar', label: 'Tontura ao se levantar' },
              { id: 'sintomas_gripais_3dias', label: 'Sintomas gripais há mais de 3 dias' },
            ],
          },
        ],
      },
      {
        id: 'historico_cronicos',
        titulo: 'Histórico e Crônicos',
        pesoMin: 3,
        pesoMax: 6,
        perguntas: [
          {
            id: 'condicoes_cronicas',
            tipo: 'checkbox_multiplo',
            texto: 'Possui alguma destas condições?',
            opcoes: [
              { id: 'hipertensao', label: 'Hipertensão' },
              { id: 'diabetes', label: 'Diabetes' },
              { id: 'insuficiencia_cardiaca', label: 'Insuficiência cardíaca' },
              { id: 'insuficiencia_renal', label: 'Insuficiência renal' },
            ],
          },
          { id: 'medicacao_continua', tipo: 'sim_nao', texto: 'Faz uso de medicação contínua?' },
        ],
      },
    ],
  },
  {
    id: 'enfermagem',
    nome: 'Enfermagem',
    descricaoCurta: 'Triagem inicial, vacinas, curativos, testes rápidos.',
    icone: Syringe,
    grupos: [
      {
        id: 'urgencias_sinais_agudos',
        titulo: 'Urgências e Sinais Agudos',
        pesoMin: 8,
        pesoMax: 10,
        perguntas: [
          {
            id: 'sinais_agudos',
            tipo: 'checkbox_multiplo',
            texto: 'Apresenta algum destes sinais agora?',
            opcoes: [
              { id: 'sangramento_ativo', label: 'Sangramento ativo que não para' },
              { id: 'febre_alta_agora', label: 'Febre alta aferida no momento' },
              { id: 'suspeita_dengue_dor_abdominal', label: 'Suspeita de dengue com dor abdominal intensa' },
            ],
          },
        ],
      },
      {
        id: 'avaliacao_lesoes',
        titulo: 'Avaliação de Lesões',
        pesoMin: 4,
        pesoMax: 7,
        perguntas: [
          { id: 'precisa_curativo', tipo: 'sim_nao', texto: 'Precisa de curativo?' },
          {
            id: 'caracteristicas_ferida',
            tipo: 'checkbox_multiplo',
            texto: 'A ferida apresenta algo disso?',
            opcoes: [
              { id: 'secrecao_purulenta', label: 'Secreção purulenta' },
              { id: 'odor_forte', label: 'Odor forte' },
              { id: 'calor_local', label: 'Calor local' },
              { id: 'mordida_trauma_recente', label: 'Foi causada por mordida ou trauma recente' },
            ],
          },
        ],
      },
      {
        id: 'procedimentos_testes',
        titulo: 'Procedimentos e Testes',
        pesoMin: 1,
        pesoMax: 3,
        perguntas: [
          {
            id: 'tipo_procedimento',
            tipo: 'checkbox_multiplo',
            texto: 'O atendimento é para:',
            opcoes: [
              { id: 'vacinacao_rotina', label: 'Vacinação de rotina' },
              { id: 'retirada_pontos', label: 'Retirada de pontos' },
              { id: 'afericao_pressao_rotina', label: 'Aferição de pressão de rotina' },
              { id: 'teste_rapido_assintomatico', label: 'Teste rápido, sem sintomas' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'odontologia',
    nome: 'Odontologia',
    descricaoCurta: 'Dores de dente, profilaxia, extrações.',
    icone: Smile,
    grupos: [
      {
        id: 'emergencias_trauma',
        titulo: 'Emergências e Trauma',
        pesoMin: 8,
        pesoMax: 10,
        perguntas: [
          { id: 'edema_rosto_pescoco', tipo: 'sim_nao', texto: 'Apresenta inchaço (edema) visível no rosto ou pescoço?' },
          {
            id: 'dificuldades',
            tipo: 'checkbox_multiplo',
            texto: 'Tem dificuldade para:',
            opcoes: [
              { id: 'engolir', label: 'Engolir' },
              { id: 'abrir_boca', label: 'Abrir a boca' },
              { id: 'respirar', label: 'Respirar' },
            ],
          },
          { id: 'trauma_facial_sangramento', tipo: 'sim_nao', texto: 'Houve trauma facial com sangramento contínuo?' },
        ],
      },
      {
        id: 'dor_intensa',
        titulo: 'Dor Intensa',
        pesoMin: 6,
        pesoMax: 7,
        perguntas: [
          {
            id: 'dor_pulsatil_impede',
            tipo: 'sim_nao',
            texto: 'A dor no dente é pulsátil, contínua e impede você de dormir ou mastigar, mesmo com medicação?',
          },
        ],
      },
      {
        id: 'procedimentos_eletivos',
        titulo: 'Procedimentos Eletivos',
        pesoMin: 1,
        pesoMax: 3,
        perguntas: [
          {
            id: 'tipo_procedimento_odonto',
            tipo: 'checkbox_multiplo',
            texto: 'O atendimento é para:',
            opcoes: [
              { id: 'limpeza_profilaxia', label: 'Limpeza (profilaxia)' },
              { id: 'restauracao_sem_dor', label: 'Restauração sem dor' },
              { id: 'avaliacao_rotina', label: 'Avaliação de rotina' },
              { id: 'substituicao_restauracao', label: 'Substituição de restauração' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'psicologia',
    nome: 'Psicologia',
    descricaoCurta: 'Ansiedade, depressão, acolhimento.',
    icone: Brain,
    grupos: [
      {
        id: 'sinais_crise_grave',
        titulo: 'Sinais de Crise Grave',
        pesoMin: 9,
        pesoMax: 10,
        perguntas: [
          { id: 'crise_aguda_ansiedade', tipo: 'sim_nao', texto: 'Está em crise aguda de ansiedade/pânico no momento?' },
          {
            id: 'risco_autolesao',
            tipo: 'checkbox_multiplo',
            texto: 'Apresenta algo disso, recentemente?',
            opcoes: [
              { id: 'ideacao', label: 'Ideação de autoextermínio ou autolesão' },
              { id: 'planejamento', label: 'Planejamento' },
              { id: 'intencao', label: 'Intenção' },
            ],
          },
        ],
      },
      {
        id: 'sofrimento_psiquico_intenso',
        titulo: 'Sofrimento Psíquico Intenso',
        pesoMin: 6,
        pesoMax: 8,
        perguntas: [
          {
            id: 'sinais_sofrimento',
            tipo: 'checkbox_multiplo',
            texto: 'Sente algo disso há semanas?',
            opcoes: [
              { id: 'tristeza_incapacitante', label: 'Tristeza profunda incapacitante' },
              { id: 'perda_interesse', label: 'Perda total de interesse nas atividades diárias' },
              { id: 'insonia_grave', label: 'Insônia grave' },
            ],
          },
          { id: 'violencia_trauma_recente', tipo: 'sim_nao', texto: 'Sofreu violência ou trauma recente?' },
        ],
      },
      {
        id: 'acompanhamento',
        titulo: 'Acompanhamento',
        pesoMin: 1,
        pesoMax: 4,
        perguntas: [
          {
            id: 'situacao_acompanhamento',
            tipo: 'checkbox_multiplo',
            texto: 'Alguma dessas situações se aplica?',
            opcoes: [
              { id: 'diagnostico_previo', label: 'Já possui diagnóstico prévio' },
              { id: 'medicacao_psiquiatrica', label: 'Faz uso de medicação psiquiátrica' },
              { id: 'primeiro_acolhimento', label: 'Busca primeiro acolhimento' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'nutricao',
    nome: 'Nutrição',
    descricaoCurta: 'Controle de diabetes, hipertensão, obesidade.',
    icone: Apple,
    grupos: [
      {
        id: 'descompensacao_metabolica',
        titulo: 'Descompensação Metabólica',
        pesoMin: 7,
        pesoMax: 9,
        perguntas: [
          {
            id: 'sinais_descompensacao',
            tipo: 'checkbox_multiplo',
            texto: 'Apresenta algum destes sinais?',
            opcoes: [
              { id: 'tonturas_frequentes', label: 'Tonturas frequentes' },
              { id: 'suor_frio', label: 'Suor frio' },
              { id: 'tremores', label: 'Tremores' },
              { id: 'hipo_hiperglicemia', label: 'Episódios de hipoglicemia/hiperglicemia' },
            ],
          },
          { id: 'perda_peso_rapida', tipo: 'sim_nao', texto: 'Teve perda de peso rápida e involuntária?' },
        ],
      },
      {
        id: 'manejo_cronicos',
        titulo: 'Manejo de Crônicos',
        pesoMin: 4,
        pesoMax: 6,
        perguntas: [
          {
            id: 'condicoes_cronicas_nutricao',
            tipo: 'checkbox_multiplo',
            texto: 'Possui diagnóstico de:',
            opcoes: [
              { id: 'diabetes_nutricao', label: 'Diabetes' },
              { id: 'hipertensao_descontrolada', label: 'Hipertensão descontrolada' },
              { id: 'alteracao_renal', label: 'Alteração renal com exames alterados recentemente' },
            ],
          },
        ],
      },
      {
        id: 'acompanhamento_eletivo',
        titulo: 'Acompanhamento Eletivo',
        pesoMin: 1,
        pesoMax: 3,
        perguntas: [
          {
            id: 'objetivo_acompanhamento',
            tipo: 'checkbox_multiplo',
            texto: 'Busca:',
            opcoes: [
              { id: 'reeducacao_alimentar', label: 'Reeducação alimentar' },
              { id: 'perda_peso_gradual', label: 'Perda de peso gradual' },
              { id: 'orientacao_habitos_saudaveis', label: 'Orientação para hábitos saudáveis' },
            ],
          },
        ],
      },
    ],
  },
]

export function buscarEspecialidade(id: string): Especialidade | undefined {
  return especialidades.find(e => e.id === id)
}
