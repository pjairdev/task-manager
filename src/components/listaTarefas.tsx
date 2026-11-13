"use client";

// Lista de tarefas: mostra as tarefas, deixa excluir e vai carregando mais conforme rola a página.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/trpc/client";
import { mensagemDeErro } from "@/lib/erros";
import { ITENS_POR_PAGINA } from "@/lib/constantes";
import { Aviso, type AvisoInfo } from "./aviso";

// Pega o formato dos dados direto do backend, assim os tipos ficam sempre iguais
type PaginaTarefas = inferRouterOutputs<AppRouter>["tarefas"]["listarPaginado"];

type Props = {
    paginaInicial: PaginaTarefas; // tarefas que já vieram do servidor
    mensagemInicial?: string;     // ex.: "Tarefa criada com sucesso"
};

export function ListaTarefas({ paginaInicial, mensagemInicial }: Props) {
    const router = useRouter();
    const utils = trpc.useUtils();
    const [aviso, setAviso] = useState<AvisoInfo>(
        mensagemInicial ? { tipo: "sucesso", texto: mensagemInicial } : null,
    );
    const fecharAviso = useCallback(() => setAviso(null), []);

    // Limpa a mensagem da URL pra ela não aparecer de novo se recarregar a página
    useEffect(() => {
        if (mensagemInicial) router.replace("/", { scroll: false });
    }, [mensagemInicial, router]);

    // Busca as tarefas de 10 em 10. A primeira parte já veio do servidor,
    // então a lista aparece na hora, sem "Carregando..."
    const consulta = trpc.tarefas.listarPaginado.useInfiniteQuery(
        { limite: ITENS_POR_PAGINA },
        {
            getNextPageParam: (ultima) => ultima.proximoCursor,
            initialData: { pages: [paginaInicial], pageParams: [null] },
            staleTime: 30_000, // não busca de novo logo que a página abre
        },
    );

    const tarefas = consulta.data?.pages.flatMap((p) => p.itens) ?? [];
    const total = consulta.data?.pages.at(-1)?.total ?? 0;

    // Exclui a tarefa e mostra se deu certo ou não
    const deletar = trpc.tarefas.deletar.useMutation({
        onSuccess: (removida) => {
            setAviso({ tipo: "sucesso", texto: `Tarefa "${removida.titulo}" excluída.` });
            utils.tarefas.listarPaginado.invalidate();
        },
        onError: (erro) => {
            setAviso({ tipo: "erro", texto: `Não foi possível excluir: ${mensagemDeErro(erro)}` });
            utils.tarefas.listarPaginado.invalidate(); // recarrega a lista pra ficar igual ao servidor
        },
    });

    // Pede confirmação antes de excluir
    function excluir(id: string, titulo: string) {
        if (!window.confirm(`Excluir a tarefa "${titulo}"?`)) return;
        deletar.mutate({ id });
    }

    // Rolagem infinita: tem um <div> no fim da lista; quando ele aparece na tela,
    // carrega mais tarefas. Começa um pouquinho antes de chegar no fim (200px).
    const sentinelaRef = useRef<HTMLDivElement>(null);
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = consulta;

    useEffect(() => {
        const el = sentinelaRef.current;
        if (!el || !hasNextPage) return;
        const observer = new IntersectionObserver(
            (entradas) => {
                if (entradas[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
            },
            { rootMargin: "200px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <>
            <Aviso aviso={aviso} aoFechar={fecharAviso} />

            <p className="subtitulo">{total} tarefa{total === 1 ? "" : "s"}</p>

            {tarefas.length === 0 ? (
                <div className="vazio">
                    <p>Nenhuma tarefa ainda.</p>
                    <Link href="/tarefas/nova" className="botao">Criar a primeira</Link>
                </div>
            ) : (
                <ul className="lista">
                    {tarefas.map((t) => {
                        // Saber qual tarefa tá sendo excluída, pra mostrar "Excluindo..." só nela
                        const excluindo = deletar.isPending && deletar.variables?.id === t.id;
                        return (
                            <li key={t.id} className={`item ${excluindo ? "item-excluindo" : ""}`}>
                                <div className="item-conteudo">
                                    <strong>{t.titulo}</strong>
                                    {t.descricao && <p className="item-descricao">{t.descricao}</p>}
                                    <small className="item-data">
                                        Criada em {new Date(t.dataCriacao).toLocaleString("pt-BR")}
                                    </small>
                                </div>
                                <div className="item-acoes">
                                    <Link href={`/tarefas/${t.id}/editar`} className="botao-secundario">Editar</Link>
                                    <button
                                        type="button"
                                        className="botao-perigo"
                                        onClick={() => excluir(t.id, t.titulo)}
                                        disabled={excluindo}
                                    >
                                        {excluindo ? "Excluindo..." : "Excluir"}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Fim da lista: carrega mais, mostra erro ou avisa que acabou */}
            <div ref={sentinelaRef} className="rodape-lista">
                {isFetchingNextPage && <p>Carregando mais tarefas...</p>}
                {consulta.isFetchNextPageError && (
                    <p className="texto-erro">
                        Erro ao carregar mais tarefas.{" "}
                        <button type="button" className="link" onClick={() => fetchNextPage()}>
                            Tentar de novo
                        </button>
                    </p>
                )}
                {!hasNextPage && tarefas.length > 0 && <p>Você chegou ao fim da lista.</p>}
            </div>
        </>
    );
}