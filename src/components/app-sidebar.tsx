import Link from "next/link";
import SignOutButton from "@/components/sign-out-button";

export default function AppSidebar() {
  return (
    <aside className="w-64 min-h-screen border-r p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Budget Buddy</h1>
        <p className="text-sm text-muted-foreground">
          Money, but less feral.
        </p>
      </div>

      <nav className="space-y-2 flex-1">
        <Link
          href="/dashboard"
          className="block rounded px-3 py-2 hover:bg-gray-100"
        >
          Dashboard
        </Link>

        <Link
          href="/transactions"
          className="block rounded px-3 py-2 hover:bg-gray-100"
        >
          Add Transaction
        </Link>

        <Link
          href="/transactions/history"
          className="block rounded px-3 py-2 hover:bg-gray-100"
        >
          Transaction History
        </Link>

        <Link
          href="/categories"
          className="block rounded px-3 py-2 hover:bg-gray-100"
        >
          Categories
        </Link>
      </nav>

      <div className="border-t pt-4">
        <SignOutButton />
      </div>
    </aside>
  );
}