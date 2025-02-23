import { pgTable, varchar, integer, date, decimal } from "drizzle-orm/pg-core";
import { customersTable } from "./customers.schema";

export const contractsTable = pgTable("contratos", {
  id: varchar("id", { length: 50 }).primaryKey(),
  estado: varchar("estado", { length: 20 }),
  ubicacion: varchar("ubicacion", { length: 100 }),
  cliente_vendedor: varchar("cliente_vendedor", { length: 100 }),
  fecha_creacion: date("fecha_creacion"),
  empresa: varchar("empresa", { length: 100 }),
  proyecto: varchar("proyecto", { length: 100 }),
  precio_lista: decimal("precio_lista", { precision: 15, scale: 2 }),
  descuento: decimal("descuento", { precision: 15, scale: 2 }),
  precioventa: decimal("precioventa", { precision: 15, scale: 2 }),
  fecha_reserva: date("fecha_reserva"),
  fecha_cierre: date("fecha_cierre"),
  financiamiento_idvigente: integer("financiamiento_idvigente"),
  tipo_contratoid: varchar("tipo_contratoid", { length: 50 }),
  valor_contrato: decimal("valor_contrato", { precision: 15, scale: 2 }),
  valor_reserva: decimal("valor_reserva", { precision: 15, scale: 2 }),
  cuota_reserv2: decimal("cuota_reserv2", { precision: 15, scale: 2 }),
  cuota_reserv8: decimal("cuota_reserv8", { precision: 15, scale: 2 }),
  valor_entrada: decimal("valor_entrada", { precision: 15, scale: 2 }),
  valor_saldo: decimal("valor_saldo", { precision: 15, scale: 2 }),
  plazo_ce: integer("plazo_ce"),
  cantidad_cuota_inicial: decimal("cantidad_cuota_inicial", {
    precision: 5,
    scale: 2,
  }),
  cliente_id: integer("cliente_id").references(() => customersTable.id),
});

export type InsertContracts = typeof contractsTable.$inferInsert;
export type SelectContracts = typeof contractsTable.$inferSelect;
