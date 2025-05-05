import { Module } from '@nestjs/common';

import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CreateCompany, GetCompaniesByUser } from './use-cases';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [CompanyController],
  providers: [CompanyService, GetCompaniesByUser, CreateCompany],
})
export class CompanyModule {}
