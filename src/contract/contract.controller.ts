import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ContractService } from './contract.service';
import { Auth } from 'src/auth/decorators';

@ApiBearerAuth('access-token')
@ApiTags('Contratos')
@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  @Auth()
  getContractsByCustomer(
    @Query('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.contractService.getContractsByCustomer(customerId);
  }

  @Get('/account-status')
  @Auth()
  async getContractAccountStatus(@Query('contractId') contractId: string) {
    return await this.contractService.getAccountStatus(contractId);
  }

  @Get('/charged-portfolio')
  @Auth()
  async getChargedPortfolio(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.contractService.getChargedPortfolio(startDate, endDate);
  }

  @Get('/receivables')
  @Auth()
  async getReceivables(@Query('expirationDate') expirationDate: string) {
    return await this.contractService.getReceivables(expirationDate);
  }

  @Get('/portfolio-age')
  @Auth()
  async getPortfolioAge(@Query('expirationDate') expirationDate: string) {
    return await this.contractService.getPortfolioAge(expirationDate);
  }
}
