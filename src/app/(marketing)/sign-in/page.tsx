import Image from "next/image";
import SignIn from "@/components/auth/sign-in";

export default function SignInPage() {
  return (
    <main className="flex min-h-[80vh] w-full flex-col items-center justify-start px-5 py-20">
      <Image
        src="/logo.png"
        alt="SkibiriDin"
        width={64}
        height={64}
        className="mb-4 size-16 object-contain dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.55)]"
        priority
      />
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
        Entrar no SkibiriDin
      </h1>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Bem-vindo de volta. Digite seu e-mail e senha para continuar.
      </p>
      <SignIn />
    </main>
  );
}
