package com.tcc.triagem.service;

import com.tcc.triagem.dto.AnamneseDTO;
import com.tcc.triagem.exception.RecursoNaoEncontradoException;
import com.tcc.triagem.exception.RegraDeNegocioException;
import com.tcc.triagem.model.Anamnese;
import com.tcc.triagem.model.Paciente;
import com.tcc.triagem.model.enums.NivelUrgencia;
import com.tcc.triagem.repository.AnamneseRepository;
import com.tcc.triagem.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnamneseService {

    private final AnamneseRepository anamneseRepository;
    private final PacienteRepository pacienteRepository;

    @Transactional
    public Anamnese criar(AnamneseDTO dto) {
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente", dto.getPacienteId()));

        Anamnese anamnese = Anamnese.builder()
                .sintomas(dto.getSintomas())
                .observacoes(dto.getObservacoes())
                .nivelUrgencia(resolverNivelUrgencia(dto))
                .dataRegistro(LocalDateTime.now())
                .paciente(paciente)
                .build();

        return anamneseRepository.save(anamnese);
    }

    private NivelUrgencia resolverNivelUrgencia(AnamneseDTO dto) {
        if (dto.getEspecialidadeId() != null && dto.getRespostas() != null) {
            return defineUrgencia(dto);
        }
        if (dto.getNivelUrgencia() != null) {
            return dto.getNivelUrgencia();
        }
        throw new RegraDeNegocioException(
                "Informe o nível de urgência ou as respostas da triagem por especialidade.");
    }

    // ─── Cálculo de urgência por especialidade ─────────────────────────────────
    //
    // Perguntas e pesos definitivos — baseados na pesquisa sobre o Protocolo de
    // Manchester e nas respostas do formulário enviado a médicos
    // ("Pesquisa Médica TCC.docx", seção "Perguntas definitivas e peso").
    //
    // A prioridade de um paciente é definida pelo SINAL MAIS GRAVE apresentado,
    // nunca pela média de todos os sinais (reproduz o princípio "primeiro
    // discriminador positivo vence" do Manchester) — por isso cada resposta só
    // eleva o peso via Math.max, nunca soma.
    //
    // Os ids de pergunta/opção usados aqui precisam bater exatamente com
    // frontend/lib/especialidades/config.ts — não há checagem em tempo de
    // compilação disso, só a convenção dos dois lados usarem os mesmos ids.

    public NivelUrgencia defineUrgencia(AnamneseDTO dto) {
        return switch (dto.getEspecialidadeId()) {
            case "clinico_geral" -> calcularUrgenciaClinicoGeral(dto);
            case "enfermagem" -> calcularUrgenciaEnfermagem(dto);
            case "odontologia" -> calcularUrgenciaOdontologia(dto);
            case "psicologia" -> calcularUrgenciaPsicologia(dto);
            case "nutricao" -> calcularUrgenciaNutricao(dto);
            default -> throw new RegraDeNegocioException(
                    "Especialidade inválida: " + dto.getEspecialidadeId());
        };
    }

    private NivelUrgencia calcularUrgenciaClinicoGeral(AnamneseDTO dto) {
        boolean dorPeitoFaltaAr = respostaSimNao(dto, "dor_peito_falta_ar");
        boolean alteracaoConsciencia = respostaSimNao(dto, "alteracao_consciencia");
        int intensidadeDor = respostaEscala(dto, "intensidade_dor");
        double temperatura = respostaNumero(dto, "temperatura");
        String tempoSintomas = respostaSelecao(dto, "tempo_sintomas");

        int peso = 0;

        // Pergunta 1 — dor no peito ou falta de ar (peso 10, o mais alto entre
        // 10/8 do documento, por segurança: na dúvida, eleva a prioridade)
        if (dorPeitoFaltaAr) peso = Math.max(peso, 10);

        // Pergunta 2 — desmaio/confusão/dificuldade de se manter acordado
        if (alteracaoConsciencia) peso = Math.max(peso, 8);

        // Pergunta 3 — intensidade da dor (0-10)
        switch (intensidadeDor) {
            case 8, 9, 10 -> peso = Math.max(peso, 8);
            case 4, 5, 6, 7 -> peso = Math.max(peso, 6);
            case 1, 2, 3 -> peso = Math.max(peso, 3);
        }

        // Pergunta 4 — febre / temperatura medida
        if (temperatura >= 41) peso = Math.max(peso, 8);
        else if (temperatura >= 38.5) peso = Math.max(peso, 6);
        else if (temperatura >= 37.5) peso = Math.max(peso, 3);

        // Pergunta 5 — tempo desde o início dos sintomas
        if ("recente".equals(tempoSintomas)) peso = Math.max(peso, 6);
        else if ("antigo_estavel".equals(tempoSintomas)) peso = Math.max(peso, 1);

        return calculaPeso(peso);
    }

    private NivelUrgencia calcularUrgenciaEnfermagem(AnamneseDTO dto) {
        boolean sinaisVitaisAlterados = respostaSimNao(dto, "sinais_vitais_alterados");
        String sangramento = respostaSelecao(dto, "sangramento");
        boolean doencaCronicaDescompensada = respostaSimNao(dto, "doenca_cronica_descompensada");
        int intensidadeDor = respostaEscala(dto, "intensidade_dor");
        boolean dificuldadeFicarEmPe = respostaSimNao(dto, "dificuldade_ficar_em_pe");

        int peso = 0;

        // Pergunta 1 — sinais vitais alterados na aferição
        if (sinaisVitaisAlterados) peso = Math.max(peso, 10);

        // Pergunta 2 — sangramento ativo
        switch (sangramento) {
            case "grande" -> peso = Math.max(peso, 8);
            case "pequeno" -> peso = Math.max(peso, 6);
        }

        // Pergunta 3 — doença crônica descompensada agora
        if (doencaCronicaDescompensada) peso = Math.max(peso, 6);

        // Pergunta 4 — intensidade da dor (0-10)
        switch (intensidadeDor) {
            case 8, 9, 10 -> peso = Math.max(peso, 8);
            case 4, 5, 6, 7 -> peso = Math.max(peso, 6);
            case 1, 2, 3 -> peso = Math.max(peso, 3);
        }

        // Pergunta 5 — dificuldade para caminhar/ficar em pé sem ajuda
        if (dificuldadeFicarEmPe) peso = Math.max(peso, 6);

        return calculaPeso(peso);
    }

    private NivelUrgencia calcularUrgenciaOdontologia(AnamneseDTO dto) {
        boolean inchacoViaAerea = respostaSimNao(dto, "inchaco_via_aerea");
        boolean sangramentoBoca = respostaSimNao(dto, "sangramento_boca");
        int intensidadeDor = respostaEscala(dto, "intensidade_dor");
        boolean traumaRecente = respostaSimNao(dto, "trauma_recente");
        boolean problemaEletivo = respostaSimNao(dto, "problema_eletivo");

        int peso = 0;

        // Pergunta 1 — inchaço no rosto/pescoço com dificuldade para engolir/respirar
        if (inchacoViaAerea) peso = Math.max(peso, 10);

        // Pergunta 2 — sangramento na boca que não para
        if (sangramentoBoca) peso = Math.max(peso, 8);

        // Pergunta 3 — intensidade da dor de dente (0-10)
        switch (intensidadeDor) {
            case 8, 9, 10 -> peso = Math.max(peso, 8);
            case 4, 5, 6, 7 -> peso = Math.max(peso, 6);
            case 1, 2, 3 -> peso = Math.max(peso, 3);
        }

        // Pergunta 4 — trauma/acidente recente
        if (traumaRecente) peso = Math.max(peso, 6);

        // Pergunta 5 — problema antigo, sem dor ou sangramento (eletivo)
        if (problemaEletivo) peso = Math.max(peso, 1);

        return calculaPeso(peso);
    }

    private NivelUrgencia calcularUrgenciaPsicologia(AnamneseDTO dto) {
        boolean riscoAutolesao = respostaSimNao(dto, "risco_autolesao");
        boolean agitacaoIntensa = respostaSimNao(dto, "agitacao_intensa");
        boolean sofrimentoAgudo = respostaSimNao(dto, "sofrimento_agudo");
        boolean agravamentoRecente = respostaSimNao(dto, "agravamento_recente");
        boolean acompanhamentoRotina = respostaSimNao(dto, "acompanhamento_rotina");

        int peso = 0;

        // Pergunta 1 — risco imediato a si ou a terceiros
        if (riscoAutolesao) peso = Math.max(peso, 10);

        // Pergunta 2 — agitação/agressividade/fora de controle
        if (agitacaoIntensa) peso = Math.max(peso, 8);

        // Pergunta 3 — sofrimento emocional agudo (crise de ansiedade/pânico)
        if (sofrimentoAgudo) peso = Math.max(peso, 6);

        // Pergunta 4 — sintomas recentes ou em piora
        if (agravamentoRecente) peso = Math.max(peso, 6);

        // Pergunta 5 — acompanhamento de rotina, sem crise ou risco atual
        if (acompanhamentoRotina) peso = Math.max(peso, 1);

        return calculaPeso(peso);
    }

    private NivelUrgencia calcularUrgenciaNutricao(AnamneseDTO dto) {
        boolean glicemiaAlterada = respostaSimNao(dto, "glicemia_alterada");
        boolean dificuldadeIngestao = respostaSimNao(dto, "dificuldade_ingestao");
        boolean perdaPesoRapida = respostaSimNao(dto, "perda_peso_rapida");
        boolean dificuldadeEngolir = respostaSimNao(dto, "dificuldade_engolir");
        boolean acompanhamentoRotina = respostaSimNao(dto, "acompanhamento_rotina");

        int peso = 0;

        // Pergunta 1 — sintomas de glicemia muito alta/baixa
        if (glicemiaAlterada) peso = Math.max(peso, 8);

        // Pergunta 2 — recusa/incapacidade de se alimentar ou beber água
        if (dificuldadeIngestao) peso = Math.max(peso, 8);

        // Pergunta 3 — perda de peso rápida e não intencional
        if (perdaPesoRapida) peso = Math.max(peso, 6);

        // Pergunta 4 — dificuldade ou dor para engolir alimentos
        if (dificuldadeEngolir) peso = Math.max(peso, 6);

        // Pergunta 5 — acompanhamento de rotina, sem sintomas agudos
        if (acompanhamentoRotina) peso = Math.max(peso, 1);

        return calculaPeso(peso);
    }

    // Peso -> cor, seguindo a tabela do Protocolo de Manchester real:
    // Vermelho=10, Laranja=8, Amarelo=6, Verde=3, Azul=1 (ou nenhum sinal).
    private NivelUrgencia calculaPeso(int peso) {
        if (peso >= 10) return NivelUrgencia.VERMELHO;
        if (peso >= 8) return NivelUrgencia.LARANJA;
        if (peso >= 6) return NivelUrgencia.AMARELO;
        if (peso >= 3) return NivelUrgencia.VERDE;
        return NivelUrgencia.AZUL;
    }

    private Object valorResposta(AnamneseDTO dto, String perguntaId) {
        Map<String, Object> respostas = dto.getRespostas();
        return respostas != null ? respostas.get(perguntaId) : null;
    }

    private boolean respostaSimNao(AnamneseDTO dto, String perguntaId) {
        return Boolean.TRUE.equals(valorResposta(dto, perguntaId));
    }

    private int respostaEscala(AnamneseDTO dto, String perguntaId) {
        Object valor = valorResposta(dto, perguntaId);
        return valor instanceof Number n ? n.intValue() : 0;
    }

    private double respostaNumero(AnamneseDTO dto, String perguntaId) {
        Object valor = valorResposta(dto, perguntaId);
        return valor instanceof Number n ? n.doubleValue() : 0;
    }

    private String respostaSelecao(AnamneseDTO dto, String perguntaId) {
        Object valor = valorResposta(dto, perguntaId);
        return valor instanceof String s ? s : "";
    }

    @Transactional(readOnly = true)
    public List<Anamnese> buscarTodos() {
        return anamneseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Anamnese buscarPorId(Long id) {
        return anamneseRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Anamnese", id));
    }

    @Transactional(readOnly = true)
    public List<Anamnese> buscarPorPaciente(Long pacienteId) {
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new RecursoNaoEncontradoException("Paciente", pacienteId);
        }
        return anamneseRepository.findByPacienteIdOrderByDataRegistroDesc(pacienteId);
    }

    @Transactional(readOnly = true)
    public List<Anamnese> buscarPorNivelUrgencia(NivelUrgencia nivelUrgencia) {
        return anamneseRepository.findByNivelUrgencia(nivelUrgencia);
    }

    @Transactional(readOnly = true)
    public List<Anamnese> buscarOrdenadosPorUrgencia() {
        return anamneseRepository.findAllOrdenadosPorUrgencia();
    }

    @Transactional
    public Anamnese atualizar(Long id, AnamneseDTO dto) {
        Anamnese anamnese = buscarPorId(id);

        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente", dto.getPacienteId()));

        anamnese.setSintomas(dto.getSintomas());
        anamnese.setObservacoes(dto.getObservacoes());
        anamnese.setNivelUrgencia(resolverNivelUrgencia(dto));
        anamnese.setPaciente(paciente);

        return anamneseRepository.save(anamnese);
    }

    @Transactional
    public void deletar(Long id) {
        if (!anamneseRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Anamnese", id);
        }
        anamneseRepository.deleteById(id);
    }
}
