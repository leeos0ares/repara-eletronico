import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { Usuario } from "@/models/Usuario";
import type { Role } from "@/lib/constantes";

export const authOptions: NextAuthOptions = {
  // JWT: a sessão fica num token no cookie, não precisa de tabela de sessões no banco
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },

  providers: [
    CredentialsProvider({
      name: "E-mail e senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        await dbConnect();
        const usuario = await Usuario.findOne({
          email: credentials.email.toLowerCase().trim(),
        }).select("+senhaHash");

        if (!usuario || !usuario.ativo) return null;

        const senhaCorreta = await bcrypt.compare(credentials.senha, usuario.senhaHash);
        if (!senhaCorreta) return null;

        return {
          id: usuario._id.toString(),
          name: usuario.nome,
          email: usuario.email,
          role: usuario.role as Role,
        };
      },
    }),
  ],

  callbacks: {
    // No login, coloca id e role dentro do token.
    // Nos acessos seguintes, confere no banco se o usuário continua ativo e com o mesmo perfil:
    // assim, desativar ou rebaixar alguém vale na hora, e não só quando o token expirar.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        return token;
      }

      if (token.id) {
        await dbConnect();
        const usuario = await Usuario.findById(token.id).select("role ativo");
        token.invalido = !usuario || !usuario.ativo;
        if (usuario) token.role = usuario.role as Role;
      }
      return token;
    },
    // Repassa para a sessão que o front enxerga.
    // Token invalidado: devolver objeto vazio faz o getServerSession retornar null (sem sessão).
    session({ session, token }) {
      if (token.invalido) return {} as typeof session;

      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
