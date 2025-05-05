import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
  private readonly logger = new Logger('ContractService');

  constructor(
    private contractsByCustomer: GetContractsCustomer,
    private contractAccountStatus: GetContractAccountStatus,
    private chargedPortfolio: GetChargedPortfolio,
    private portfolioAge: GetPortfolioAge,
    private receivables: GetReceivables,
  ) {}

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async getContractsByCustomer(customerId: number): Promise<Contract[]> {
    try {
      const contracts = await this.contractsByCustomer.execute({
        customerId,
      });

      return contracts;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async getAccountStatus(contractId: string) {
    try {
      const accountStatus = await this.contractAccountStatus.execute({
        contractId,
      });
      return accountStatus;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async getChargedPortfolio(rangeStartDate: string, rangeEndDate: string) {
    try {
      const chargedPortfolio = await this.chargedPortfolio.execute({
        rangeStartDate,
        rangeEndDate,
      });

      return chargedPortfolio;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async getReceivables(expirationDate: string) {
    try {
      const receivables = await this.receivables.execute({ expirationDate });

      return receivables;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async getPortfolioAge(expirationDate: string) {
    try {
      const portfolioAge = await this.portfolioAge.execute({ expirationDate });

      return portfolioAge;
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
