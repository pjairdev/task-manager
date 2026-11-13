// Página de criar tarefa. Só mostra o formulário vazio.

import Link from "next/link";
import { FormularioTarefa } from "@/components/formularioTarefa";

export default function PaginaNovaTarefa() {
    return (
        <main className="container">
            <Link href="/" className="voltar">← Voltar para a lista</Link>
            <h1>Nova tarefa</h1>
            <FormularioTarefa />
        </main>
    );
}