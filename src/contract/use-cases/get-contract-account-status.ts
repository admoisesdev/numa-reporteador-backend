import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/common';
import { financiamiento as Financing } from '@prisma/client';

import { isAfter, isBefore, isEqual } from 'date-fns';

type ContractAccountStatusParams = {
  contractId?: string;
};

interface GetContractAccountStatusUseCase {
  execute(params?: ContractAccountStatusParams);
}

@Injectable()
export class GetContractAccountStatus
  implements GetContractAccountStatusUseCase
{
  private readonly logger = new Logger('GetContractAccountStatus');

  constructor(private readonly prisma: PrismaService) {}

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  private totalFinancingDividends = (sum: number, fin: Financing) => {
    return sum + Number(fin.valor_dividendos || 0);
  };

  public async execute(params?: ContractAccountStatusParams) {
    const { contractId } = params;

    if (!contractId) {
      throw new BadRequestException('Contract ID is required');
    }

    try {
      const [contract, financing, charges] = await Promise.all([
        this.prisma.contratos.findUnique({
          where: { id: contractId },
        }),
        this.prisma.financiamiento.findMany({
          where: {
            id_contrato: contractId,
            estado: 'Vigente',
          },
          orderBy: [{ numero_dividendo: 'asc' }, { fecha_vencimiento: 'asc' }],
        }),
        this.prisma.cobros.findMany({
          where: { id_contrato: contractId },
          orderBy: [{ num_dividendo: 'asc' }, { fecha_cobro: 'asc' }],
        }),
      ]);

      if (!contract) {
        throw new NotFoundException('Contract not found');
      }

      const now = new Date();

      const financingWithoutCharges = financing.filter(
        (fin) =>
          !charges.some(
            (charge) =>
              charge.cabecera_id === fin.cabecera_id &&
              charge.num_dividendo === fin.numero_dividendo &&
              charge.tipo_dividendo === fin.tipo_dividendo,
          ),
      );

      const financingWithCharges = financing.filter((fin) =>
        charges.some(
          (charge) =>
            charge.cabecera_id === fin.cabecera_id &&
            charge.num_dividendo === fin.numero_dividendo &&
            charge.tipo_dividendo === fin.tipo_dividendo,
        ),
      );

      const valueToBeat = financingWithoutCharges
        .filter(
          (fin) =>
            isAfter(new Date(fin.fecha_vencimiento), now) ||
            isEqual(new Date(fin.fecha_vencimiento), now),
        )
        .reduce(this.totalFinancingDividends, 0);

      const percentageCharged =
        (financingWithCharges.reduce(this.totalFinancingDividends, 0) /
          Number(contract.precioventa)) *
        100;

      const expiredDocumentsValue = financingWithoutCharges
        .filter((fin) => isBefore(new Date(fin.fecha_vencimiento), now))
        .reduce(this.totalFinancingDividends, 0);

      const totalExpired =
        expiredDocumentsValue +
        financing.reduce((sum, fin) => sum + Number(fin.valor_mora || 0), 0);

      const totalCancelDiscount = charges.reduce(
        (sum, charge) => sum + Number(charge.valor_cobrado || 0),
        0,
      );

      const netValueCancel =
        totalCancelDiscount +
        financing.reduce((sum, fin) => sum + Number(fin.valor_mora || 0), 0);

      const totalValueChargedCustomer = financing
        .filter((fin) => fin.estado_dividendo === 'Vigente')
        .reduce(this.totalFinancingDividends, 0);

      const financingCharges = financing.map((fin) => {
        const reserveValue = Number(contract.valor_reserva);

        const relatedCharges = charges.filter((charge) => {
          return (
            charge.cabecera_id === fin.cabecera_id &&
            charge.num_dividendo === fin.numero_dividendo &&
            charge.tipo_dividendo === fin.tipo_dividendo
          );
        });

        const totalChardedValue = relatedCharges.reduce(
          (sum, charge) => sum + Number(charge.valor_cobrado || 0),
          0,
        );

        const initialDividendBalanceValue = reserveValue - totalChardedValue;
        const dividendBalanceValue =
          Number(fin.valor_dividendos) - totalChardedValue;

        return {
          ...fin,
          charges: relatedCharges,
          valor_saldo_div:
            fin.tipo_dividendo === 'Cuota Inicial'
              ? String(initialDividendBalanceValue)
              : String(dividendBalanceValue),
        };
      });

      const accountStatusContract = {
        contract: {
          ...contract,
          valor_entrada: String(
            Number(contract.valor_reserva) + Number(contract.saldo_ce),
          ),
          valor_por_vencer: String(valueToBeat),
          porcentaje_cobrado: String(percentageCharged),
          valor_documentos_vencidos: String(expiredDocumentsValue),
          valor_total_vencido: String(totalExpired),
          valor_total_descuento: String(totalCancelDiscount),
          valor_neto_cancel: String(netValueCancel),
          valor_total_cob_client: String(totalValueChargedCustomer),
        },
        financing: financingCharges,
      };

      return accountStatusContract;
    } catch (error: any) {
      this.handleExceptions(error);
    }
  }
}
