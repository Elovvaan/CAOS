import { signUpAction } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Start Training</h1>
      <form action={signUpAction} className="space-y-4">
        <Input name="name" placeholder="Full name" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Password" required />
        <Button type="submit" className="w-full">Create account</Button>
      </form>
    </main>
  );
}
