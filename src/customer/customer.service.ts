import { Injectable } from '@nestjs/common';
import { clientes as Customer } from '@prisma/client';

import { GetCustomers } from './use-cases';

@Injectable()
export class CustomerService {
  constructor(private customers: GetCustomers) {}

  async getCustomers(isActive: boolean): Promise<Customer[]> {
    return this.customers.execute({
      active: isActive,
    });
  }
}
