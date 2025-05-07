import { Injectable } from '@nestjs/common';
import { empresas as Company } from '@prisma/client';

import { PrismaService } from 'src/common';
import { CreateCompanyDto } from '../dto';

interface CreateCompanyUseCase {
  execute(createCompanyDto: CreateCompanyDto): Promise<Company>;
}

@Injectable()
export class CreateCompany implements CreateCompanyUseCase {
  constructor(private prisma: PrismaService) {}

  public async execute(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const {
      ruc,
      businessName,
      project,
      commercial,
      establishment,
      legalRepresentative,
      resolutionDate,
      isActive = true,
    } = createCompanyDto;

    const newCompany = await this.prisma.empresas.create({
      data: {
        ruc: ruc,
        razon_social: businessName,
        proyecto: project,
        comercial: commercial,
        establecimiento: establishment,
        representante_legal: legalRepresentative,
        fecha: resolutionDate ? new Date(resolutionDate) : null,
        estado: isActive,
      },
    });

    return newCompany;
  }
}
