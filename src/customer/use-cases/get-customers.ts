import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
  private readonly logger = new Logger('GetCustomers');

  constructor(private prisma: PrismaService) {}

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  public async execute(params?: CustomersParams): Promise<Customer[]> {
    const { active = false } = params;

    try {
      const activeCustomers = await this.prisma.clientes.findMany({
        where: {
          activo: active,
        },
      });

      if (!activeCustomers || activeCustomers.length === 0) {
        throw new NotFoundException('No active customers found');
      }

      return activeCustomers;
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
