import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ContractService } from './contract.service';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  getContractsByCustomer(
    @Query('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.contractService.getContractsByCustomer(customerId);
  }

  @Get('/account-status')
  async getContractAccountStatus(@Query('contractId') contractId: string) {
    return await this.contractService.getAccountStatus(contractId);
  }

  @Get('/charged-portfolio')
  async getChargedPortfolio(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.contractService.getChargedPortfolio(startDate, endDate);
  }
}
