// Junta todas as rotas do backend num lugar só.

import { router } from "../trpc";
import { tarefasRouter } from "./tarefas";

export const appRouter = router({
  tarefas: tarefasRouter,
});

// O site usa esse tipo pra saber quais rotas existem. Só o tipo vai pro navegador, não o código.
export type AppRouter = typeof appRouter;
