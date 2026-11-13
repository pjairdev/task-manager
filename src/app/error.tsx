"use client";

// Se alguma página quebrar, aparece essa tela em vez de ficar tudo em branco.

export default function Erro({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <main className="container">
            <h1>Algo deu errado</h1>
            <div className="aviso aviso-erro" role="alert">
                {error.message || "Erro inesperado ao carregar a página."}
            </div>
            <button type="button" className="botao" onClick={reset}>Tentar novamente</button>
        </main>
    );
}