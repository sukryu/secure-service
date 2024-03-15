import { ResponseTokenDto } from "./dtos/response-token.dto";

export interface ITokenService {
  generateToken(userId: number): Promise<ResponseTokenDto>;
  verifyToken(token: string, type: 'access' | 'refresh'): Promise<Boolean>;
  refreshToken(userId: number, refreshToken: string): Promise<ResponseTokenDto>;
  deleteRefreshToken(userId: number, refreshToken: string): Promise<void>;
  deleteAllRefreshToken(userId: number): Promise<void>;
}