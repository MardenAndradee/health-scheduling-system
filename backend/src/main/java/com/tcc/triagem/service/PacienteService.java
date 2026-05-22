package com.tcc.triagem.service;

import com.tcc.triagem.dto.PacienteDTO;
import com.tcc.triagem.exception.RecursoNaoEncontradoException;
import com.tcc.triagem.exception.RegraDeNegocioException;
import com.tcc.triagem.model.Paciente;
import com.tcc.triagem.model.enums.TipoUsuario;
import com.tcc.triagem.repository.PacienteRepository;
import com.tcc.triagem.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Paciente criar(PacienteDTO dto) {
        if (pacienteRepository.existsByCpf(dto.getCpf())) {
            throw new RegraDeNegocioException("Já existe um paciente com o CPF: " + dto.getCpf());
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RegraDeNegocioException("Já existe um usuário com o email: " + dto.getEmail());
        }

        Paciente paciente = Paciente.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .senha(passwordEncoder.encode(dto.getSenha()))
                .tipoUsuario(TipoUsuario.PACIENTE)
                .cpf(dto.getCpf())
                .telefone(dto.getTelefone())
                .endereco(dto.getEndereco())
                .dataNascimento(dto.getDataNascimento())
                .build();

        return pacienteRepository.save(paciente);
    }

    @Transactional(readOnly = true)
    public List<Paciente> buscarTodos() {
        return pacienteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Paciente buscarPorId(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente", id));
    }

    @Transactional(readOnly = true)
    public Paciente buscarPorCpf(String cpf) {
        return pacienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente com CPF " + cpf + " não encontrado."));
    }

    @Transactional(readOnly = true)
    public List<Paciente> buscarPorNome(String nome) {
        return pacienteRepository.findByNomeContainingIgnoreCase(nome);
    }

    @Transactional(readOnly = true)
    public List<Paciente> buscarUrgentes() {
        return pacienteRepository.findPacientesUrgentes();
    }

    @Transactional
    public Paciente atualizar(Long id, PacienteDTO dto) {
        Paciente paciente = buscarPorId(id);

        if (!paciente.getCpf().equals(dto.getCpf()) && pacienteRepository.existsByCpf(dto.getCpf())) {
            throw new RegraDeNegocioException("Já existe um paciente com o CPF: " + dto.getCpf());
        }
        if (!paciente.getEmail().equals(dto.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RegraDeNegocioException("Já existe um usuário com o email: " + dto.getEmail());
        }

        paciente.setNome(dto.getNome());
        paciente.setEmail(dto.getEmail());
        paciente.setSenha(passwordEncoder.encode(dto.getSenha()));
        paciente.setCpf(dto.getCpf());
        paciente.setTelefone(dto.getTelefone());
        paciente.setEndereco(dto.getEndereco());
        paciente.setDataNascimento(dto.getDataNascimento());

        return pacienteRepository.save(paciente);
    }

    @Transactional
    public void deletar(Long id) {
        if (!pacienteRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Paciente", id);
        }
        pacienteRepository.deleteById(id);
    }
}
