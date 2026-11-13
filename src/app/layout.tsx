// Layout geral: tudo que tá aqui aparece em todas as páginas.

import type { Metadata } from "next";
import "./globals.css"
import { TRPCProvider } from "@/trpc/Provider";

export const metadata: Metadata = {
  title: "Tarefas • tRPC",
  description: "CRUD de tarefas com Next.js + tRPC + React Query",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f5f5f4", margin: 0 }}>
        {/* O TRPCProvider deixa todas as páginas conversarem com o backend */}
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
