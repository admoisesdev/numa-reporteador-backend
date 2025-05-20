import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UpdateContracts } from './use-cases/update-contracts';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly updateContracts: UpdateContracts) {}

  // Esto se ejecutará cada día a la medianoche (00:00)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Running daily update contracts task');
    try {
      await this.updateContracts.execute();
      this.logger.debug('Update contracts finished');
    } catch (error) {
      this.logger.error('Error running update contracts', error);
    }
  }
}
