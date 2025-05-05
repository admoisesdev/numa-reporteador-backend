import {
  BadRequestException,
  Injectable,
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

@Injectable()
export class GetContractsCustomer implements GetContractsCustomerUseCase {
  constructor(private prisma: PrismaService) {}

  public async execute(params?: ContractsCustomerParams): Promise<Contract[]> {
    const { customerId } = params;

    if (!customerId) {
      throw new BadRequestException('Customer ID is required');
    }

    const contractsByCustomer = await this.prisma.contratos.findMany({
      where: {
        cliente_id: customerId,
      },
    });

    if (!contractsByCustomer || contractsByCustomer.length === 0) {
      throw new NotFoundException('No contracts found for the given customer');
    }

    return contractsByCustomer;
  }
}
