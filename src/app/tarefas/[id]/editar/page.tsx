// Página de editar tarefa. Busca a tarefa no servidor e abre o formulário já preenchido.

import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { api } from "@/server/caller";
import { FormularioTarefa } from "@/components/formularioTarefa";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>; // O id da tarefa vem da URL
};

export default async function PaginaEditarTarefa({ params }: Props) {
    const { id } = await params;

    let tarefa;
    try {
        tarefa = await api.tarefas.buscarPorId({ id });
    } catch (erro) {
        // Se a tarefa não existir, mostra a página de "não encontrada"
        if (erro instanceof TRPCError && erro.code === "NOT_FOUND") notFound();
        throw erro; // qualquer outro erro vai pra tela de erro
    }

    return (
        <main className="container">
            <Link href="/" className="voltar">← Voltar para a lista</Link>
            <h1>Editar tarefa</h1>
            <FormularioTarefa
                tarefa={{ id: tarefa.id, titulo: tarefa.titulo, descricao: tarefa.descricao }}
            />
        </main>
    );
}