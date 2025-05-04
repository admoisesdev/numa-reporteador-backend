import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/common';

type ChargedPortfolioParams = {
  rangeStartDate: string;
  rangeEndDate: string;
};

interface GetChargedPortfolioUseCase {
  execute(params?: ChargedPortfolioParams);
}

@Injectable()
export class GetChargedPortfolio implements GetChargedPortfolioUseCase {
  private readonly logger = new Logger('GetChargedPortfolio');

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

  public async execute(params: ChargedPortfolioParams) {
    const { rangeStartDate, rangeEndDate } = params;
    if (!rangeStartDate || !rangeEndDate) {
      throw new BadRequestException(
        "Missing required parameters 'rangeStartDate' and 'rangeEndDate'",
      );
    }

    const startDate = new Date(rangeStartDate);
    const endDate = new Date(rangeEndDate);

    if (isNaN(startDate.getTime())) {
      throw new BadRequestException("Invalid 'rangeStartDate' format");
    }

    if (isNaN(endDate.getTime())) {
      throw new BadRequestException("Invalid 'rangeEndDate' format");
    }

    try {
      const chargedPortfolioContracts = await this.prisma.$queryRaw`
        SELECT 
        proyecto,
        contrato,
        oficial_credito,
        ubicacion,
        cliente,
        fecha_entrega,
        cuota_inicial,
        vencida_menor_30_fb,
        vencida_mayor_30_fb,
        al_tiemopo_fb,
        prepago_fb,
        (vencida_menor_30_fb + vencida_mayor_30_fb + al_tiemopo_fb + prepago_fb) AS total_cobradofb,
        vencida_menor_30_ce,
        vencida_mayor_30_ce,
        al_tiemopo_ce,
        prepago_ce,
        (vencida_menor_30_ce + vencida_mayor_30_ce + al_tiemopo_ce + prepago_ce) AS total_cobradoce,
        (vencida_menor_30_fb + vencida_mayor_30_fb + al_tiemopo_fb + prepago_fb + vencida_menor_30_ce 
        + vencida_mayor_30_ce + al_tiemopo_ce + prepago_ce) AS total

        FROM
        (
        SELECT 
        c.proyecto,
        c.id AS contrato,
        c.asesor_credito  AS oficial_credito,
        c.ubicacion AS ubicacion,
        (SELECT DISTINCT nombre FROM clientes  WHERE id = c.cliente_id) AS cliente,
        (SELECT max(fecha_vencimiento) FROM financiamiento WHERE id_contrato = c.id) AS fecha_entrega,
        
        COALESCE((SELECT sum(s.valor_cobrado) FROM financiamiento AS m
        INNER JOIN cobros AS s ON s.id_contrato = m.id_contrato
          WHERE  s.tipo_dividendo = 'Cuota Inicial' AND m.id_contrato = c.id AND (m.estado_dividendo = 'Pagada' OR m.estado_dividendo = 'Abonada')  AND
          s.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE), 0) AS cuota_inicial,

        COALESCE((SELECT sum(CASE WHEN n.fecha_vencimiento >= (DATE (r.fecha_cobro) - INTERVAL '1 month') AND  n.fecha_vencimiento < r.fecha_cobro THEN r.valor_cobrado ELSE 0 end) AS valor
        FROM cobros AS r INNER JOIN financiamiento AS n ON  n.id_contrato = r.id_contrato AND n.numero_dividendo = r.num_dividendo 
          WHERE  r.id_contrato = c.id AND r.tipo_dividendo = 'Financiamiento Bancario' AND 
          r.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE), 0) AS vencida_menor_30_fb,
          
        COALESCE((SELECT sum(CASE WHEN n.fecha_vencimiento <  (DATE (s.fecha_cobro) - INTERVAL '1 month') THEN s.valor_cobrado ELSE 0 end) AS valor
          FROM cobros AS s INNER JOIN financiamiento AS n ON  n.id_contrato = s.id_contrato AND n.numero_dividendo = s.num_dividendo AND n.tipo_dividendo = 'Financiamiento Bancario'
          WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Financiamiento Bancario' AND 
          s.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE), 0) AS vencida_mayor_30_fb,
          
          COALESCE((SELECT sum(CASE WHEN s.fecha_cobro = n.fecha_vencimiento THEN s.valor_cobrado ELSE 0 end) AS valor
          FROM cobros AS s INNER JOIN financiamiento AS n ON  n.id_contrato = s.id_contrato AND n.numero_dividendo = s.num_dividendo AND n.tipo_dividendo = 'Financiamiento Bancario'
          WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Financiamiento Bancario' AND 
          s.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE), 0) AS al_tiemopo_fb,

        COALESCE((SELECT sum(CASE WHEN t.fecha_cobro < n.fecha_vencimiento THEN t.valor_cobrado ELSE 0 end) AS valor
          FROM cobros AS t INNER JOIN financiamiento AS n on  n.id_contrato = t.id_contrato AND n.numero_dividendo = t.num_dividendo AND n.tipo_dividendo = 'Financiamiento Bancario'
          WHERE  t.id_contrato = c.id AND t.tipo_dividendo = 'Financiamiento Bancario' AND 
          t.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE), 0) AS prepago_fb,

        COALESCE((SELECT sum(CASE WHEN n.fecha_vencimiento >= (DATE (r.fecha_cobro) - INTERVAL '1 month') AND  n.fecha_vencimiento < r.fecha_cobro THEN r.valor_cobrado ELSE 0 end) AS valor
          FROM cobros AS r INNER JOIN financiamiento AS n ON  n.id_contrato = r.id_contrato AND n.numero_dividendo = r.num_dividendo  AND n.tipo_dividendo = 'Cuota de Entrada'
          WHERE  r.id_contrato = c.id AND r.tipo_dividendo = 'Cuota de Entrada' AND 
          r.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE), 0) AS vencida_menor_30_ce,

        COALESCE((SELECT sum(CASE WHEN n.fecha_vencimiento <  (DATE (s.fecha_cobro) - INTERVAL '1 month') THEN s.valor_cobrado ELSE 0 end) AS valor
          FROM cobros AS s INNER JOIN financiamiento AS n ON  n.id_contrato = s.id_contrato AND n.numero_dividendo = s.num_dividendo AND n.tipo_dividendo = 'Cuota de Entrada'
          WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Cuota de Entrada' AND 
          s.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE), 0) AS vencida_mayor_30_ce,
          
        COALESCE((SELECT sum(CASE WHEN s.fecha_cobro = n.fecha_vencimiento THEN s.valor_cobrado ELSE 0 end) AS valor
          FROM cobros AS s INNER JOIN financiamiento AS n ON  n.id_contrato = s.id_contrato AND n.numero_dividendo = s.num_dividendo AND n.tipo_dividendo = 'Cuota de Entrada'
          WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Cuota de Entrada' AND 
          s.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE), 0) AS al_tiemopo_ce,

        COALESCE((SELECT sum(CASE WHEN t.fecha_cobro < n.fecha_vencimiento THEN t.valor_cobrado ELSE 0 end) AS valor
          FROM cobros AS t INNER JOIN financiamiento AS n ON  n.id_contrato = t.id_contrato AND n.numero_dividendo = t.num_dividendo AND n.tipo_dividendo = 'Cuota de Entrada'
          WHERE  t.id_contrato = c.id AND t.tipo_dividendo = 'Cuota de Entrada' AND 
          t.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE), 0) AS prepago_ce
          
        
        FROM contratos AS c
        JOIN financiamiento AS f ON  f.id_contrato = c.id 
        JOIN cobros AS b ON b.id_contrato = c.id
        WHERE (f.estado_dividendo = 'Pagada' OR  f.estado_dividendo = 'Abonada') AND b.fecha_cobro BETWEEN ${rangeStartDate}::DATE AND ${rangeEndDate}::DATE
              AND c.proyecto = 'NUMA'
        group by c.id, vencida_menor_30_fb, vencida_mayor_30_fb, al_tiemopo_fb, prepago_fb, vencida_menor_30_ce, 
                  vencida_mayor_30_ce, al_tiemopo_ce, prepago_ce 
        order by c.id
        )
      `;

      return chargedPortfolioContracts;
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
