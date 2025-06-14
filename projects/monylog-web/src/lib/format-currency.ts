export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
  }).format(amount)
}
