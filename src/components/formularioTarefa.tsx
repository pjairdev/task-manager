"use client";

// Formulário de tarefa.
// Se receber uma tarefa, ele entra no modo de edição.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { errosPorCampo, mensagemDeErro } from "@/lib/erros";

// Mesmos limites do servidor, pra avisar o usuário antes de enviar
const TITULO_MAX = 100;
const DESCRICAO_MAX = 500;

type Props = {
    // Se vier preenchido, é edição; se não, é uma tarefa nova
    tarefa?: { id: string; titulo: string; descricao?: string };
};

type ErrosFormulario = { titulo?: string; descricao?: string };

// Confere os campos antes de mandar pro servidor (ex.: título vazio não passa)
function validar(titulo: string, descricao: string): ErrosFormulario {
    const erros: ErrosFormulario = {};
    if (!titulo.trim()) erros.titulo = "O título é obrigatório";
    else if (titulo.trim().length > TITULO_MAX)
        erros.titulo = `O título deve ter no máximo ${TITULO_MAX} caracteres`;
    if (descricao.trim().length > DESCRICAO_MAX)
        erros.descricao = `A descrição deve ter no máximo ${DESCRICAO_MAX} caracteres`;
    return erros;
}

export function FormularioTarefa({ tarefa }: Props) {
    const editando = Boolean(tarefa);
    const router = useRouter();
    const utils = trpc.useUtils();

    // Guarda o que o usuário digitou e os erros de cada campo
    const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
    const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
    const [erros, setErros] = useState<ErrosFormulario>({});
    // Só mostra erro num campo depois que o usuário mexeu nele
    const [tocados, setTocados] = useState<{ titulo?: boolean; descricao?: boolean }>({});

    // Depois de salvar: atualiza a lista e volta pra página inicial com a mensagem de sucesso
    const aoSalvar = async (mensagem: string) => {
        await utils.tarefas.listarPaginado.invalidate();
        router.push(`/?sucesso=${encodeURIComponent(mensagem)}`);
        router.refresh();
    };

    const criar = trpc.tarefas.criar.useMutation({
        onSuccess: (t) => aoSalvar(`Tarefa "${t.titulo}" criada com sucesso.`),
    });
    const atualizar = trpc.tarefas.atualizar.useMutation({
        onSuccess: (t) => aoSalvar(`Tarefa "${t.titulo}" atualizada com sucesso.`),
    });

    // Escolhe se vai criar ou atualizar, dependendo do modo
    const mutacao = editando ? atualizar : criar;
    const salvando = mutacao.isPending || mutacao.isSuccess; // trava os botões enquanto salva

    // Erros que o servidor devolveu (ex.: tarefa não encontrada)
    const errosBackend = errosPorCampo(mutacao.error);
    const erroGeral =
        mutacao.error && !Object.keys(errosBackend).length ? mensagemDeErro(mutacao.error) : null;

    function aoAlterar(campo: "titulo" | "descricao", valor: string) {
        const novoTitulo = campo === "titulo" ? valor : titulo;
        const novaDescricao = campo === "descricao" ? valor : descricao;
        if (campo === "titulo") setTitulo(valor);
        else setDescricao(valor);
        setTocados((t) => ({ ...t, [campo]: true }));
        setErros(validar(novoTitulo, novaDescricao)); // confere de novo enquanto digita
    }

    function aoEnviar(e: React.FormEvent) {
        e.preventDefault();
        const encontrados = validar(titulo, descricao);
        setErros(encontrados);
        setTocados({ titulo: true, descricao: true });
        if (Object.keys(encontrados).length) return; // tem erro? não envia

        if (tarefa) atualizar.mutate({ id: tarefa.id, titulo, descricao });
        else criar.mutate({ titulo, descricao: descricao || undefined });
    }

    const erroTitulo = (tocados.titulo && erros.titulo) || errosBackend.titulo?.[0];
    const erroDescricao = (tocados.descricao && erros.descricao) || errosBackend.descricao?.[0];

    return (
        <form onSubmit={aoEnviar} className="formulario" noValidate>
            {erroGeral && <div className="aviso aviso-erro" role="alert">{erroGeral}</div>}

            <label className="campo">
                <span>Título <span className="obrigatorio">*</span></span>
                <input
                    value={titulo}
                    onChange={(e) => aoAlterar("titulo", e.target.value)}
                    placeholder="O que precisa ser feito?"
                    aria-invalid={Boolean(erroTitulo)}
                    disabled={salvando}
                    autoFocus
                />
                <small className="contador">{titulo.trim().length}/{TITULO_MAX}</small>
                {erroTitulo && <small className="texto-erro">{erroTitulo}</small>}
            </label>

            <label className="campo">
                <span>Descrição (opcional)</span>
                <textarea
                    value={descricao}
                    onChange={(e) => aoAlterar("descricao", e.target.value)}
                    rows={4}
                    aria-invalid={Boolean(erroDescricao)}
                    disabled={salvando}
                />
                <small className="contador">{descricao.trim().length}/{DESCRICAO_MAX}</small>
                {erroDescricao && <small className="texto-erro">{erroDescricao}</small>}
            </label>

            <div className="acoes-formulario">
                <button type="submit" className="botao" disabled={salvando}>
                    {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar tarefa"}
                </button>
                <Link href="/" className="botao-secundario">Cancelar</Link>
            </div>
        </form>
    );
}