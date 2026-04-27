import { LinkButton } from "@/components/link-button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Not found</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        That page drifted out of bounds.
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        The route you requested does not exist in this build.
      </p>
      <div className="mt-8">
        <LinkButton href="/">Go home</LinkButton>
      </div>
    </main>
  );
}
