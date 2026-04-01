import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { credentialsProvider } from "@/lib/auth/config";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: authSecret,
  providers: [credentialsProvider],
});
