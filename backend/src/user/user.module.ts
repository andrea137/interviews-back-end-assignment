import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

/* TODO: this is a placeholder class, 
    here will be defined the logic to manage the users
 */
@Module({
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
