import { UsersTable } from "@/components/users-table"

export default function Page() {
  return (
    <main className="min-h-svh bg-background p-6 md:p-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            A simple shadcn table built with Next.js.
          </p>
        </header>
        <UsersTable />
      </div>
    </main>
  )
}
