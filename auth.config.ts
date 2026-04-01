import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }

        if (token.role === "STUDENT" || token.role === "ADMIN") {
          session.user.role = token.role;
        }
      }

      return session;
    },
  },
};
