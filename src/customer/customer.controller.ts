import { Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CustomerService } from './customer.service';

@ApiTags('Clientes')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  getCustomers(@Query('active', ParseBoolPipe) active: boolean) {
    return this.customerService.getCustomers(active);
  }
}
