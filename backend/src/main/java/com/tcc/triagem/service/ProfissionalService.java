package com.tcc.triagem.service;

import com.tcc.triagem.dto.ProfissionalDTO;
import com.tcc.triagem.exception.RecursoNaoEncontradoException;
import com.tcc.triagem.exception.RegraDeNegocioException;
import com.tcc.triagem.model.Profissional;
import com.tcc.triagem.model.enums.TipoUsuario;
import com.tcc.triagem.repository.ProfissionalRepository;
import com.tcc.triagem.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfissionalService {

    private final ProfissionalRepository profissionalRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Profissional criar(ProfissionalDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RegraDeNegocioException("Já existe um usuário com o email: " + dto.getEmail());
        }
        if (dto.getCrm() != null && profissionalRepository.existsByCrm(dto.getCrm())) {
            throw new RegraDeNegocioException("Já existe um profissional com o CRM: " + dto.getCrm());
        }

        Profissional profissional = Profissional.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .senha(passwordEncoder.encode(dto.getSenha()))
                .tipoUsuario(TipoUsuario.PROFISSIONAL)
                .especialidade(dto.getEspecialidade())
                .crm(dto.getCrm())
                .cargo(dto.getCargo())
                .build();

        return profissionalRepository.save(profissional);
    }

    @Transactional(readOnly = true)
    public List<Profissional> buscarTodos() {
        return profissionalRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Profissional buscarPorId(Long id) {
        return profissionalRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Profissional", id));
    }

    @Transactional(readOnly = true)
    public Profissional buscarPorCrm(String crm) {
        return profissionalRepository.findByCrm(crm)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Profissional com CRM " + crm + " não encontrado."));
    }

    @Transactional(readOnly = true)
    public List<Profissional> buscarPorEspecialidade(String especialidade) {
        return profissionalRepository.findByEspecialidadeContainingIgnoreCase(especialidade);
    }

    @Transactional
    public Profissional atualizar(Long id, ProfissionalDTO dto) {
        Profissional profissional = buscarPorId(id);

        if (!profissional.getEmail().equals(dto.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RegraDeNegocioException("Já existe um usuário com o email: " + dto.getEmail());
        }
        if (dto.getCrm() != null && !dto.getCrm().equals(profissional.getCrm()) && profissionalRepository.existsByCrm(dto.getCrm())) {
            throw new RegraDeNegocioException("Já existe um profissional com o CRM: " + dto.getCrm());
        }

        profissional.setNome(dto.getNome());
        profissional.setEmail(dto.getEmail());
        profissional.setSenha(passwordEncoder.encode(dto.getSenha()));
        profissional.setEspecialidade(dto.getEspecialidade());
        profissional.setCrm(dto.getCrm());
        profissional.setCargo(dto.getCargo());

        return profissionalRepository.save(profissional);
    }

    @Transactional
    public void deletar(Long id) {
        if (!profissionalRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Profissional", id);
        }
        profissionalRepository.deleteById(id);
    }
}
