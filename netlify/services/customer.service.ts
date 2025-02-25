import { db } from "../data/db";

import { customersTable } from "../data/schemas";

import { Column, ColumnBaseConfig, ColumnDataType, eq } from "drizzle-orm";

export class CustomerService {
  async findAll() {
    const customers = await db.select().from(customersTable);

    return customers;
  }

  async findOne(
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown,
    fieldsToShow?: Record<string, any>
  ) {
    const oneRecordByFilter = await db
      .select(fieldsToShow!)
      .from(customersTable)
      .where(eq(field, value));

    return oneRecordByFilter;
  }


  /* async getContractAccountStatus(contractId: string) {
    const financing = await db
      .select()
      .from(financingTable)
      .where(eq(financingTable.id_contrato, contractId));

    const charges = await db
      .select()
      .from(chargesTable)
      .where(eq(chargesTable.id_contrato, contractId));

    return {
      financing,
      charges,
    };
  } */
}
