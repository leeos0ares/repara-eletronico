# Repara

Sistema web de gestão para uma assistência técnica de eletrônicos.

## 1. Descrição

O Repara organiza o dia a dia de uma assistência técnica de computadores, notebooks, videogames, controles e periféricos:
cadastro de clientes e equipamentos, ordens de serviço com status, orçamento com aprovação do cliente e histórico de
reparos por equipamento. A equipe vê o que precisa ser feito e o cliente acompanha o andamento sem depender de mensagens.

Projeto acadêmico (Next.js Fullstack), para uma única assistência técnica (não é um marketplace).

## 2. Tecnologias

- Next.js 16 (App Router, Proxy) e React 19
- TypeScript
- MongoDB Atlas com Mongoose 9 (conexão Singleton em `src/lib/mongodb.ts`)
- NextAuth.js v4 (login por credenciais, sessão em JWT) e bcryptjs
- TanStack React Query 5 e Zustand 5
- Tailwind CSS 4 e ShadCN/UI
- Vercel (hospedagem)

## 3. Funcionalidades

- Cadastro, login e logout; páginas privadas protegidas
- CRUD de usuários, clientes e equipamentos
- Ordens de serviço com número sequencial, prioridade, técnico, prazo e linha do tempo de movimentações
- Status com regras (`src/lib/status.ts`): cada status só avança para os próximos permitidos, e só para quem pode
- Orçamento criado pela equipe e aprovado ou recusado pelo cliente; sem aprovação o reparo não começa
- Dashboard diferente para cada perfil
- Histórico de reparos por equipamento
- Busca e filtros nas listas

Fluxo de status:

```
Recebido -> Em diagnóstico -> Aguardando aprovação -> (cliente aprova) -> Em reparo
                                                    -> (cliente recusa) -> Recusado -> Entregue ou Cancelado
Em reparo <-> Aguardando peças
Em reparo <-> Em testes -> Pronto para retirada -> Entregue
Em reparo -> Aguardando aprovação (serviço adicional: novo orçamento)
Cancelar: só o admin, até antes de "Pronto para retirada"
```

## 4. Perfis e permissões

| Perfil | O que pode fazer |
|---|---|
| Administrador | Gerencia usuários, clientes, equipamentos e ordens; atribui técnicos; muda prioridades; registra entregas e cancelamentos; gera o código de vínculo dos clientes |
| Técnico | Vê só as ordens atribuídas a ele; registra diagnóstico, orçamento, peças, procedimentos e testes; avança o status até "pronto para retirada"; consulta clientes e equipamentos sem editar |
| Cliente | Vê só as ordens e os equipamentos dele; consulta diagnóstico e orçamento; aprova ou recusa o orçamento |

Segurança:

- Senhas com bcrypt; o hash nunca sai nas respostas da API.
- O cadastro público sempre cria o perfil "cliente". Técnicos e administradores só são criados pelo admin.
- Três camadas de proteção: `src/proxy.ts` (páginas), layout do painel e `exigirAcesso` em cada rota `/api`
  (`src/lib/permissoes.ts`).
- A sessão é revalidada no banco a cada acesso (`src/lib/auth.ts`): desativar, excluir ou rebaixar um usuário vale na hora.
- O cliente não recebe observações internas, técnico nem prioridade.
- O e-mail sozinho não liga uma conta nova a um cliente já cadastrado no balcão: é preciso o código de vínculo,
  de uso único, gerado pelo admin na página do cliente.

## 5. Estrutura de diretórios

```
src/
  app/            páginas e rotas (api/ tem as rotas do servidor)
    (painel)/     páginas privadas, com menu lateral (layout aninhado)
  components/     componentes (ui/ é do ShadCN)
  hooks/          useAtualizarOrdem
  lib/            banco, login, permissões, regras de status, formatação, constantes
  models/         Usuario, Cliente, Equipamento, OrdemServico
  providers/      SessionProvider + React Query
  store/          Zustand (filtros e modais)
  types/          tipagens
  proxy.ts        proteção das páginas (antigo middleware.ts)
public/           logo
scripts/          criar-admin.mjs
```

