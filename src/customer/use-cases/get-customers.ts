import { Injectable, NotFoundException } from '@nestjs/common';
import { clientes as Customer } from '@prisma/client';

import { PrismaService } from 'src/common';

type CustomersParams = {
  active?: boolean;
};

interface GetCustomersUseCase {
  execute(params?: CustomersParams): Promise<Customer[]>;
}

@Injectable()
export class GetCustomers implements GetCustomersUseCase {
  constructor(private prisma: PrismaService) {}

  public async execute(params?: CustomersParams): Promise<Customer[]> {
    const { active = false } = params;

    const activeCustomers = await this.prisma.clientes.findMany({
      where: {
        activo: active,
      },
    });

    if (!activeCustomers || activeCustomers.length === 0) {
      throw new NotFoundException('No active customers found');
    }

    return activeCustomers;
  }
}
