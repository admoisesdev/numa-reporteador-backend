import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { contratos as Contract } from '@prisma/client';

import { PrismaService } from 'src/common';

type ContractsCustomerParams = {
  customerId?: number;
};

interface GetContractsCustomerUseCase {
  execute(params?: ContractsCustomerParams): Promise<Contract[]>;
}

export class GetContractsCustomer implements GetContractsCustomerUseCase {
  private readonly logger = new Logger('GetContractsCustomer');

  constructor(private prisma: PrismaService = new PrismaService()) {}

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  public async execute(params?: ContractsCustomerParams): Promise<Contract[]> {
    const { customerId } = params;

    if (!customerId) {
      throw new BadRequestException('Customer ID is required');
    }

    try {
      const contractsByCustomer = await this.prisma.contratos.findMany({
        where: {
          cliente_id: customerId,
        },
      });

      if (!contractsByCustomer || contractsByCustomer.length === 0) {
        throw new NotFoundException(
          'No contracts found for the given customer',
        );
      }

      return contractsByCustomer;
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
