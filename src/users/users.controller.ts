import { Controller , Logger } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor() {}
}