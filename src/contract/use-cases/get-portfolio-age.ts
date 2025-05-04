import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/common';

type PortfolioAgeParams = {
  expirationDate: string;
};

interface GetPortfolioAgeUseCase {
  execute(params?: PortfolioAgeParams);
}

@Injectable()
export class GetPortfolioAge implements GetPortfolioAgeUseCase {
  private readonly logger = new Logger('GetPortfolioAge');

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

  public async execute(params: PortfolioAgeParams) {
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
      const portfolioAgeContracts = await this.prisma.$queryRaw`
        SELECT
        proyecto,
        contrato,
        ubicacion,
        estado_construccion,
        por_avance,
        cliente,
        fecha_venta,
        fecha_entrega,
        precioventa,
        total_cobrado,
        ((total_cobrado / precioventa) * 100) AS por_cobrado,
        Saldo_entrada,
        h_tramite,
        f_directo,
        de_0_30,
        de_30_60,
        de_60_90,
        mayor_90,
        (de_0_30 + de_30_60 + de_60_90 + mayor_90) AS total
        FROM (
        SELECT 
        c.proyecto,
        c.id AS contrato,
        c.ubicacion AS ubicacion,
        '' AS estado_construccion,
        '' AS por_avance,
        l.nombre AS cliente,
        c.fecha_creacion AS fecha_venta,
        (SELECT MAX(fecha_vencimiento) FROM financiamiento WHERE id_contrato = c.id) AS fecha_entrega,
        c.precioventa,
        COALESCE((SELECT SUM(valor_dividendos) FROM financiamiento WHERE id_contrato = c.id AND estado_dividendo = 'Pagada'), 0) AS total_cobrado,
        
        COALESCE((SELECT SUM(valor_dividendos) FROM financiamiento WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada'), 0) AS Saldo_entrada,

        COALESCE((SELECT SUM(valor_dividendos) FROM financiamiento WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Financiamiento Bancario' AND fecha_vencimiento <= ${expirationDate}), 0) AS h_tramite,

        COALESCE((SELECT SUM(valor_dividendos) FROM financiamiento WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Financiamiento Directo' AND fecha_vencimiento <= ${expirationDate}), 0) AS f_directo,

        COALESCE((SELECT SUM(valor_dividendos) FROM financiamiento WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada' AND fecha_vencimiento >= (CAST(${expirationDate} AS DATE)- INTERVAL '1 month') 
        AND fecha_vencimiento <= ${expirationDate}), 0) AS de_0_30,

        COALESCE((SELECT SUM(valor_dividendos) FROM financiamiento WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada' AND fecha_vencimiento >= (CAST(${expirationDate} AS DATE)- INTERVAL '2 month') 
        AND fecha_vencimiento <=  (CAST(${expirationDate} AS DATE)- INTERVAL '1 month')), 0) AS de_30_60,

        COALESCE((SELECT SUM(valor_dividendos) FROM financiamiento WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada' AND fecha_vencimiento >= (CAST(${expirationDate} AS DATE)- INTERVAL '3 month') 
        AND fecha_vencimiento <=  (CAST(${expirationDate} AS DATE)- INTERVAL '2 month')), 0) AS de_60_90,
        
        COALESCE((SELECT SUM(valor_dividendos) FROM financiamiento WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada' AND fecha_vencimiento <= (CAST(${expirationDate} AS DATE)- INTERVAL '3 month')), 0) AS mayor_90


        FROM contratos AS c
        JOIN financiamiento AS f ON  f.id_contrato = c.id 
        JOIN clientes AS l ON l.id = c.cliente_id
        WHERE f.estado_dividendo = 'Vigente' AND  f.fecha_vencimiento <= ${expirationDate}
        GROUP BY c.proyecto, c.id, c.ubicacion, l.nombre
        ORDER BY contrato
        )
      `;

      return portfolioAgeContracts;
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
