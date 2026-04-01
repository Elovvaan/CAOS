import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { credentialsProvider } from "@/lib/auth/config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [credentialsProvider],
});
