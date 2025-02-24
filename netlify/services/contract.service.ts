import { db } from "../data/db";

import { contractsTable } from "../data/schemas";

import { Column, ColumnBaseConfig, ColumnDataType, eq } from "drizzle-orm";

export class ContractService {
  async findOne(
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown,
    fieldsToShow?: Record<string, any>
  ) {
    const oneRecordByFilter = await db
      .select(fieldsToShow!)
      .from(contractsTable)
      .where(eq(field, value));

    return oneRecordByFilter;
  }
}
