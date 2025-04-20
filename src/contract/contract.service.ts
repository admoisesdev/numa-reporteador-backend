import { Injectable } from '@nestjs/common';
import { contratos as Contract } from '@prisma/client';

import {
  GetChargedPortfolio,
  GetContractAccountStatus,
  GetContractsCustomer,
  GetPortfolioAge,
  GetReceivables,
} from './use-cases';

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

  async getChargedPortfolio(rangeStartDate: string, rangeEndDate: string) {
    const chargedPortfolio = new GetChargedPortfolio();

    return await chargedPortfolio.execute({
      rangeStartDate,
      rangeEndDate,
    });
  }

  async getReceivables(expirationDate: string) {
    const receivables = new GetReceivables();
    return await receivables.execute({ expirationDate });
  }

  async getPortfolioAge(expirationDate: string) {
    const portfolioAge = new GetPortfolioAge();

    return await portfolioAge.execute({ expirationDate });
  }
}
