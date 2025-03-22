import { HandlerResponse } from "@netlify/functions";

import { db } from "../../../data/db";
import {
  contractsTable,
  customersTable,
  financingTable,
} from "../../../data/schemas";

import { HEADERS } from "../../../config/constants";

import { sql } from "drizzle-orm";

type ReceivablesParams = {
  expirationDate: string;
};

interface GetReceivablesUseCase {
  execute(params?: ReceivablesParams): Promise<HandlerResponse>;
}

export class GetReceivables implements GetReceivablesUseCase {
  public async execute(
    params: ReceivablesParams
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
      const receivablesContracts = await db.execute(sql`
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

        FROM ${contractsTable}  AS c
        JOIN ${financingTable} AS f ON  f.id_contrato = c.id 
        JOIN ${customersTable} AS l ON l.id = c.cliente_id
        WHERE f.estado_dividendo = 'Vigente' AND  f.fecha_vencimiento <= ${expirationDate}
        ORDER by contrato
      `);

      return {
        statusCode: 200,
        body: JSON.stringify(receivablesContracts.rows),
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
