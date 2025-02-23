import { pgTable, serial, varchar, integer, date, decimal } from "drizzle-orm/pg-core";
import { contractsTable } from "./contracts.schema";

export const chargesTable = pgTable("cobros", {
  id: serial("id").primaryKey(),
  id_contrato: varchar("id_contrato", { length: 50 }).references(() => contractsTable.id),
  valor_cobrado: decimal("valor_cobrado", { precision: 15, scale: 2 }),
  num_dividendo: integer("num_dividendo"),
  tipo_dividendo: varchar("tipo_dividendo", { length: 50 }),
  tipo_transaccion: varchar("tipo_transaccion", { length: 50 }),
  fecha_cobro: date("fecha_cobro"),
  fecha_vcto_cobro: date("fecha_vcto_cobro"),
  concepto: varchar("concepto", { length: 255 }),
  tipo_comprobante: varchar("tipo_comprobante", { length: 50 }),
  id_transaccion: integer("id_transaccion"),
  referencia: varchar("referencia", { length: 50 }),
  nro_documento: varchar("nro_documento", { length: 50 }),
  cuenta_plan: varchar("cuenta_plan", { length: 50 }),
  nombre_cuenta: varchar("nombre_cuenta", { length: 100 }),
  recibo_num: varchar("recibo_num", { length: 50 }),
});

export type InsertCharges = typeof chargesTable.$inferInsert;
export type SelectCharges = typeof chargesTable.$inferSelect;