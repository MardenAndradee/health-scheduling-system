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
        List<String> sinaisAlarme = respostaCheckbox(dto, "sintomas_alarme", "sinais_alarme");
        // opções: dor_peito, falta_ar_severa, paralisia_formigamento, perda_consciencia
        List<String> febreVomitos = respostaCheckbox(dto, "intensidade_evolucao", "febre_vomitos");
        //opções: febre_persistente, vomitos_frequentes
        List<String> sinaisGastro = respostaCheckbox(dto, "sinais_inflamatorios_gastro", "sinais_gastro");
        // opções: diarreia, dor_abdominal_moderada, tontura_ao_levantar, sintomas_gripais_3dias
        List<String> condicoesCronicas = respostaCheckbox(dto, "historico_cronicos", "condicoes_cronicas");
        // opções: hipertensao, diabetes, insuficiencia_cardiaca, insuficiencia_renal

        int intensidadeDor = respostaEscala(dto, "intensidade_evolucao", "intensidade_dor");

        boolean dorSubita = respostaSimNao(dto, "intensidade_evolucao", "dor_subita");
        boolean medicacaoContinua = respostaSimNao(dto, "historico_cronicos", "medicacao_continua");

        Integer idade = dto.getIdade();

        int peso = 0;

        if (idade != null && idade >= 65) {
            peso = Math.max(peso, 7);
        }

        if (idade != null && idade < 12) {
            peso = Math.max(peso, 7);
        }

        if (sinaisAlarme != null && !sinaisAlarme.isEmpty()) {
            for (String sinal : sinaisAlarme) {
                switch (sinal) {
                    case "dor_peito" -> peso = Math.max(peso, 8);
                    case "falta_ar_severa" -> peso = Math.max(peso, 10);
                    case "paralisia_formigamento" -> peso = Math.max(peso, 6);
                    case "perda_consciencia" -> peso = Math.max(peso, 6);
                }
            }
        }

        switch (intensidadeDor) {
            case 1,2,3 -> peso = Math.max(peso, 3);
            case 4,5 -> peso = Math.max(peso, 5);
            case 6,7 -> peso = Math.max(peso, 6);
            case 8,9 -> peso = Math.max(peso, 8);
            case 10 -> peso = Math.max(peso, 10);
        }

        if (dorSubita) {
            peso = Math.max(peso, 7);
        }

        if (febreVomitos != null && !febreVomitos.isEmpty()) {
            for (String sintoma : febreVomitos) {
                switch (sintoma) {
                    case "febre_persistente" -> peso = Math.max(peso, 1);
                    case "vomitos_frequentes" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (sinaisGastro != null && !sinaisGastro.isEmpty()) {
            for (String sinal : sinaisGastro) {
                switch (sinal) {
                    case "diarreia" -> peso = Math.max(peso, 1);
                    case "dor_abdominal_moderada" -> peso = Math.max(peso, 1);
                    case "tontura_ao_levantar" -> peso = Math.max(peso, 1);
                    case "sintomas_gripais_3dias" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (condicoesCronicas != null && !condicoesCronicas.isEmpty()) {
            for (String condicao : condicoesCronicas) {
                switch (condicao) {
                    case "hipertensao" -> peso = Math.max(peso, 1);
                    case "diabetes" -> peso = Math.max(peso, 1);
                    case "insuficiencia_cardiaca" -> peso = Math.max(peso, 1);
                    case "insuficiencia_renal" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (medicacaoContinua) {
            peso = Math.max(peso, 1);
        }

        return calculaPeso(peso);
    }

    private NivelUrgencia calcularUrgenciaEnfermagem(AnamneseDTO dto) {
        List<String> sinaisAgudos = respostaCheckbox(dto, "urgencias_sinais_agudos", "sinais_agudos");
        // opções: sangramento_ativo, febre_alta_agora, suspeita_dengue_dor_abdominal
        List<String> tipoProcedimento = respostaCheckbox(dto, "procedimentos_testes", "tipo_procedimento");
        // opções: vacinacao_rotina, retirada_pontos, afericao_pressao_rotina, teste_rapido_assintomatico
        List<String> caracteristicasFerida = respostaCheckbox(dto, "avaliacao_lesoes", "caracteristicas_ferida");
        // opções: secrecao_purulenta, odor_forte, calor_local, mordida_trauma_recente

        boolean precisaCurativo = respostaSimNao(dto, "avaliacao_lesoes", "precisa_curativo");
        
        
        Integer idade = dto.getIdade();

        int peso = 0;

        if (sinaisAgudos != null && !sinaisAgudos.isEmpty()) {
            for (String sinal : sinaisAgudos) {
                switch (sinal) {
                    case "sangramento_ativo" -> peso = Math.max(peso, 1);
                    case "febre_alta_agora" -> peso = Math.max(peso, 1);
                    case "suspeita_dengue_dor_abdominal" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (precisaCurativo) {
            peso = Math.max(peso, 1);
        }

        if (caracteristicasFerida != null && !caracteristicasFerida.isEmpty()) {
            for (String caracteristica : caracteristicasFerida) {
                switch (caracteristica) {
                    case "secrecao_purulenta" -> peso = Math.max(peso, 1);
                    case "odor_forte" -> peso = Math.max(peso, 1);
                    case "calor_local" -> peso = Math.max(peso, 1);
                    case "mordida_trauma_recente" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (tipoProcedimento != null && !tipoProcedimento.isEmpty()) {
            for (String tipo : tipoProcedimento) {
                switch (tipo) {
                    case "vacinacao_rotina" -> peso = Math.max(peso, 1);
                    case "retirada_pontos" -> peso = Math.max(peso, 1);
                    case "afericao_pressao_rotina" -> peso = Math.max(peso, 1);
                    case "teste_rapido_assintomatico" -> peso = Math.max(peso, 1);
                }
            }
        }

        return calculaPeso(peso);
    }

    private NivelUrgencia calcularUrgenciaOdontologia(AnamneseDTO dto) {
        List<String> dificuldades = respostaCheckbox(dto, "emergencias_trauma", "dificuldades");
        // opções: engolir, abrir_boca, respirar
        List<String> tipoProcedimentoOdonto = respostaCheckbox(dto, "procedimentos_eletivos", "tipo_procedimento_odonto");
        // opções: limpeza_profilaxia, restauracao_sem_dor, avaliacao_rotina, substituicao_restauracao

        boolean edemaRostoPescoco = respostaSimNao(dto, "emergencias_trauma", "edema_rosto_pescoco");
        boolean traumaFacialSangramento = respostaSimNao(dto, "emergencias_trauma", "trauma_facial_sangramento");
        boolean dorPulsatilImpede = respostaSimNao(dto, "dor_intensa", "dor_pulsatil_impede");

        Integer idade = dto.getIdade();

        int peso = 0;

        if (edemaRostoPescoco) {
            peso = Math.max(peso, 1);
        }

        if (dificuldades != null && !dificuldades.isEmpty()) {
            for (String dificuldade : dificuldades) {
                switch (dificuldade) {
                    case "engolir" -> peso = Math.max(peso, 1);
                    case "abrir_boca" -> peso = Math.max(peso, 1);
                    case "respirar" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (traumaFacialSangramento) {
            peso = Math.max(peso, 1);
        }

        if (dorPulsatilImpede) {
            peso = Math.max(peso, 1);
        }

        if (tipoProcedimentoOdonto != null && !tipoProcedimentoOdonto.isEmpty()) {
            for (String tipo : tipoProcedimentoOdonto) {
                switch (tipo) {
                    case "limpeza_profilaxia" -> peso = Math.max(peso, 1);
                    case "restauracao_sem_dor" -> peso = Math.max(peso, 1);
                    case "avaliacao_rotina" -> peso = Math.max(peso, 1);
                    case "substituicao_restauracao" -> peso = Math.max(peso, 1);
                }
            }
        }

        return calculaPeso(peso);
    }

    private NivelUrgencia calcularUrgenciaPsicologia(AnamneseDTO dto) {
        List<String> riscoAutolesao = respostaCheckbox(dto, "sinais_crise_grave", "risco_autolesao");
        // opções: ideacao, planejamento, intencao
        List<String> sinaisSofrimento = respostaCheckbox(dto, "sofrimento_psiquico_intenso", "sinais_sofrimento");
        // opções: tristeza_incapacitante, perda_interesse, insonia_grave
        List<String> situacaoAcompanhamento = respostaCheckbox(dto, "acompanhamento", "situacao_acompanhamento");
        // opções: diagnostico_previo, medicacao_psiquiatrica, primeiro_acolhimento

        boolean violenciaTraumaRecente = respostaSimNao(dto, "sofrimento_psiquico_intenso", "violencia_trauma_recente");
        boolean criseAgudaAnsiedade = respostaSimNao(dto, "sinais_crise_grave", "crise_aguda_ansiedade");
       

        Integer idade = dto.getIdade();

        int peso = 0;

        if (criseAgudaAnsiedade) {
            peso = Math.max(peso, 1);
        }

        if (riscoAutolesao != null && !riscoAutolesao.isEmpty()) {
            for (String risco : riscoAutolesao) {
                switch (risco) {
                    case "ideacao" -> peso = Math.max(peso, 1);
                    case "planejamento" -> peso = Math.max(peso, 1);
                    case "intencao" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (sinaisSofrimento != null && !sinaisSofrimento.isEmpty()) {
            for (String sinal : sinaisSofrimento) {
                switch (sinal) {
                    case "tristeza_incapacitante" -> peso = Math.max(peso, 1);
                    case "perda_interesse" -> peso = Math.max(peso, 1);
                    case "insonia_grave" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (violenciaTraumaRecente) {
            peso = Math.max(peso, 1);
        }

        if (situacaoAcompanhamento != null && !situacaoAcompanhamento.isEmpty()) {
            for (String situacao : situacaoAcompanhamento) {
                switch (situacao) {
                    case "diagnostico_previo" -> peso = Math.max(peso, 1);
                    case "medicacao_psiquiatrica" -> peso = Math.max(peso, 1);
                    case "primeiro_acolhimento" -> peso = Math.max(peso, 1);
                }
            }
        }

        return calculaPeso(peso);
    }

    private NivelUrgencia calcularUrgenciaNutricao(AnamneseDTO dto) {
        List<String> sinaisDescompensacao = respostaCheckbox(dto, "descompensacao_metabolica", "sinais_descompensacao");
        // opções: tonturas_frequentes, suor_frio, tremores, hipo_hiperglicemia
        List<String> condicoesCronicasNutricao = respostaCheckbox(dto, "manejo_cronicos", "condicoes_cronicas_nutricao");
        // opções: diabetes_nutricao, hipertensao_descontrolada, alteracao_renal
        List<String> objetivoAcompanhamento = respostaCheckbox(dto, "acompanhamento_eletivo", "objetivo_acompanhamento");
        // opções: reeducacao_alimentar, perda_peso_gradual, orientacao_habitos_saudaveis

        boolean perdaPesoRapida = respostaSimNao(dto, "descompensacao_metabolica", "perda_peso_rapida");

        Integer idade = dto.getIdade();

        int peso = 0;

        if (sinaisDescompensacao != null && !sinaisDescompensacao.isEmpty()) {
            for (String sinal : sinaisDescompensacao) {
                switch (sinal) {
                    case "tonturas_frequentes" -> peso = Math.max(peso, 1);
                    case "suor_frio" -> peso = Math.max(peso, 1);
                    case "tremores" -> peso = Math.max(peso, 1);
                    case "hipo_hiperglicemia" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (perdaPesoRapida) {
            peso = Math.max(peso, 1);
        }

        if (condicoesCronicasNutricao != null && !condicoesCronicasNutricao.isEmpty()) {
            for (String condicao : condicoesCronicasNutricao) {
                switch (condicao) {
                    case "diabetes_nutricao" -> peso = Math.max(peso, 1);
                    case "hipertensao_descontrolada" -> peso = Math.max(peso, 1);
                    case "alteracao_renal" -> peso = Math.max(peso, 1);
                }
            }
        }

        if (objetivoAcompanhamento != null && !objetivoAcompanhamento.isEmpty()) {
            for (String objetivo : objetivoAcompanhamento) {
                switch (objetivo) {
                    case "reeducacao_alimentar" -> peso = Math.max(peso, 1);
                    case "perda_peso_gradual" -> peso = Math.max(peso, 1);
                    case "orientacao_habitos_saudaveis" -> peso = Math.max(peso, 1);
                }
            }
        }

        return calculaPeso(peso);
    }

    private NivelUrgencia calculaPeso(int peso) {
        switch (peso) {
            case 0,1,2 -> {
                return NivelUrgencia.VERDE;
            }
            case 3,4 -> {
                return NivelUrgencia.AZUL;
            }
            case 5,6 -> {
                return NivelUrgencia.AMARELO;
            }
            case 7,8,9 -> {
                return NivelUrgencia.LARANJA;
            }
            case 10 -> {
                return NivelUrgencia.VERMELHO;
            }
        }

        return NivelUrgencia.VERDE;
    }

    private Object valorResposta(AnamneseDTO dto, String grupoId, String perguntaId) {
        Map<String, Object> grupo = dto.getRespostas() != null ? dto.getRespostas().get(grupoId) : null;
        return grupo != null ? grupo.get(perguntaId) : null;
    }

    private boolean respostaSimNao(AnamneseDTO dto, String grupoId, String perguntaId) {
        return Boolean.TRUE.equals(valorResposta(dto, grupoId, perguntaId));
    }

    private int respostaEscala(AnamneseDTO dto, String grupoId, String perguntaId) {
        Object valor = valorResposta(dto, grupoId, perguntaId);
        return valor instanceof Number n ? n.intValue() : 0;
    }

    @SuppressWarnings("unchecked")
    private List<String> respostaCheckbox(AnamneseDTO dto, String grupoId, String perguntaId) {
        Object valor = valorResposta(dto, grupoId, perguntaId);
        return valor instanceof List<?> lista ? (List<String>) lista : List.of();
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
