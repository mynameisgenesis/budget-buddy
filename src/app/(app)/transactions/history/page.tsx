"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  merchant: string | null;
  description: string | null;
  transaction_date: string;
  categories: {
    name: string;
  } | null;
};

export default function TransactionHistoryPage() {
  const supabase = createClient();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");

  async function loadTransactions() {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        id,
        amount,
        type,
        merchant,
        description,
        transaction_date,
        categories (
          name
        )
      `,
      )
      .order("transaction_date", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    // Supabase may return a categories array; normalize to single category or null
    const normalized = (data ?? []).map((d: any) => ({
      ...d,
      categories: Array.isArray(d.categories)
        ? (d.categories[0] ?? null)
        : (d.categories ?? null),
    }));

    setTransactions(normalized as Transaction[]);
  }

  async function deleteTransaction(transactionId: string) {
    const confirmed = confirm("Delete this transaction?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (error) {
      alert(error.message);
      return;
    }

    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== transactionId),
    );
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const text = [
        transaction.merchant,
        transaction.description,
        transaction.categories?.name,
        transaction.amount,
        transaction.transaction_date,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [transactions, search]);

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">
          Search, review, and delete transactions.
        </p>
      </div>

      <input
        className="w-full border rounded p-2"
        placeholder="Search transactions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="border rounded overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Merchant</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b">
                <td className="p-3">
                  {new Date(transaction.transaction_date).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </td>

                <td className="p-3">
                  {transaction.merchant || transaction.description || "-"}
                </td>

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

                <td className="p-3 text-right">
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredTransactions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-muted-foreground"
                >
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
