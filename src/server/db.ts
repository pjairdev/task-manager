// "Banco de dados" em memória. As tarefas ficam guardadas só enquanto o servidor tá ligado.

import { randomUUID } from "crypto";

// Formato de uma tarefa
export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};

// Uso um Map (id -> tarefa) porque fica fácil achar, editar e excluir pelo id.
// Guardo no globalThis pra lista não sumir toda vez que salvo o código no modo dev.
const globalParaTarefas = globalThis as unknown as { tarefas?: Map<string, Tarefa> };

export const tarefas: Map<string, Tarefa> =
  globalParaTarefas.tarefas ?? (globalParaTarefas.tarefas = new Map());

// Gera um id único pra cada tarefa
export function gerarId() {
  return randomUUID();
}