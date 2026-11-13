// Transforma os erros do servidor em mensagens fáceis de entender pro usuário.

type ErroTRPC = {
    message: string;
    data?: {
        code?: string;
        zodError?: { fieldErrors: Record<string, string[] | undefined> } | null
    } | null
}

export function mensagemDeErro(erro: ErroTRPC | null | undefined): string | null {
    if (!erro) return null;

    // Erro de validação (ex.: título vazio): junta as mensagens dos campos
    const camposZod = erro.data?.zodError?.fieldErrors;
    if (camposZod) {
        const msgs = Object.values(camposZod).flat().filter(Boolean);
        if (msgs.length) return msgs.join(", ");
    }

    // Servidor fora do ar ou sem internet
    if (erro.message === "Failed to fetch") {
        return "Não foi possível conectar com o servidor. Verifique conexão."
    }

    return erro.message || "Ocorreu um erro inesperado";
}

// Separa os erros por campo, pra mostrar embaixo de cada input
export function errosPorCampo(erro: ErroTRPC | null | undefined) {
    return erro?.data?.zodError?.fieldErrors ?? {};
}