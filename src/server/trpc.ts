// Configuração principal do tRPC (a ligação entre o site e o servidor).

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

const t = initTRPC.create({
  transformer: superjson, // faz a data chegar no site como data, e não como texto
  // Manda junto os erros de validação, pra mostrar a mensagem certa em cada campo
  errorFormatter({ shape, error }) {

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      }
    }
  }
})
// Contexto: dados que todas as rotas podem usar (aqui não precisei de nada)
export const createContext = async () => {
  return {};
};

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory
