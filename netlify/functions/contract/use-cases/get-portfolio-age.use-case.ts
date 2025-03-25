import { HandlerResponse } from "@netlify/functions";

import { db } from "../../../data/db";
import {
  contractsTable,
  customersTable,
  financingTable,
} from "../../../data/schemas";

import { HEADERS } from "../../../config/constants";

import { sql } from "drizzle-orm";

type PortfolioAgeParams = {
  expirationDate: string;
};

interface GetPortfolioAgeUseCase {
  execute(params?: PortfolioAgeParams): Promise<HandlerResponse>;
}

export class GetPortfolioAge implements GetPortfolioAgeUseCase {
  public async execute(
    params: PortfolioAgeParams
  ): Promise<HandlerResponse> {
    const { expirationDate: expirationDateParam } = params;
    if (!expirationDateParam) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required parameters 'startDate' and 'endDate'",
        }),
        headers: HEADERS.json,
      };
    }

    const expirationDate = new Date(expirationDateParam);

    if (expirationDate.toString() === "Invalid Date") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid 'expirationDate' format",
        }),
        headers: HEADERS.json,
      };
    }

    try {
      const portfolioAgeContracts = await db.execute(sql`
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
        (SELECT MAX(fecha_vencimiento) FROM ${financingTable} WHERE id_contrato = c.id) AS fecha_entrega,
        c.precioventa,
        COALESCE((SELECT SUM(valor_dividendos) FROM ${financingTable} WHERE id_contrato = c.id AND estado_dividendo = 'Pagada'), 0) AS total_cobrado,
        COALESCE((SELECT SUM(valor_dividendos) FROM ${financingTable} WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada' AND fecha_vencimiento <= ${expirationDate}), 0) AS Saldo_entrada,
        COALESCE((SELECT SUM(valor_dividendos) FROM ${financingTable} WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Financiamiento Bancario' AND fecha_vencimiento <= ${expirationDate}), 0) AS h_tramite,
        COALESCE((SELECT SUM(valor_dividendos) FROM ${financingTable} WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Financiamiento Directo' AND fecha_vencimiento <= ${expirationDate}), 0) AS f_directo,

        COALESCE((SELECT SUM(valor_dividendos) FROM ${financingTable} WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada' AND fecha_vencimiento >= (CAST(${expirationDate} AS DATE)- INTERVAL '1 month') 
        AND fecha_vencimiento <= ${expirationDate}), 0) AS de_0_30,

        COALESCE((SELECT SUM(valor_dividendos) FROM ${financingTable} WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada' AND fecha_vencimiento >= (CAST(${expirationDate} AS DATE)- INTERVAL '2 month') 
        AND fecha_vencimiento <=  (CAST(${expirationDate} AS DATE)- INTERVAL '1 month')), 0) AS de_30_60,

        COALESCE((SELECT SUM(valor_dividendos) FROM ${financingTable} WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada' AND fecha_vencimiento >= (CAST(${expirationDate} AS DATE)- INTERVAL '3 month') 
        AND fecha_vencimiento <=  (CAST(${expirationDate} AS DATE)- INTERVAL '2 month')), 0) AS de_60_90,
        
        COALESCE((SELECT SUM(valor_dividendos) FROM ${financingTable} WHERE id_contrato = c.id  AND estado_dividendo = 'Vigente' AND
          tipo_dividendo = 'Cuota de Entrada' AND fecha_vencimiento <= (CAST(${expirationDate} AS DATE)- INTERVAL '3 month')), 0) AS mayor_90


        FROM ${contractsTable}  AS c
        JOIN ${financingTable} AS f ON  f.id_contrato = c.id 
        JOIN ${customersTable} AS l ON l.id = c.cliente_id
        WHERE f.estado_dividendo = 'Vigente' AND  f.fecha_vencimiento <= ${expirationDate}
        GROUP BY c.proyecto, c.id, c.ubicacion, l.nombre
        ORDER BY contrato
        )
      `);

      return {
        statusCode: 200,
        body: JSON.stringify(portfolioAgeContracts.rows),
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
