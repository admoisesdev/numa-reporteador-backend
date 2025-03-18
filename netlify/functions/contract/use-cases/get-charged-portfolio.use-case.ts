import { HandlerResponse } from "@netlify/functions";

import { db } from "../../../data/db";
import { chargesTable, contractsTable, customersTable, financingTable } from "../../../data/schemas";

import { HEADERS } from "../../../config/constants";

import { sql } from "drizzle-orm";

type ChargedPortfolioParams = {
  rangeStartDate: string;
  rangeEndDate: string;
};

interface GetChargedPortfolioUseCase {
  execute(params?: ChargedPortfolioParams): Promise<HandlerResponse>;
}

export class GetChargedPortfolio implements GetChargedPortfolioUseCase {
  public async execute(
    params: ChargedPortfolioParams
  ): Promise<HandlerResponse> {
    const { rangeStartDate, rangeEndDate } = params;
    if (!rangeStartDate || !rangeEndDate) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required parameters 'startDate' and 'endDate'",
        }),
        headers: HEADERS.json,
      };
    }

    // Validar que sean fechas
    const startDate = new Date(rangeStartDate);
    const endDate = new Date(rangeEndDate);

    if (startDate.toString() === "Invalid Date") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid 'startDate' format",
        }),
        headers: HEADERS.json,
      };
    }

    if (endDate.toString() === "Invalid Date") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid 'endDate' format",
        }),
        headers: HEADERS.json,
      };
    }

    try {
      const chargedPortfolioContracts = await db.execute(sql`
        SELECT 
        c.id AS contrato,
        c.asesor_credito  AS oficial_credito,
        c.ubicacion AS ubicacion,
        l.nombre AS cliente,
        (SELECT MAX(fecha_vencimiento) FROM ${financingTable} WHERE id_contrato = c.id) AS fecha_entrega,
        COALESCE((SELECT valor_dividendos FROM ${financingTable} 
          WHERE  tipo_dividendo = 'Cuota Inicial' AND id_contrato = c.id), 0) AS cuota_inicial,
          
        COALESCE((SELECT SUM(case WHEN r.fecha_cobro <= DATE_ADD(f.fecha_vencimiento, '30 days') AND 
        r.fecha_cobro >= f.fecha_vencimiento THEN r.valor_cobrado ELSE 0 end) AS valor
          FROM ${chargesTable} AS r WHERE  r.id_contrato = c.id AND r.tipo_dividendo = 'Financiamiento Bancario' AND 
          r.num_dividendo = f.numero_dividendo), 0) AS vencida_menor_30_fb,

        COALESCE((SELECT SUM(case WHEN s.fecha_cobro >  DATE_ADD(f.fecha_vencimiento, '30 days') THEN s.valor_cobrado ELSE 0 end) AS valor
          FROM ${chargesTable} AS s WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Financiamiento Bancario' AND 
          s.num_dividendo = f.numero_dividendo), 0) AS vencida_mayor_30_fb,
          
        COALESCE((SELECT SUM(case WHEN s.fecha_cobro = f.fecha_vencimiento THEN s.valor_cobrado ELSE 0 end) AS valor
          FROM ${chargesTable} AS s WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Financiamiento Bancario' AND 
          s.num_dividendo = f.numero_dividendo), 0) AS al_tiemopo_fb,

        COALESCE((SELECT SUM(case WHEN t.fecha_cobro < f.fecha_vencimiento THEN t.valor_cobrado ELSE 0 end) AS valor
          FROM ${chargesTable} AS t WHERE  t.id_contrato = c.id AND t.tipo_dividendo = 'Financiamiento Bancario' AND 
          t.num_dividendo = f.numero_dividendo), 0) AS prepago_fb,

        COALESCE((SELECT SUM(case WHEN r.fecha_cobro <= DATE_ADD(f.fecha_vencimiento, '30 days') AND 
        r.fecha_cobro >= f.fecha_vencimiento THEN r.valor_cobrado ELSE 0 end) AS valor
          FROM ${chargesTable} AS r WHERE  r.id_contrato = c.id AND r.tipo_dividendo = 'Cuota de Entrada' AND 
          r.num_dividendo = f.numero_dividendo), 0) AS vencida_menor_30_ce,

        COALESCE((SELECT SUM(case WHEN s.fecha_cobro >  DATE_ADD(f.fecha_vencimiento, '30 days') THEN s.valor_cobrado ELSE 0 end) AS valor
          FROM ${chargesTable} AS s WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Cuota de Entrada' AND 
          s.num_dividendo = f.numero_dividendo), 0) AS vencida_mayor_30_ce,
          
        COALESCE((SELECT SUM(case WHEN s.fecha_cobro = f.fecha_vencimiento THEN s.valor_cobrado ELSE 0 end) AS valor
          FROM ${chargesTable} AS s WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Cuota de Entrada' AND 
          s.num_dividendo = f.numero_dividendo), 0) AS al_tiemopo_ce,

        COALESCE((SELECT SUM(case WHEN t.fecha_cobro < f.fecha_vencimiento THEN t.valor_cobrado ELSE 0 end) AS valor
          FROM ${chargesTable} AS t WHERE  t.id_contrato = c.id AND t.tipo_dividendo = 'Cuota de Entrada' AND 
          t.num_dividendo = f.numero_dividendo), 0) AS prepago_ce

          FROM ${contractsTable}  AS c
          JOIN ${financingTable} AS f ON  f.id_contrato = c.id 
          JOIN ${customersTable} AS l ON l.id = c.cliente_id
          WHERE f.estado_dividendo = 'Pagada' AND f.fecha_vencimiento BETWEEN ${rangeStartDate} AND ${rangeEndDate}

          GROUP by c.id, l.nombre, vencida_menor_30_fb, vencida_mayor_30_fb, al_tiemopo_fb, prepago_fb, vencida_menor_30_ce, 
                    vencida_mayor_30_ce, al_tiemopo_ce, prepago_ce
          ORDER by c.id ASC
      `);


      return {
        statusCode: 200,
        body: JSON.stringify(chargedPortfolioContracts.rows),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
