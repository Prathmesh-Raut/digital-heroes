import { SignInForm } from "@/components/forms/sign-in-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <div className="space-y-5">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Member access
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Sign in to manage your scores, charity, subscription, and claims.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Demo credentials are already seeded so you can explore both sides of the product.
        </p>
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Demo accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>`maya@digitalheroes.dev` / `DemoPass123!`</p>
            <p>`admin@digitalheroes.dev` / `DemoPass123!`</p>
          </CardContent>
        </Card>
      </div>
      <SignInForm />
    </main>
  );
}
