import Link from "next/link";
import { api } from "@/server/caller";
import { ListaTarefas } from "@/components/listaTarefas";
import { ITENS_POR_PAGINA } from "@/lib/constantes";

// Página inicial com a lista de tarefas.
// Ela roda no servidor (SSR): as tarefas já vêm carregadas quando a página abre.

// Faz a página ser montada de novo a cada acesso, já que as tarefas mudam toda hora
export const dynamic = "force-dynamic";

type Props = {
  // Pega a mensagem de sucesso que vem na URL depois de criar ou editar
  searchParams: Promise<{ sucesso?: string }>;
};

export default async function PaginaListagem({ searchParams }: Props) {
  const { sucesso } = await searchParams;
  // Busca as 10 primeiras tarefas direto no servidor
  const paginaInicial = await api.tarefas.listarPaginado({ limite: ITENS_POR_PAGINA });

  return (
    <main className="container">
      <header className="cabecalho">
        <h1>Minhas tarefas</h1>
        <Link href="/tarefas/nova" className="botao">+ Nova tarefa</Link>
      </header>

      {/* A lista recebe as tarefas já carregadas e cuida do resto (excluir, rolar) */}
      <ListaTarefas paginaInicial={paginaInicial} mensagemInicial={sucesso} />
    </main>
  );
}