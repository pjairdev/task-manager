# Gerenciador de Tarefas

Um sistema simples para organizar tarefas: dá para **criar, ver, editar e excluir** tarefas em uma página web.

Foi feito com **Next.js 15** e **tRPC**, usando TypeScript.

## Como rodar o projeto

É preciso ter o **Node.js** instalado (versão 20 ou mais recente).

1. Instale as dependências:

   npm install

2. Inicie o projeto:

   npm run dev

3. Abra **http://localhost:3000** no navegador.

> As tarefas ficam guardadas só enquanto o servidor está ligado. Ao desligar e ligar de novo, a lista começa vazia. Isso é proposital: o desafio não pedia banco de dados.

## O que o sistema faz

**Cada tarefa tem:**
- um título (obrigatório);
- uma descrição (opcional);
- a data em que foi criada;
- um identificador único, gerado automaticamente.

**Página inicial: lista de tarefas**
- Mostra todas as tarefas, das mais novas para as mais antigas.
- A lista já chega pronta quando a página abre, sem precisar esperar um "carregando".
- Conforme você rola a página, mais tarefas vão aparecendo, 10 de cada vez (rolagem infinita).
- Cada tarefa tem os botões **Editar** e **Excluir**. Antes de excluir, o sistema pede confirmação e depois avisa se deu certo ou não.

**Criar e editar tarefas**
- Um formulário simples, com título e descrição.
- Não deixa salvar uma tarefa sem título, e avisa na hora o que está faltando.
- Mostra quantos caracteres você ainda pode usar em cada campo.
- Na edição, o formulário já abre com os dados da tarefa preenchidos.

**Mensagens e avisos**
- Depois de criar, editar ou excluir, aparece uma mensagem verde de sucesso.
- Se algo der errado, aparece uma mensagem vermelha explicando o problema. Por exemplo: a tarefa não existe mais, ou não foi possível conectar ao servidor.
- Enquanto uma ação está em andamento, os botões mostram "Salvando..." ou "Excluindo..." e ficam desativados, para evitar cliques duplicados.
- Se alguém tentar abrir uma tarefa que não existe, o sistema mostra a página "Tarefa não encontrada".

## Como foi organizado

  **Servidor:** guarda as tarefas e faz as quatro operações (criar, listar, atualizar e excluir). Ele também confere os dados recebidos, então mesmo que alguém tente enviar uma tarefa sem título por fora do site, o servidor recusa.

  **Site:** as páginas que o usuário vê, que conversam com o servidor.
- As regras (como "título obrigatório") são conferidas nos dois lados: no site, para avisar o usuário na hora, e no servidor, por segurança.
- Os principais arquivos têm comentários explicando as decisões tomadas.