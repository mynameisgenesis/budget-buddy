import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl space-y-6 text-center">
        <h1 className="text-4xl font-bold">Budget Buddy</h1>
        <p className="text-muted-foreground">
          Track income, expenses, category budgets, and where your money ran off to.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}