package com.tcc.triagem.security.controller;

import com.tcc.triagem.security.dto.LoginRequestDTO;
import com.tcc.triagem.security.dto.LoginResponseDTO;
import com.tcc.triagem.security.dto.RegisterRequestDTO;
import com.tcc.triagem.security.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.cookie-name}")
    private String cookieName;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * POST /api/auth/login
     * Autentica o usuário, define o token JWT num cookie HttpOnly e também o
     * devolve no corpo (mantido só para curl/Swagger/testes manuais — o
     * frontend não lê mais esse campo, confia exclusivamente no cookie).
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        LoginResponseDTO response = authService.login(dto);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, criarCookie(response.getToken()).toString())
                .body(response);
    }

    /**
     * POST /api/auth/registrar
     * Cria um novo usuário e já autentica (login automático) — mesmo esquema
     * de cookie do login.
     */
    @PostMapping("/registrar")
    public ResponseEntity<LoginResponseDTO> registrar(@Valid @RequestBody RegisterRequestDTO dto) {
        LoginResponseDTO response = authService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, criarCookie(response.getToken()).toString())
                .body(response);
    }

    /**
     * POST /api/auth/logout
     * Limpa o cookie do token. Precisa ser um endpoint de verdade porque um
     * cookie HttpOnly não pode ser apagado por JavaScript no navegador — só
     * quem definiu o cookie (o servidor) pode expirá-lo. Rota própria em vez
     * de "/logout": o Spring Security registra um LogoutFilter padrão nesse
     * path mesmo sem .logout(...) configurado, e ele devolveria um redirect
     * em vez do 204 esperado aqui.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(false) // TODO: true quando servido por HTTPS
                .sameSite("Lax")
                .path("/api")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    private ResponseCookie criarCookie(String token) {
        return ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(false) // TODO: true quando servido por HTTPS
                .sameSite("Lax")
                .path("/api")
                .maxAge(Duration.ofMillis(jwtExpiration))
                .build();
    }
}
