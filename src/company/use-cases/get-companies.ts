import { Injectable, NotFoundException } from '@nestjs/common';
import { empresas as Company } from '@prisma/client';

import { PrismaService } from 'src/common';

interface GetCompaniesUseCase {
  execute(): Promise<Company[]>;
}

@Injectable()
export class GetCompanies implements GetCompaniesUseCase {
  constructor(private prisma: PrismaService) {}

  public async execute(): Promise<Company[]> {
    const companies = await this.prisma.empresas.findMany({
      where: {
        estado: true,
      },
    });

    if (!companies || companies.length === 0) {
      throw new NotFoundException('No companies found');
    }

    return companies;
  }
}
