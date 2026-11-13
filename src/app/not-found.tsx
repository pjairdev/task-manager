// Página que aparece quando a tarefa não existe (foi excluída ou o link tá errado).

import Link from "next/link";

export default function NaoEncontrado() {
    return (
        <main className="container">
            <h1>Tarefa não encontrada</h1>
            <p className="subtitulo">Ela pode ter sido excluída ou o link está errado.</p>
            <Link href="/" className="botao">Voltar para a lista</Link>
        </main>
    );
}