export interface User {
  id: string;
  email: string;
  nickname: string;
  thumbnail: string | null;
}

export interface Session {
  user: User;
  expires: string;
}
