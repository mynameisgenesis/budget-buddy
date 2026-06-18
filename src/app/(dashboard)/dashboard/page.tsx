import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SpendingPieChart from "@/components/spending-pie-chart";
import { Transaction } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startDate = startOfMonth.toISOString().split("T")[0];

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
    id,
    category_id,
    amount,
    type,
    description,
    merchant,
    transaction_date,
    categories (
      name
    )
  `,
    )
    .eq("user_id", user.id)
    .gte("transaction_date", startDate)
    .order("transaction_date", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type, monthly_budget")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .order("name");

  const income =
    transactions
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const expenses =
    transactions
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const remaining = income - expenses;

  const budgetRows =
    categories?.map((category) => {
      const actual =
        transactions
          ?.filter((t) => t.category_id === category.id && t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

      const budget = Number(category.monthly_budget);
      const remaining = budget - actual;

      return {
        id: category.id,
        name: category.name,
        budget,
        actual,
        remaining,
      };
    }) ?? [];

  const chartData = budgetRows
    .filter((row) => row.actual > 0)
    .map((row) => ({
      name: row.name,
      value: row.actual,
    }));

  return (
    <main className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">This month’s budget summary</p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/categories">Categories</Link>
          </Button>
          <Button asChild>
            <Link href="/transactions">Add Transaction</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Income</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            ${income.toFixed(2)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            ${expenses.toFixed(2)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Remaining</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            ${remaining.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>

          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {transaction.merchant ||
                          transaction.description ||
                          transaction.categories?.[0]?.name ||
                          "Transaction"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.transaction_date} ·{" "}
                        {transaction.categories?.[0]?.name ?? "Uncategorized"}
                      </p>
                    </div>

                    <p
                      className={
                        transaction.type === "income"
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {Number(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No transactions yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>

          <CardContent>
            {budgetRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Category</th>
                      <th className="text-right py-2">Budget</th>
                      <th className="text-right py-2">Actual</th>
                      <th className="text-right py-2">Remaining</th>
                    </tr>
                  </thead>

                  <tbody>
                    {budgetRows.map((row) => (
                      <tr key={row.id} className="border-b">
                        <td className="py-2">{row.name}</td>
                        <td className="text-right py-2">
                          ${row.budget.toFixed(2)}
                        </td>
                        <td className="text-right py-2">
                          ${row.actual.toFixed(2)}
                        </td>
                        <td
                          className={`text-right py-2 font-medium ${
                            row.remaining < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          ${row.remaining.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No expense categories yet.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Spending By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <SpendingPieChart data={chartData} />
            ) : (
              <p className="text-muted-foreground">No spending data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
