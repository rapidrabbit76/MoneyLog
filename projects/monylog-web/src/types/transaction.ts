export interface Transaction {
  description: string
  amount: number
  date: string
  category: string
  type: "income" | "expense"
}
