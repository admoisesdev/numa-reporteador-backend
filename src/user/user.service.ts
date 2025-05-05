import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { usuarios as User } from '@prisma/client';

import { CreateUser, GetUsersCompanies } from './use-cases';
import { CreateUserDto } from './dto/create-user.dto';
import { UserCompany } from './interfaces';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');

  constructor(
    private createUser: CreateUser,
    private usersCompanies: GetUsersCompanies,
  ) {}

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = this.createUser.execute(createUserDto);

      return newUser;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  getUsersWithCompanies(): Promise<UserCompany[]> {
    try {
      const usersWithCompanies = this.usersCompanies.execute();

      return usersWithCompanies;
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
