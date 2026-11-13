"use client"

// Mensagem que aparece no topo depois de uma ação (verde se deu certo, vermelha se deu erro).

import { useEffect } from "react"

export type AvisoInfo = { tipo: "sucesso" | "erro"; texto: string } | null;

export function Aviso({ aviso, aoFechar }: { aviso: AvisoInfo; aoFechar: () => void }) {
    // Some sozinha depois de 4 segundos
    useEffect(() => {
        if (!aviso) return;
        const timer = setTimeout(aoFechar, 4000);
        return () => clearTimeout(timer);
    }, [aviso, aoFechar]);

    if (!aviso) return null;

    return (
        <div className={`aviso aviso-${aviso.tipo}`} role={aviso.tipo === "erro" ? "alert" : "status"}>
            <span>{aviso.texto}</span>
            <button type="button" onClick={aoFechar} aria-label="Fechar aviso">x</button>
        </div>
    )
}