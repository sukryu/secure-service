import { ResponseTokenDto } from "src/auth/token/dtos/response-token.dto";

export class ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  token?: ResponseTokenDto;
  error?: string;
}
