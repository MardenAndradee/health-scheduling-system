/**
 * Opções de apoio para os componentes de resposta do wizard de anamnese.
 *
 * O cálculo do nível de urgência NÃO vive mais aqui — o backend
 * (AnamneseService.defineUrgencia) é a única fonte de verdade, a partir do
 * especialidadeId + idade + respostas enviados em POST /anamneses. Este
 * arquivo guarda só o que a interface precisa pra desenhar a pergunta de
 * escala 0–10 (ver PerguntaField.tsx).
 */
export const escalaDorOpcoes = Array.from({ length: 11 }, (_, i) => {
  const rotulo =
    i === 0 ? 'Sem dor' :
    i <= 3 ? 'Dor leve' :
    i <= 6 ? 'Dor moderada' :
    i <= 8 ? 'Dor forte' : 'Dor insuportável'
  return { value: String(i), label: `${i} — ${rotulo}` }
})
