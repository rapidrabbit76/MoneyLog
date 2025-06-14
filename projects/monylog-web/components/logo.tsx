import { CreditCard } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
        <CreditCard className="h-5 w-5" />
      </div>
    </div>
  )
}
