import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { UsersService } from "src/users/users.service";
import { LoginDto } from "./dtos/login.dto";
import { CreateUserDto } from "src/users/dtos/user/create-user.dto";
import { TypedEventEmitter } from "src/mails/event-emitter/typed-event-emitter.class";
import { generateAlphaNumericOTP } from "src/utils/utils";

@ApiBearerAuth()
@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createProfile: CreateUserDto) {
    this.eventEmitter.emit('user.welcome', {
      name: createProfile.username,
      email: createProfile.email,
    });

    this.eventEmitter.emit('user.verify-email', {
      name: createProfile.username,
      email: createProfile.email,
      otp: generateAlphaNumericOTP(6),
    })
    return await this.authService.create(createProfile);
  }

  @Post('/login')
  async login(@Body() loginProfile: LoginDto) {
    return await this.authService.Login(loginProfile);
  }
}