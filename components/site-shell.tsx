import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-zinc-100">
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold tracking-wide">CAOS — powered by RW</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pods">Pods</Link>
            {session?.user ? <Link href="/app">App</Link> : <Link href="/sign-in">Sign In</Link>}
            {session?.user && (
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" className="bg-zinc-800">Sign out</Button>
              </form>
            )}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
