export interface Expenses {
  id: number;
  title: string;
  amount: number;
  dt: string;
  type: "expense" | "income";
  tags: {
    id: string;
    name: string;
  }[];
}
