package com.tcc.triagem.model.enums;

/**
 * Ordem e pesos seguem o Protocolo de Manchester real (Vermelho > Laranja >
 * Amarelo > Verde > Azul), conforme a pesquisa em "Pesquisa Médica TCC.docx".
 * Verde é "pouco urgente", Azul é "não urgente" — não o contrário.
 */
public enum NivelUrgencia {
    VERMELHO,    // Emergência      — peso 10
    LARANJA,     // Muito urgente   — peso 8
    AMARELO,     // Urgente         — peso 6
    VERDE,       // Pouco urgente   — peso 3
    AZUL         // Não urgente     — peso 1 (ou nenhum sinal identificado)
}
