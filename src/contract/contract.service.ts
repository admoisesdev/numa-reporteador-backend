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
  constructor(
    private contractsByCustomer: GetContractsCustomer,
    private contractAccountStatus: GetContractAccountStatus,
    private chargedPortfolio: GetChargedPortfolio,
    private portfolioAge: GetPortfolioAge,
    private receivables: GetReceivables,
  ) {}

  async getContractsByCustomer(customerId: number): Promise<Contract[]> {
    return this.contractsByCustomer.execute({
      customerId,
    });
  }

  async getAccountStatus(contractId: string) {
    return this.contractAccountStatus.execute({ contractId });
  }

  async getChargedPortfolio(rangeStartDate: string, rangeEndDate: string) {
    return this.chargedPortfolio.execute({
      rangeStartDate,
      rangeEndDate,
    });
  }

  async getReceivables(expirationDate: string) {
    return this.receivables.execute({ expirationDate });
  }

  async getPortfolioAge(expirationDate: string) {
    return this.portfolioAge.execute({ expirationDate });
  }
}
