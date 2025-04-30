import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from 'src/common';
import { JwtPayload } from '../interfaces/jwt-payload';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { usuarios as User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService = new PrismaService(),
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.prisma.usuarios.findUnique({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }

    if (!user.activo) {
      throw new UnauthorizedException('User is inactive, talk with an admin');
    }

    return user;
  }
}
