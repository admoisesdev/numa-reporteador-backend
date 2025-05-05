import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { empresas as Company } from '@prisma/client';

import { PrismaService } from 'src/common';

type CompaniesByUserParams = {
  userId: string;
};

interface GetCompaniesByUserUseCase {
  execute(params?: CompaniesByUserParams): Promise<Company[]>;
}

@Injectable()
export class GetCompaniesByUser implements GetCompaniesByUserUseCase {
  constructor(private prisma: PrismaService) {}

  public async execute(params?: CompaniesByUserParams): Promise<Company[]> {
    const { userId } = params;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const companiesByUser = await this.prisma.empresas.findMany({
      where: {
        usuario_empresa: {
          some: {
            usuario_id: userId,
          },
        },
      },
    });

    if (!companiesByUser || companiesByUser.length === 0) {
      throw new NotFoundException('No companies found for this user');
    }

    return companiesByUser;
  }
}
