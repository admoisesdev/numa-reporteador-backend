import { boolean, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const customersTable = pgTable("clientes", {
  id: serial("id").primaryKey(),
  identificacion: varchar("identificacion", { length: 20 }).notNull(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  proyecto: varchar("proyecto", { length: 100 }),
  telefono: varchar("telefono", { length: 20 }),
  email: varchar("email", { length: 255 }),
  activo: boolean("activo").notNull().default(true),
});

export type InsertCustomers = typeof customersTable.$inferInsert;
export type SelectCustomers = typeof customersTable.$inferSelect;
