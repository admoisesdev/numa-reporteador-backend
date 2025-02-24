import { db } from "../data/db";

import { financingTable } from "../data/schemas";

import { Column, ColumnBaseConfig, ColumnDataType, eq } from "drizzle-orm";

export class FinancingService {
  async findOne(
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown,
    fieldsToShow?: Record<string, any>
  ) {
    const oneRecordByFilter = await db
      .select(fieldsToShow!)
      .from(financingTable)
      .where(eq(field, value));

    return oneRecordByFilter;
  }
}
