import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CreateUser, GetUsersCompanies } from './use-cases';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, CreateUser, GetUsersCompanies],
})
export class UserModule {}
