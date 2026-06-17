"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function TransactionHistoryPage() {
  const supabase = createClient();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMerchant, setEditingMerchant] = useState("");
  const [editingAmount, setEditingAmount] = useState("");

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

    // Normalize categories to an array (may be empty)
    const normalized = (data ?? []).map((d: any) => ({
      ...d,
      categories: Array.isArray(d.categories)
        ? d.categories
        : d.categories
          ? [d.categories]
          : [],
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

    setTransactions((current: Transaction[]) =>
      current.filter(
        (transaction: Transaction) => transaction.id !== transactionId,
      ),
    );
  }

  async function updateTransaction(transactionId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .update({
        merchant: editingMerchant,
        amount: Number(editingAmount),
      })
      .eq("id", transactionId)
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
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const normalizedData = {
      ...data,
      categories: Array.isArray(data?.categories)
        ? data.categories
        : data?.categories
          ? [data.categories]
          : [],
    } as unknown as Transaction;

    setTransactions((current: Transaction[]) =>
      current.map((transaction: Transaction) =>
        transaction.id === transactionId ? normalizedData : transaction,
      ),
    );

    setEditingId(null);
    setEditingMerchant("");
    setEditingAmount("");
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const categoryText = (transaction.categories || [])
        .map((c: any) => c.name)
        .join(" ");

      const text = [
        transaction.merchant,
        transaction.description,
        categoryText,
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
                  {editingId === transaction.id ? (
                    <input
                      className="border rounded p-1 w-full"
                      value={editingMerchant}
                      onChange={(e) => setEditingMerchant(e.target.value)}
                    />
                  ) : (
                    transaction.merchant || transaction.description || "-"
                  )}
                </td>
                <td className="p-3">
                  {transaction.categories &&
                  transaction.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {transaction.categories.map((cat: any, i: number) => (
                        <Badge key={i} variant="secondary">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    "Uncategorized"
                  )}
                </td>
                <td className="p-3 text-right">
                  {editingId === transaction.id ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border rounded p-1 w-28 text-right"
                      value={editingAmount}
                      onChange={(e) => setEditingAmount(e.target.value)}
                    />
                  ) : (
                    <span
                      className={`font-medium ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {Number(transaction.amount).toFixed(2)}
                    </span>
                  )}
                </td>

                <td className="p-3 text-right">
                  {editingId === transaction.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => updateTransaction(transaction.id)}
                        className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingMerchant("");
                          setEditingAmount("");
                        }}
                        className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(transaction.id);
                          setEditingMerchant(transaction.merchant ?? "");
                          setEditingAmount(String(transaction.amount));
                        }}
                        className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
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