## 6. Pré-requisitos

- Node.js **20.9 ou mais novo** (exigência do Next.js 16; o `--env-file` do script de admin pede 20.6+). Confira com `node -v`.
- npm e Git
- Conta no MongoDB Atlas (plano gratuito M0)
- Conta no GitHub e na Vercel (plano Hobby) para publicar

## 7. Instalação local

```bash
git clone https://github.com/leeos0ares/projeto-repara.git
cd projeto-repara
npm install
```

### Arquivos da raiz que o projeto espera

O `package.json` precisa destes scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "criar-admin": "node --env-file=.env.local scripts/criar-admin.mjs"
},
"engines": {
  "node": ">=20.9.0"
}
```

O `tsconfig.json` precisa apontar o alias `@/` para a pasta `src`:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

Os componentes do ShadCN ficam em `src/components/ui`. Se faltar algum:

```bash
npx shadcn@latest add button input label card table dialog textarea badge
```

A CLI da Vercel (`vercel`) não precisa estar nas dependências: a publicação é feita pelo GitHub.

Cor azul do tema: no fim de `src/app/globals.css` deve existir

```css
.dark {
  --primary: oklch(0.62 0.19 255);
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.62 0.19 255);
}
```

## 8. Configuração do .env.local

Copie o modelo (no Windows: `copy .env.example .env.local`):

```bash
cp .env.example .env.local
```

| Variável | Valor |
|---|---|
| `MONGODB_URI` | String de conexão do Atlas, com o nome do banco no final (passo 9) |
| `NEXTAUTH_SECRET` | Texto aleatório. Gere com o comando abaixo |
| `NEXTAUTH_URL` | `http://localhost:3000` no computador; na Vercel, a URL do site |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

O `.env.local` nunca vai para o GitHub (o `.gitignore` do Next já ignora `.env*`). O `.env.example` precisa ir:
se ele estiver sendo ignorado, acrescente `!.env.example` ao `.gitignore`.

## 9. Configuração do MongoDB Atlas

1. Crie um cluster gratuito (M0).
2. Em **Database Access**, crie um usuário e uma senha (use só letras e números; símbolos quebram a URL).
3. Em **Network Access**, libere `0.0.0.0/0` (necessário para a Vercel).
4. Em **Connect > Drivers**, copie a string, troque `<password>` pela senha e coloque `/repara` antes do `?`:

```
mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/repara?retryWrites=true&w=majority
```

As coleções são criadas sozinhas no primeiro uso.

## 10. Criação do primeiro administrador

```bash
npm run criar-admin -- "Seu Nome" admin@exemplo.com suaSenha
```

A senha precisa ter pelo menos 6 caracteres. O comando grava direto no banco do `MONGODB_URI`; se o site na Vercel usar o
mesmo `MONGODB_URI`, o admin já funciona lá. Os técnicos são criados depois, pelo admin, na tela **Usuários**.

## 11. Execução em desenvolvimento

```bash
npm run dev
```

Abra http://localhost:3000 e entre com o administrador. Depois de mudar o `.env.local`, pare (Ctrl+C) e rode de novo.

## 12. Compilação de produção

```bash
npm run lint
npm run build
npm run start
```

O `npm run build` precisa passar antes de publicar: se falha no computador, falha na Vercel.

## 13. Implantação na Vercel

1. Suba o projeto para o GitHub (sem o `.env.local`): `git add .`, `git commit`, `git push`.
2. Em vercel.com, entre com o GitHub e clique em **Add New > Project**. Importe o repositório.
3. A Vercel detecta o Next.js sozinha; não mude os comandos de build.
4. Cadastre as variáveis de ambiente (seção 14) **antes** de clicar em **Deploy**.
5. Depois do deploy, confira se o endereço final é o mesmo do `NEXTAUTH_URL`. Se não for, corrija e faça **Redeploy**.
6. Entre no site com o administrador e teste os três perfis.

