import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { empresas as Company } from '@prisma/client';

import { CreateCompany, GetCompaniesByUser } from './use-cases';
import { CreateCompanyDto } from './dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger('CompanyService');

  constructor(
    private companiesByUser: GetCompaniesByUser,
    private createCompany: CreateCompany,
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

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    console.log(createCompanyDto);
    try {
      const newCompany = await this.createCompany.execute(createCompanyDto);

      return newCompany;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAllByUser(userId: string): Promise<Company[]> {
    try {
      const companiesByUser = await this.companiesByUser.execute({ userId });

      return companiesByUser;
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
