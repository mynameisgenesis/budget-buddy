"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  monthly_budget: number;
};

export default function CategoriesPage() {
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      alert(error.message);
      return;
    }

    setCategories(data ?? []);
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You need to be logged in.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name,
        type,
        monthly_budget: Number(budget),
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setCategories((current) =>
      [...current, data].sort((a, b) => a.name.localeCompare(b.name))
    );

    setName("");
    setType("expense");
    setBudget("");
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Categories</h1>

      <form onSubmit={addCategory} className="border rounded p-4 space-y-4">
        <h2 className="font-semibold">Add Category</h2>

        <input
          placeholder="Category Name"
          className="w-full border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          className="w-full border rounded p-2"
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          required
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          type="number"
          step="0.01"
          placeholder="Monthly Budget"
          className="w-full border rounded p-2"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>

      <div className="border rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Budget</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b">
                <td className="p-3">{category.name}</td>
                <td className="p-3 capitalize">{category.type}</td>
                <td className="p-3">
                  ${Number(category.monthly_budget).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}