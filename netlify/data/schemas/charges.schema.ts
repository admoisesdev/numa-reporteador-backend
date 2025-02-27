import { pgTable, serial, varchar, integer, date, decimal } from "drizzle-orm/pg-core";
import { contractsTable } from "./contracts.schema";

export const chargesTable = pgTable("cobros", {
  id: serial("id").primaryKey(),
  cabecera_id: integer("cabecera_id"),
  concepto: varchar("concepto", { length: 255 }),
  cuenta_plan: varchar("cuenta_plan", { length: 50 }),
  fecha_cobro: date("fecha_cobro"),
  fecha_vcto_cobro: date("fecha_vcto_cobro"),
  id_transaccion: integer("id_transaccion"),
  nombre_cuenta: varchar("nombre_cuenta", { length: 100 }),
  nro_documento: varchar("nro_documento", { length: 50 }),
  num_dividendo: integer("num_dividendo"),
  recibo_num: varchar("recibo_num", { length: 50 }),
  referencia: varchar("referencia", { length: 50 }),
  tipo_comprobante: varchar("tipo_comprobante", { length: 50 }),
  tipo_dividendo: varchar("tipo_dividendo", { length: 50 }),
  tipo_transaccion: varchar("tipo_transaccion", { length: 50 }),
  valor_cobrado: decimal("valor_cobrado", { precision: 15, scale: 2 }),
  id_contrato: varchar("id_contrato", { length: 50 }).references(
    () => contractsTable.id
  ),
});

export type InsertCharges = typeof chargesTable.$inferInsert;
export type SelectCharges = typeof chargesTable.$inferSelect;