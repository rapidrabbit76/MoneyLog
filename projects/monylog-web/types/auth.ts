export interface User {
  id: string
  name: string
  email: string
  image: string | null
}

export interface Session {
  user: User
  expires: string
}
