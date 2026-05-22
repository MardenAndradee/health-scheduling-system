package com.tcc.triagem.security.service;

import com.tcc.triagem.exception.RegraDeNegocioException;
import com.tcc.triagem.model.Usuario;
import com.tcc.triagem.repository.UsuarioRepository;
import com.tcc.triagem.security.dto.LoginRequestDTO;
import com.tcc.triagem.security.dto.LoginResponseDTO;
import com.tcc.triagem.security.dto.RegisterRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    // ─── Login ─────────────────────────────────────────────────────────────────

    public LoginResponseDTO login(LoginRequestDTO dto) {
        try {
            // Autentica as credenciais via Spring Security
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getSenha())
            );
        } catch (BadCredentialsException e) {
            throw new RegraDeNegocioException("Email ou senha inválidos.");
        }

        // Busca o usuário e gera o token
        UserDetails userDetails = userDetailsService.loadUserByUsername(dto.getEmail());
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RegraDeNegocioException("Usuário não encontrado."));

        String token = jwtService.gerarToken(userDetails);

        return LoginResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .tipoUsuario(usuario.getTipoUsuario())
                .build();
    }

    // ─── Registro ──────────────────────────────────────────────────────────────

    @Transactional
    public LoginResponseDTO registrar(RegisterRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RegraDeNegocioException("Já existe um usuário com o email: " + dto.getEmail());
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .senha(passwordEncoder.encode(dto.getSenha()))  // senha criptografada
                .tipoUsuario(dto.getTipoUsuario())
                .build();

        usuarioRepository.save(usuario);

        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getEmail());
        String token = jwtService.gerarToken(userDetails);

        return LoginResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .tipoUsuario(usuario.getTipoUsuario())
                .build();
    }
}
