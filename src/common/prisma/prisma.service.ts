import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['warn', 'error', 'info'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma connected to database');
    } catch (error) {
      console.error('Prisma connection error', error);
      // Implementa reintentos si es necesario
      await this.handleConnectionError();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  private async handleConnectionError(attempt = 1): Promise<void> {
    const maxAttempts = 5;
    const delay = attempt * 1000; // Retry con backoff exponencial

    if (attempt >= maxAttempts) {
      throw new Error('Max connection attempts reached');
    }

    console.log(`Connection attempt ${attempt}, retrying in ${delay}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      await this.$connect();
      console.log('Reconnected successfully');
    } catch (error) {
      return this.handleConnectionError(attempt + 1);
    }
  }
}
