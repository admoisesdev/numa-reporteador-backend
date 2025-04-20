import { HttpException, HttpStatus } from '@nestjs/common';
import { clientes as Customer } from '@prisma/client';

import { PrismaService } from 'src/common';

type CustomersParams = {
  active?: boolean;
};

interface GetCustomersUseCase {
  execute(params?: CustomersParams): Promise<Customer[]>;
}

export class GetCustomers implements GetCustomersUseCase {
  constructor(private prisma: PrismaService = new PrismaService()) {}

  public async execute(params?: CustomersParams): Promise<Customer[]> {
    const { active = false } = params;

    if (!active) {
      throw new HttpException(
        'Only active customers are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const activeCustomers = await this.prisma.clientes.findMany({
        where: {
          activo: active,
        },
      });

      if (!activeCustomers || activeCustomers.length === 0) {
        throw new HttpException(
          'No active customers found',
          HttpStatus.NOT_FOUND,
        );
      }

      return activeCustomers;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
