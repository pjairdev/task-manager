// Rotas das tarefas: criar, listar, editar e excluir.

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { gerarId, tarefas, type Tarefa } from "../db";

// Regras do título: obrigatório e com no máximo 100 caracteres
const tituloSchema = z
  .string({ error: "O título é obrigatório" })
  .trim()
  .min(1, "O título é obrigatório")
  .max(100, "O título deve ter no máximo 100 caracteres");

// Descrição é opcional, até 500 caracteres
const descricaoSchema = z
  .string()
  .trim()
  .max(500, "A descrição deve ter no máximo 500 caracteres")
  .optional();

const idSchema = z.object({ id: z.string().min(1, "O id é obrigatório") });

// Procura a tarefa pelo id. Se não achar, devolve erro de "não encontrada"
function buscarOuFalhar(id: string): Tarefa {
  const tarefa = tarefas.get(id);
  if (!tarefa) {
    throw new TRPCError({ code: "NOT_FOUND", message: `Tarefa com id "${id}" não encontrada` });
  }
  return tarefa;
}

// Mais novas primeiro
function tarefasOrdenadas() {
  return [...tarefas.values()].sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime());
}

export const tarefasRouter = router({
  // Lista todas as tarefas
  listar: publicProcedure.query(() => tarefasOrdenadas()),

  // Lista em partes pra rolagem infinita.
  listarPaginado: publicProcedure
    .input(
      z.object({
        limite: z.number().int().min(1).max(50).default(10),
        cursor: z.number().int().min(0).nullish(),
      }),
    )
    .query(({ input }) => {
      const todas = tarefasOrdenadas();
      const inicio = input.cursor ?? 0;
      const fim = inicio + input.limite;
      return {
        itens: todas.slice(inicio, fim),
        proximoCursor: fim < todas.length ? fim : null, // null = não tem mais
        total: todas.length,
      };
    }),

  // Busca uma tarefa só (usado na página de editar)
  buscarPorId: publicProcedure.input(idSchema).query(({ input }) => buscarOuFalhar(input.id)),

  // Cria uma tarefa nova
  criar: publicProcedure
    .input(z.object({ titulo: tituloSchema, descricao: descricaoSchema }))
    .mutation(({ input }) => {
      const nova: Tarefa = {
        id: gerarId(),
        titulo: input.titulo,
        descricao: input.descricao || undefined,
        dataCriacao: new Date(),
      };
      tarefas.set(nova.id, nova);
      return nova;
    }),

  // Edita uma tarefa. Só muda o que foi enviado
  atualizar: publicProcedure
    .input(idSchema.extend({ titulo: tituloSchema.optional(), descricao: descricaoSchema }))
    .mutation(({ input }) => {
      const atual = buscarOuFalhar(input.id);
      const atualizada: Tarefa = {
        ...atual,
        titulo: input.titulo ?? atual.titulo,
        // Se não mandou descrição, mantém, se mandou vazia, apaga
        descricao: input.descricao === undefined ? atual.descricao : input.descricao || undefined,
      };
      tarefas.set(atualizada.id, atualizada);
      return atualizada;
    }),

  // Exclui uma tarefa
  deletar: publicProcedure.input(idSchema).mutation(({ input }) => {
    const tarefa = buscarOuFalhar(input.id);
    tarefas.delete(input.id);
    return tarefa;
  }),
});