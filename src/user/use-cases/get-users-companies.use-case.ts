import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common';
import { UserCompany } from '../interfaces';

interface GetUsersCompaniesUseCase {
  execute(): Promise<UserCompany[]>;
}

@Injectable()
export class GetUsersCompanies implements GetUsersCompaniesUseCase {
  constructor(private prisma: PrismaService) {}

  public async execute(): Promise<UserCompany[]> {
    const usersWithCompanies = await this.prisma.usuarios.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        roles: true,

        usuario_empresa: {
          select: {
            empresas: true,
          },
        },
      },
    });

    const usersWithCompaniesFiltered = usersWithCompanies.map((user) => {
      const { usuario_empresa, ...userData } = user;
      const companies = usuario_empresa.map((company) => company.empresas);
      return {
        ...userData,
        empresas: companies,
      };
    });

    return usersWithCompaniesFiltered;
  }
}
