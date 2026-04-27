import { SignUpForm } from "@/components/forms/sign-up-form";
import { appStore } from "@/lib/app-store";

export default async function SignUpPage() {
  const charities = await appStore.getCharities();

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_460px] lg:px-8">
      <div className="space-y-5">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Start here
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Join a golf platform that treats impact as part of the product, not the afterthought.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Signup includes plan selection, charity selection, and your initial contribution percentage so members land inside the dashboard already ready to play.
        </p>
      </div>
      <SignUpForm charities={charities} />
    </main>
  );
}
