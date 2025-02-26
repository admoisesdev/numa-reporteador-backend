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
  cabecera_factura: integer("cabecera_factura"),
  cabecera_id: integer("cabecera_id"),
  estado_dividendo: varchar("estado_dividendo", { length: 20 }),
  estado: varchar("estado", { length: 20 }),
  fecha_creacion: date("fecha_creacion"),
  fecha_pago_div: date("fecha_pago_div"),
  fecha_refinanciamiento: date("fecha_refinanciamiento"),
  fecha_vencimiento: date("fecha_vencimiento"),
  mostrar_reporte: boolean("mostrar_reporte"),
  numero_dividendo: integer("numero_dividendo"),
  tipo_dividendo: varchar("tipo_dividendo", { length: 50 }),
  total_dividendo: integer("total_dividendo"),
  valor_dividendos: decimal("valor_dividendos", { precision: 15, scale: 2 }),
  valor_interes_div: decimal("valor_interes_div", { precision: 15, scale: 2 }),
  valor_mora: decimal("valor_mora", { precision: 15, scale: 2 }),
  valor_pagado_div: decimal("valor_pagado_div", { precision: 15, scale: 2 }),
  valor_saldo_div: decimal("valor_saldo_div", { precision: 15, scale: 2 }),
  id_contrato: varchar("id_contrato", { length: 50 }).references(
    () => contractsTable.id
  ),
});

export type InsertFinancing = typeof financingTable.$inferInsert;
export type SelectFinancing = typeof financingTable.$inferSelect;
