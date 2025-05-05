import { Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CustomerService } from './customer.service';
import { Auth } from 'src/auth/decorators';

@ApiBearerAuth('access-token')
@ApiTags('Clientes')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @Auth()
  getCustomers(@Query('active', ParseBoolPipe) active: boolean) {
    return this.customerService.getCustomers(active);
  }
}
