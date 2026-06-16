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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState("");

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
      [...current, data].sort((a, b) => a.name.localeCompare(b.name)),
    );

    setName("");
    setType("expense");
    setBudget("");
  }

  async function deleteCategory(categoryId: string) {
    const confirmed = confirm("Delete this category?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      alert(error.message);
      return;
    }

    setCategories((current) =>
      current.filter((category) => category.id !== categoryId),
    );
  }

  async function updateBudget(categoryId: string) {
    const { data, error } = await supabase
      .from("categories")
      .update({ monthly_budget: Number(editingBudget) })
      .eq("id", categoryId)
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setCategories((current) =>
      current.map((category) => (category.id === categoryId ? data : category)),
    );

    setEditingId(null);
    setEditingBudget("");
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
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b">
                <td className="p-3">{category.name}</td>
                <td className="p-3 capitalize">{category.type}</td>
                <td className="p-3">
                  {editingId === category.id ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border rounded p-1 w-28"
                      value={editingBudget}
                      onChange={(e) => setEditingBudget(e.target.value)}
                      onBlur={() => updateBudget(category.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateBudget(category.id);
                        }

                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingBudget("");
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingBudget(String(category.monthly_budget));
                      }}
                      className="hover:underline"
                    >
                      ${Number(category.monthly_budget).toFixed(2)}
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
