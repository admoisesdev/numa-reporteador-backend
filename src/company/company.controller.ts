import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { usuarios as User } from '@prisma/client';

import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto';

import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiBearerAuth('access-token')
@ApiTags('Empresas')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Auth(ValidRoles.ADMIN)
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get('companies/user')
  @Auth()
  findAllByUser(@GetUser() user: User) {
    return this.companyService.findAllByUser(user.id);
  }
}
