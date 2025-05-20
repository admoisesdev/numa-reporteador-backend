import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateContracts } from './use-cases/update-contracts';

@ApiTags('Clientes')
@Controller('scheduled')
export class TempController {
  constructor(private readonly updateContracts: UpdateContracts) {}

  
  @Get('updated-contracts')
  async startProcesses() {
      return this.updateContracts.execute();
  }
}