Cada `git push` na branch `main` publica uma nova versão automaticamente.

## 14. Variáveis de ambiente na Vercel

Em **Project > Settings > Environment Variables** (ou na tela de importação):

| Nome | Valor |
|---|---|
| `MONGODB_URI` | A mesma string do Atlas |
| `NEXTAUTH_SECRET` | O segredo gerado no passo 8 |
| `NEXTAUTH_URL` | `https://NOME-DO-PROJETO.vercel.app` (o endereço real do site) |

Toda vez que mudar uma variável, faça **Redeploy** para ela valer.

## 15. Solução de problemas

| Sintoma | Causa e solução |
|---|---|
| `Missing script: "dev"` ou `"build"` | Faltam os scripts no `package.json` (seção 7) |
| `Module not found: Can't resolve '@/...'` | O alias `@/*` do `tsconfig.json` não aponta para `./src/*`, ou os arquivos de `src/components/ui` não existem (seção 7) |
| Aviso `"middleware" file convention is deprecated` | Ainda existe `src/middleware.ts`. Apague-o: a proteção agora está em `src/proxy.ts` |
| `node: .env.local: not found` | Crie o `.env.local` na raiz do projeto e rode o comando de lá |
| `bad option: --env-file` | Node antigo: instale o Node 20.9 ou mais novo |
| Timeout ao conectar ou `MongooseServerSelectionError` | `0.0.0.0/0` não liberado no Atlas, senha com símbolo ou `MONGODB_URI` errada |
| `NO_SECRET` ou o login falha | `NEXTAUTH_SECRET` não definido |
| Login volta para a tela de login na Vercel | `NEXTAUTH_URL` diferente do endereço real; corrija e faça Redeploy |
| Erro 500 no site publicado | Variável ausente na Vercel ou IP bloqueado no Atlas; veja os logs em **Deployments > Runtime Logs** |
| Build falha só na Vercel | Confira se `package.json` e `package-lock.json` estão no GitHub e se o Node é compatível |
| Cadastro recusado com "código de vínculo" | O e-mail já pertence a um cliente cadastrado no balcão; peça o código ao admin |
| Um usuário desativado ainda aparece logado | A sessão é revalidada no acesso seguinte; recarregue a página |

## Apêndice: roteiro de demonstração

1. **Admin:** em Usuários, crie um técnico. Em Clientes, cadastre um cliente. Em Equipamentos, cadastre um notebook para ele.
2. **Admin:** abra a ordem de serviço pelo equipamento (prioridade alta, técnico escolhido) e mostre o dashboard.
3. **Técnico:** veja a fila no dashboard, inicie o diagnóstico, preencha e envie o orçamento.
4. **Cliente:** como admin, gere o código de vínculo na página do cliente. Em `/cadastro`, crie a conta com o e-mail do
   cliente e o código. Aprove o orçamento e mostre que as notas internas não aparecem. Tente criar a conta sem o código
   para mostrar que é recusada.
5. **Técnico:** registre procedimentos e testes e marque como pronto.
6. **Admin:** registre a entrega e mostre o histórico de reparos na página do equipamento.
7. Mostre que um técnico não abre `/usuarios` e que um equipamento com ordens não pode ser excluído.

## Limitações conhecidas

- Quem se cadastra com um e-mail que a assistência ainda não conhece vira um cliente novo, sem confirmação de e-mail
  (não há dados para ver até a assistência abrir ordens para ele).
- O código de vínculo tem 10 caracteres aleatórios e não há limite de tentativas de cadastro.
- Ordens não são apagadas: "excluir" uma ordem é cancelá-la, para o histórico não se perder.
- Cliente sem conta não consegue aprovar o orçamento sozinho: o admin registra a decisão em nome dele.
- Fotos do equipamento ficam de fora.
- A busca das listas é feita no navegador, em cima dos dados já carregados.
