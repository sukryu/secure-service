import { User } from "@prisma/client";

export class UserResponseDto {
  id: number;
  email: string;
  username: string;
  phone: string;

  constructor(user: Partial<User>) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.phone = user.phone;
  }
}