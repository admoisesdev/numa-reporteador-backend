import { HandlerResponse } from "@netlify/functions";

import { db } from "../../../data/db";
import {
  chargesTable,
  contractsTable,
  customersTable,
  financingTable,
} from "../../../data/schemas";

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
        (vencida_menor_30_fb + vencida_mayor_30_fb + al_tiemopo_fb + prepago_fb) as total_cobradofb,
        vencida_menor_30_ce,
        vencida_mayor_30_ce,
        al_tiemopo_ce,
        prepago_ce,
        (vencida_menor_30_ce + vencida_mayor_30_ce + al_tiemopo_ce + prepago_ce) as total_cobradoce,
        (vencida_menor_30_fb + vencida_mayor_30_fb + al_tiemopo_fb + prepago_fb + vencida_menor_30_ce 
        + vencida_mayor_30_ce + al_tiemopo_ce + prepago_ce) as total


        FROM
        (select 
        c.proyecto,
        c.id as contrato,
        c.asesor_credito  as oficial_credito,
        c.ubicacion as ubicacion,
        l.nombre as cliente,
        (select max(fecha_vencimiento) FROM ${financingTable} WHERE id_contrato = c.id) as fecha_entrega,
        COALESCE((select valor_dividendos FROM ${financingTable} 
          WHERE  tipo_dividendo = 'Cuota Inicial' AND id_contrato = c.id AND estado_dividendo = 'Pagada'), 0) as cuota_inicial,
          
        COALESCE((select sum(case WHEN r.fecha_cobro <= date_add(f.fecha_vencimiento, '30 days') AND 
          r.fecha_cobro >= f.fecha_vencimiento THEN r.valor_cobrado ELSE 0 end) as valor
          FROM ${chargesTable} as r WHERE  r.id_contrato = c.id AND r.tipo_dividendo = 'Financiamiento Bancario' AND 
          r.num_dividendo = f.numero_dividendo), 0) as vencida_menor_30_fb,

        COALESCE((select sum(case WHEN s.fecha_cobro >  date_add(f.fecha_vencimiento, '30 days') THEN s.valor_cobrado ELSE 0 end) as valor
          FROM ${chargesTable} as s WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Financiamiento Bancario' AND 
          s.num_dividendo = f.numero_dividendo), 0) as vencida_mayor_30_fb,
          
        COALESCE((select sum(case WHEN s.fecha_cobro = f.fecha_vencimiento THEN s.valor_cobrado ELSE 0 end) as valor
          FROM ${chargesTable} as s WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Financiamiento Bancario' AND 
          s.num_dividendo = f.numero_dividendo), 0) as al_tiemopo_fb,

        COALESCE((select sum(case WHEN t.fecha_cobro < f.fecha_vencimiento THEN t.valor_cobrado ELSE 0 end) as valor
          FROM ${chargesTable} as t WHERE  t.id_contrato = c.id AND t.tipo_dividendo = 'Financiamiento Bancario' AND 
          t.num_dividendo = f.numero_dividendo), 0) as prepago_fb,

        COALESCE((select sum(case WHEN r.fecha_cobro <= date_add(f.fecha_vencimiento, '30 days') AND 
        r.fecha_cobro >= f.fecha_vencimiento THEN r.valor_cobrado ELSE 0 end) as valor
          FROM ${chargesTable} as r WHERE  r.id_contrato = c.id AND r.tipo_dividendo = 'Cuota de Entrada' AND 
          r.num_dividendo = f.numero_dividendo), 0) as vencida_menor_30_ce,

        COALESCE((select sum(case WHEN s.fecha_cobro >  date_add(f.fecha_vencimiento, '30 days') THEN s.valor_cobrado ELSE 0 end) as valor
          FROM ${chargesTable} as s WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Cuota de Entrada' AND 
          s.num_dividendo = f.numero_dividendo), 0) as vencida_mayor_30_ce,
          
        COALESCE((select sum(case WHEN s.fecha_cobro = f.fecha_vencimiento THEN s.valor_cobrado ELSE 0 end) as valor
          FROM ${chargesTable} as s WHERE  s.id_contrato = c.id AND s.tipo_dividendo = 'Cuota de Entrada' AND 
          s.num_dividendo = f.numero_dividendo), 0) as al_tiemopo_ce,

        COALESCE((select sum(case WHEN t.fecha_cobro < f.fecha_vencimiento THEN t.valor_cobrado ELSE 0 end) as valor
          FROM ${chargesTable} as t WHERE  t.id_contrato = c.id AND t.tipo_dividendo = 'Cuota de Entrada' AND 
          t.num_dividendo = f.numero_dividendo), 0) as prepago_ce

        FROM ${contractsTable}  as c
        JOIN ${financingTable} as f ON  f.id_contrato = c.id 
        JOIN ${customersTable} as l ON l.id = c.cliente_id
        WHERE f.estado_dividendo = 'Pagada' AND f.fecha_vencimiento BETWEEN ${rangeStartDate} AND ${rangeEndDate}
              AND c.proyecto = 'NUMA'
        GROUP BY c.id, l.nombre, vencida_menor_30_fb, vencida_mayor_30_fb, al_tiemopo_fb, prepago_fb, vencida_menor_30_ce, 
                  vencida_mayor_30_ce, al_tiemopo_ce, prepago_ce
        ORDER BY c.id)
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
