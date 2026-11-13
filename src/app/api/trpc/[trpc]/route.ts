// Essa é a porta de entrada do backend. Tudo que o site pede pro servidor passa por aqui.

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
    // Se der erro, mostra no terminal pra facilitar achar o problema
    onError({ path, error }) {
      if (process.env.NODE_ENV === "development") {
        console.error(`❌ tRPC falhou em ${path ?? "<sem-caminho>"}: ${error.message}`);
      }
    },
  });

// GET é pra buscar dados, POST é pra criar, editar e excluir
export { handler as GET, handler as POST };