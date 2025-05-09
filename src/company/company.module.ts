import { Module } from '@nestjs/common';

import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CreateCompany, GetCompanies, GetCompaniesByUser } from './use-cases';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [CompanyController],
  providers: [CompanyService, GetCompanies, GetCompaniesByUser, CreateCompany],
})
export class CompanyModule {}
