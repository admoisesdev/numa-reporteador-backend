import { db } from "../data/db";

import { chargesTable } from "../data/schemas";

import { Column, ColumnBaseConfig, ColumnDataType, eq } from "drizzle-orm";

export class ChargesService {
  async findOne(
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown,
    fieldsToShow?: Record<string, any>
  ) {
    const oneRecordByFilter = await db
      .select(fieldsToShow!)
      .from(chargesTable)
      .where(eq(field, value));

    return oneRecordByFilter;
  }
}
