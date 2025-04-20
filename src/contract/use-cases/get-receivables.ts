import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/common';

type ReceivablesParams = {
  expirationDate: string;
};

interface GetReceivablesUseCase {
  execute(params?: ReceivablesParams);
}

export class GetReceivables implements GetReceivablesUseCase {
  private readonly logger = new Logger('GetReceivables');

  constructor(private readonly prisma: PrismaService = new PrismaService()) {}

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  public async execute(params: ReceivablesParams) {
    const { expirationDate: expirationDateParam } = params;
    if (!expirationDateParam) {
      throw new BadRequestException(
        "Missing required parameter 'expirationDate'",
      );
    }

    const expirationDate = new Date(expirationDateParam);

    if (isNaN(expirationDate.getTime())) {
      throw new BadRequestException("Invalid 'expirationDate' format");
    }

    try {
      const receivablesContracts = await this.prisma.$queryRaw`
        SELECT 
        c.empresa,
        c.proyecto,
        c.asesor_credito AS oficial_credito,
        l.nombre AS cliente,
        l.telefono,
        l.email,
        c.cliente_vendedor AS oficial_cuenta,
        c.id AS contrato,
        c.precio_lista AS precio_venta,
        c.ubicacion AS ubicacion,
          CASE 
            WHEN f.tipo_dividendo = 'Cuota Inicial' THEN 'CI'
            WHEN f.tipo_dividendo = 'Financiamiento Bancario' THEN 'FB'
              ELSE  'CE' END AS tipo_documento,
        f.tipo_dividendo AS descripcion,
        f.fecha_vencimiento,
        f.numero_dividendo||' de ' ||f.total_dividendo cuota,
        f.valor_dividendos AS imp_pendiente,
        f.valor_dividendos AS imp_bruto

        FROM contratos AS c
        JOIN financiamiento AS f ON  f.id_contrato = c.id 
        JOIN clientes AS l ON l.id = c.cliente_id
        WHERE f.estado_dividendo = 'Vigente' AND  f.fecha_vencimiento <= ${expirationDate}
        ORDER by contrato, f.fecha_vencimiento
      `;

      return receivablesContracts;
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
