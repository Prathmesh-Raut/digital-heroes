import { PublicCharityDirectory } from "@/components/public-charity-directory";
import { appStore } from "@/lib/app-store";

export default async function CharitiesPage() {
  const charities = await appStore.getCharities();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Charity directory
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Search, compare, and support charities without leaving the platform.
        </h1>
        <p className="text-sm text-muted-foreground">
          Every member chooses a charity during signup. The same directory also supports independent donations and spotlight storytelling on the homepage.
        </p>
      </div>
      <div className="mt-10">
        <PublicCharityDirectory charities={charities} />
      </div>
    </main>
  );
}
