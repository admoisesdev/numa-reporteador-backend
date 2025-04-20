import { Injectable } from '@nestjs/common';
import { contratos as Contract } from '@prisma/client';

import { GetContractAccountStatus, GetContractsCustomer } from './use-cases';

@Injectable()
export class ContractService {
  async getContractsByCustomer(customerId: number): Promise<Contract[]> {
    const contractsByCustomer = new GetContractsCustomer();

    return await contractsByCustomer.execute({
      customerId,
    });
  }

  async getAccountStatus(contractId: string) {
    const contractAccountStatus = new GetContractAccountStatus();

    return await contractAccountStatus.execute({ contractId });
  }
}
