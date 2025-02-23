import {
  pgTable,
  serial,
  varchar,
  integer,
  date,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { contractsTable } from "./contracts.schema";

export const financingTable = pgTable("financiamiento", {
  id: serial("id").primaryKey(),
  id_contrato: varchar("id_contrato", { length: 50 }).references(
    () => contractsTable.id
  ),
  cabecera_id: integer("cabecera_id"),
  cabecera_factura: integer("cabecera_factura"),
  estado: varchar("estado", { length: 20 }),
  numero_dividendo: integer("numero_dividendo"),
  tipo_dividendo: varchar("tipo_dividendo", { length: 50 }),
  valor_dividendos: decimal("valor_dividendos", { precision: 15, scale: 2 }),
  valor_mora: decimal("valor_mora", { precision: 15, scale: 2 }),
  fecha_refinanciamiento: date("fecha_refinanciamiento"),
  total_dividendo: integer("total_dividendo"),
  fecha_creacion: date("fecha_creacion"),
  fecha_vencimiento: date("fecha_vencimiento"),
  estado_dividendo: varchar("estado_dividendo", { length: 20 }),
  valor_interes_div: decimal("valor_interes_div", { precision: 15, scale: 2 }),
  valor_saldo_div: decimal("valor_saldo_div", { precision: 15, scale: 2 }),
  mostrar_reporte: boolean("mostrar_rep"),
  valor_pagado_div: decimal("valor_pagado_div", { precision: 15, scale: 2 }),
  fecha_pago_div: date("fecha_pago_div"),
});

export type InsertFinancing = typeof financingTable.$inferInsert;
export type SelectFinancing = typeof financingTable.$inferSelect;
