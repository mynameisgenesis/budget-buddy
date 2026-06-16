import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function createTransaction(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const categoryId = formData.get("categoryId") as string;
  const amount = Number(formData.get("amount"));
  const description = formData.get("description") as string;
  const transactionDate = formData.get("transactionDate") as string;
  const type = formData.get("type") as string;

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    category_id: categoryId,
    amount,
    description,
    transaction_date: transactionDate,
    type,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  redirect("/dashboard");
}

export default async function TransactionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Transaction</h1>

      <form action={createTransaction} className="space-y-4">
        <div>
          <label>Category</label>
          <select
            name="categoryId"
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select Category</option>

            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Amount</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label>Type</label>
          <select
            name="type"
            className="w-full border rounded p-2"
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label>Date</label>
          <input
            name="transactionDate"
            type="date"
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label>Description</label>
          <input
            name="description"
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save Transaction
        </button>
      </form>
    </main>
  );
}