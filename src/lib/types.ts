export type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  merchant: string | null;
  description: string | null;
  transaction_date: string;
  categories: Categories | null;
};

export type Category = {
  name: string;
};

export type Categories = Category[];
