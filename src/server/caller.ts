// Deixa as páginas do servidor usarem o backend direto, sem precisar fazer uma requisição.
// É isso que faz a lista já vir carregada (SSR).

import { createCallerFactory } from "./trpc";
import { appRouter } from "./routers/_app";

const createCaller = createCallerFactory(appRouter)

export const api = createCaller({})