import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TransactionHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      *,
      categories (
        name
      )
    `,
    )
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>

      <div className="border rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Merchant</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Amount</th>
            </tr>
          </thead>

          <tbody>
            {transactions?.map((transaction) => (
              <tr key={transaction.id} className="border-b">
                <td className="p-3">
                  {new Date(transaction.transaction_date).toLocaleDateString()}
                </td>

                <td className="p-3">{transaction.merchant || "-"}</td>

                <td className="p-3">
                  {transaction.categories?.name || "Uncategorized"}
                </td>

                <td
                  className={`p-3 text-right font-medium ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}$
                  {Number(transaction.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
