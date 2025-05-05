import { BadRequestException, Injectable } from '@nestjs/common';
import { usuarios as User } from '@prisma/client';

import { CreateUserDto } from '../dto';

import { BcryptAdapter, PrismaService } from 'src/common';

interface CreateUserUseCase {
  execute(createUserDto: CreateUserDto): Promise<User>;
}

@Injectable()
export class CreateUser implements CreateUserUseCase {
  constructor(private prisma: PrismaService) {}

  public async execute(createUserDto: CreateUserDto): Promise<User> {
    const { name, lastName, email, password, roles, companyIds } =
      createUserDto;
    const hashedPassword = BcryptAdapter.hash(password);

    const existingUser = await this.prisma.usuarios.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const companies = await this.prisma.empresas.findMany({
      where: { id: { in: companyIds } },
    });

    if (companies.length !== companyIds.length) {
      throw new BadRequestException('One or more companies not found');
    }

    const user = await this.prisma.usuarios.create({
      data: {
        nombre: name,
        apellido: lastName,
        email: email,
        password: hashedPassword,
        roles: roles || ['user'],
      },
    });

    const userCompanies = companyIds.map((companyId) => ({
      usuario_id: user.id,
      empresa_id: companyId,
    }));

    await this.prisma.usuario_empresa.createMany({
      data: userCompanies,
    });

    return user;
  }
}
