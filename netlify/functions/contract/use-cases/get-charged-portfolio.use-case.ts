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
        from
        (
        select 
        c.proyecto,
        c.id as contrato,
        c.asesor_credito  as oficial_credito,
        c.ubicacion as ubicacion,
        (select distinct nombre from ${customersTable}  where id = c.cliente_id) as cliente,
        (select max(fecha_vencimiento) from ${financingTable} where id_contrato = c.id) as fecha_entrega,

        COALESCE((select sum(s.valor_cobrado) from ${financingTable} as m
        inner join cobros as s on s.id_contrato = m.id_contrato
          where  s.tipo_dividendo = 'Cuota Inicial' and m.id_contrato = c.id and (m.estado_dividendo = 'Pagada' or m.estado_dividendo = 'Abonada')  and
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as cuota_inicial,

        COALESCE((select sum(case when r.fecha_cobro <= date_add(n.fecha_vencimiento, '30 days') and 
          r.fecha_cobro >= n.fecha_vencimiento then r.valor_cobrado else 0 end) as valor  from ${chargesTable} as r 
          inner join ${financingTable} as n on  n.id_contrato = r.id_contrato and n.numero_dividendo = r.num_dividendo
          where  r.id_contrato = c.id and r.tipo_dividendo = 'Financiamiento Bancario' and 
          r.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as vencida_menor_30_fb,
          
        COALESCE((select sum(case when s.fecha_cobro >  date_add(n.fecha_vencimiento, '30 days') then s.valor_cobrado else 0 end) 
          as valor  from ${chargesTable} as s inner join ${financingTable} as n on  n.id_contrato = s.id_contrato and n.numero_dividendo = s.num_dividendo and n.tipo_dividendo = 'Financiamiento Bancario'
          where  s.id_contrato = c.id and s.tipo_dividendo = 'Financiamiento Bancario' and 
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as vencida_mayor_30_fb,
          
          COALESCE((select sum(case when s.fecha_cobro = n.fecha_vencimiento then s.valor_cobrado else 0 end) as valor
          from ${chargesTable} as s inner join ${financingTable} as n on  n.id_contrato = s.id_contrato and n.numero_dividendo = s.num_dividendo and n.tipo_dividendo = 'Financiamiento Bancario'
          where  s.id_contrato = c.id and s.tipo_dividendo = 'Financiamiento Bancario' and 
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as al_tiemopo_fb,

        COALESCE((select sum(case when t.fecha_cobro < n.fecha_vencimiento then t.valor_cobrado else 0 end) as valor
          from ${chargesTable} as t inner join ${financingTable} as n on  n.id_contrato = t.id_contrato and n.numero_dividendo = t.num_dividendo and n.tipo_dividendo = 'Financiamiento Bancario'
          where  t.id_contrato = c.id and t.tipo_dividendo = 'Financiamiento Bancario' and 
          t.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as prepago_fb,

        COALESCE((select sum(case when r.fecha_cobro <= date_add(n.fecha_vencimiento, '30 days') and 
        r.fecha_cobro >= n.fecha_vencimiento then r.valor_cobrado else 0 end) as valor
          from ${chargesTable} as r inner join ${financingTable} as n on  n.id_contrato = r.id_contrato and n.numero_dividendo = r.num_dividendo
          where  r.id_contrato = c.id and r.tipo_dividendo = 'Cuota de Entrada' and 
          r.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as vencida_menor_30_ce,

        COALESCE((select sum(case when s.fecha_cobro >  date_add(n.fecha_vencimiento, '30 days') then s.valor_cobrado else 0 end) as valor
          from ${chargesTable} as s inner join ${financingTable} as n on  n.id_contrato = s.id_contrato and n.numero_dividendo = s.num_dividendo and n.tipo_dividendo = 'Cuota de Entrada'
          where  s.id_contrato = c.id and s.tipo_dividendo = 'Cuota de Entrada' and 
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as vencida_mayor_30_ce,
          
        COALESCE((select sum(case when s.fecha_cobro = n.fecha_vencimiento then s.valor_cobrado else 0 end) as valor
          from ${chargesTable} as s inner join ${financingTable} as n on  n.id_contrato = s.id_contrato and n.numero_dividendo = s.num_dividendo and n.tipo_dividendo = 'Cuota de Entrada'
          where  s.id_contrato = c.id and s.tipo_dividendo = 'Cuota de Entrada' and 
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as al_tiemopo_ce,

        COALESCE((select sum(case when t.fecha_cobro < n.fecha_vencimiento then t.valor_cobrado else 0 end) as valor
          from ${chargesTable} as t inner join ${financingTable} as n on  n.id_contrato = t.id_contrato and n.numero_dividendo = t.num_dividendo and n.tipo_dividendo = 'Cuota de Entrada'
          where  t.id_contrato = c.id and t.tipo_dividendo = 'Cuota de Entrada' and 
          t.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as prepago_ce
          
          
        from ${contractsTable}  as c
        join ${financingTable} as f on  f.id_contrato = c.id 
        join ${chargesTable} as b on b.id_contrato = c.id
        where f.estado_dividendo = 'Pagada' and b.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}
              and c.proyecto = 'NUMA'
        group by c.id, vencida_menor_30_fb, vencida_mayor_30_fb, al_tiemopo_fb, prepago_fb, vencida_menor_30_ce, 
                  vencida_mayor_30_ce, al_tiemopo_ce, prepago_ce 
        order by c.id
        )
      `);
      console.log(`
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
        from
        (
        select 
        c.proyecto,
        c.id as contrato,
        c.asesor_credito  as oficial_credito,
        c.ubicacion as ubicacion,
        (select distinct nombre from ${customersTable}  where id = c.cliente_id) as cliente,
        (select max(fecha_vencimiento) from ${financingTable} where id_contrato = c.id) as fecha_entrega,

        COALESCE((select sum(s.valor_cobrado) from ${financingTable} as m
        inner join ${chargesTable} as s on s.id_contrato = m.id_contrato
          where  s.tipo_dividendo = 'Cuota Inicial' and m.id_contrato = c.id and (m.estado_dividendo = 'Pagada' or m.estado_dividendo = 'Abonada')  and
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as cuota_inicial,

        COALESCE((select sum(case when r.fecha_cobro <= date_add(n.fecha_vencimiento, '30 days') and 
          r.fecha_cobro >= n.fecha_vencimiento then r.valor_cobrado else 0 end) as valor  from ${chargesTable} as r 
          inner join ${financingTable} as n on  n.id_contrato = r.id_contrato and n.numero_dividendo = r.num_dividendo
          where  r.id_contrato = c.id and r.tipo_dividendo = 'Financiamiento Bancario' and 
          r.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as vencida_menor_30_fb,
          
        COALESCE((select sum(case when s.fecha_cobro >  date_add(n.fecha_vencimiento, '30 days') then s.valor_cobrado else 0 end) 
          as valor  from ${chargesTable} as s inner join ${financingTable} as n on  n.id_contrato = s.id_contrato and n.numero_dividendo = s.num_dividendo and n.tipo_dividendo = 'Financiamiento Bancario'
          where  s.id_contrato = c.id and s.tipo_dividendo = 'Financiamiento Bancario' and 
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as vencida_mayor_30_fb,
          
          COALESCE((select sum(case when s.fecha_cobro = n.fecha_vencimiento then s.valor_cobrado else 0 end) as valor
          from ${chargesTable} as s inner join ${financingTable} as n on  n.id_contrato = s.id_contrato and n.numero_dividendo = s.num_dividendo and n.tipo_dividendo = 'Financiamiento Bancario'
          where  s.id_contrato = c.id and s.tipo_dividendo = 'Financiamiento Bancario' and 
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as al_tiemopo_fb,

        COALESCE((select sum(case when t.fecha_cobro < n.fecha_vencimiento then t.valor_cobrado else 0 end) as valor
          from ${chargesTable} as t inner join ${financingTable} as n on  n.id_contrato = t.id_contrato and n.numero_dividendo = t.num_dividendo and n.tipo_dividendo = 'Financiamiento Bancario'
          where  t.id_contrato = c.id and t.tipo_dividendo = 'Financiamiento Bancario' and 
          t.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as prepago_fb,

        COALESCE((select sum(case when r.fecha_cobro <= date_add(n.fecha_vencimiento, '30 days') and 
        r.fecha_cobro >= n.fecha_vencimiento then r.valor_cobrado else 0 end) as valor
          from ${chargesTable} as r inner join ${financingTable} as n on  n.id_contrato = r.id_contrato and n.numero_dividendo = r.num_dividendo
          where  r.id_contrato = c.id and r.tipo_dividendo = 'Cuota de Entrada' and 
          r.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as vencida_menor_30_ce,

        COALESCE((select sum(case when s.fecha_cobro >  date_add(n.fecha_vencimiento, '30 days') then s.valor_cobrado else 0 end) as valor
          from ${chargesTable} as s inner join ${financingTable} as n on  n.id_contrato = s.id_contrato and n.numero_dividendo = s.num_dividendo and n.tipo_dividendo = 'Cuota de Entrada'
          where  s.id_contrato = c.id and s.tipo_dividendo = 'Cuota de Entrada' and 
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as vencida_mayor_30_ce,
          
        COALESCE((select sum(case when s.fecha_cobro = n.fecha_vencimiento then s.valor_cobrado else 0 end) as valor
          from ${chargesTable} as s inner join ${financingTable} as n on  n.id_contrato = s.id_contrato and n.numero_dividendo = s.num_dividendo and n.tipo_dividendo = 'Cuota de Entrada'
          where  s.id_contrato = c.id and s.tipo_dividendo = 'Cuota de Entrada' and 
          s.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as al_tiemopo_ce,

        COALESCE((select sum(case when t.fecha_cobro < n.fecha_vencimiento then t.valor_cobrado else 0 end) as valor
          from ${chargesTable} as t inner join ${financingTable} as n on  n.id_contrato = t.id_contrato and n.numero_dividendo = t.num_dividendo and n.tipo_dividendo = 'Cuota de Entrada'
          where  t.id_contrato = c.id and t.tipo_dividendo = 'Cuota de Entrada' and 
          t.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}), 0) as prepago_ce
          
          
        from ${contractsTable}  as c
        join ${financingTable} as f on  f.id_contrato = c.id 
        join ${chargesTable} as b on b.id_contrato = c.id
        where f.estado_dividendo = 'Pagada' and b.fecha_cobro BETWEEN ${rangeStartDate} AND ${rangeEndDate}
              and c.proyecto = 'NUMA'
        group by c.id, vencida_menor_30_fb, vencida_mayor_30_fb, al_tiemopo_fb, prepago_fb, vencida_menor_30_ce, 
                  vencida_mayor_30_ce, al_tiemopo_ce, prepago_ce 
        order by c.id
        )
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
