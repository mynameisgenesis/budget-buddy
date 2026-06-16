import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4">
        <h1 className="text-2xl font-bold mb-6">
          Budget Buddy
        </h1>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block rounded p-2 hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/transactions"
            className="block rounded p-2 hover:bg-gray-100"
          >
            Transactions
          </Link>

          <Link
            href="/categories"
            className="block rounded p-2 hover:bg-gray-100"
          >
            Categories
          </Link>
        </nav>
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}