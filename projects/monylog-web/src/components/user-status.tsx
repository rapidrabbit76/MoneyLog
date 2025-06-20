"use client"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, Edit, Download, Upload } from "lucide-react"
import type { User as UserType } from "@/types/auth"
import { toast } from "@/hooks/use-toast"

interface UserStatusProps {
  user?: UserType | null
  onLogout: () => void
}

export function UserStatus({ user, onLogout }: UserStatusProps) {
  const router = useRouter()

  const initials = user?.nickname
    ? user.nickname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const handleSettingsClick = () => {
    router.push("/settings")
  }

  const handleAccountClick = () => {
    router.push("/account")
  }

  const handleDataExport = () => {
    toast({ title: "데이터 내보내기", description: "데이터 내보내기가 시작되었습니다. 완료되면 이메일로 알려드립니다.", variant: "default" })
  }

  const handleDataImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,.csv"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        toast({ title: "데이터 가져오기", description: `${file.name} 파일을 가져오는 중입니다...`, variant: "default" })
      }
    }
    input.click()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Avatar className="h-full w-full">
            {user?.thumbnail ? (
              <AvatarImage src={user.thumbnail || "/placeholder.svg"} alt={user.nickname || "사용자"} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">{initials}</AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.nickname || "사용자"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleAccountClick} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          <span>계정정보 수정</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>설정</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDataExport} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          <span>데이터 내보내기</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleDataImport} className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          <span>데이터 가져오기</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-red-600 dark:text-red-400">로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
