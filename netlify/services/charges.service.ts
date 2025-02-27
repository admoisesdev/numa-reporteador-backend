import { db } from "../data/db";

import { chargesTable } from "../data/schemas";

import { and, Column, ColumnBaseConfig, ColumnDataType, eq, sql } from "drizzle-orm";

type FieldData = Column<ColumnBaseConfig<ColumnDataType, string>>;
type AdditionalConditions = Array<{ field: FieldData; value: unknown }>;

interface FindOneParams {
  field: FieldData;
  value: unknown;
  fieldsToShow?: Record<string, any>;
  additionalConditions?: AdditionalConditions;
  groupBy?: FieldData;
}

export class ChargesService {
  async findOne(options: FindOneParams) {
    const { field, value, fieldsToShow, additionalConditions,groupBy } = options;

    let conditions = [eq(field, value)];

    if (additionalConditions && additionalConditions.length > 0) {
      additionalConditions.forEach((condition) => {
        conditions.push(eq(condition.field, condition.value));
      });
    }

    const query = db
      .select(fieldsToShow!)
      .from(chargesTable)
      .where(and(...conditions));
    
    if (groupBy) query.groupBy(sql`${groupBy}`);
    
    const result = await query.execute();
    

    return result;
  }
}
