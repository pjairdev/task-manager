"use client";

// Liga o site ao backend. Envolve o app todo (ver layout.tsx).

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./client";
import superjson from "superjson"

function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // no navegador, URL relativa
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  // useState pra não recriar isso toda vez que a tela atualiza
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 5_000 } } }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      // Endereço do backend
      links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
