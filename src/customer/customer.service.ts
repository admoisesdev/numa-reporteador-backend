import { Injectable } from '@nestjs/common';
import { clientes as Customer } from '@prisma/client';

import { GetCustomers } from './use-cases';

@Injectable()
export class CustomerService {
  async getCustomers(isActive: boolean): Promise<Customer[]> {
    const customers = new GetCustomers();

    return await customers.execute({
      active: isActive,
    });
  }
}
