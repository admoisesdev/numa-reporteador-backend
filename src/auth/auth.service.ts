import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService, BcryptAdapter } from 'src/common';

import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload';
import { usuarios as User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly prisma: PrismaService = new PrismaService(),
    private readonly jwtService: JwtService,
  ) {}

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    const existingUser = await this.prisma.usuarios.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado.');
    }

    try {
      const hashedPassword = BcryptAdapter.hash(password);

      const user = await this.prisma.usuarios.create({
        data: {
          nombre: userData.name,
          apellido: userData.lastName,
          email: userData.email.toLocaleLowerCase(),
          password: hashedPassword,
        },
      });

      delete user.password;

      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const response = await this.prisma.usuarios.findUnique({
      where: { email },
    });
    if (!response) {
      throw new UnauthorizedException(
        'Email no encontrado. Verifique su email.',
      );
    }

    const { password: hashedPassword, ...user } = response;

    const isPasswordValid = BcryptAdapter.compare(password, hashedPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Password no valido. Verifique su password.',
      );
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkAuthStatus(user: User) {
    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }
}
