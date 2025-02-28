import { db } from "../data/db";

import { financingTable } from "../data/schemas";

import {
  and,
  asc,
  Column,
  ColumnBaseConfig,
  ColumnDataType,
  desc,
  eq,
} from "drizzle-orm";

type FieldData = Column<ColumnBaseConfig<ColumnDataType, string>>;
type AdditionalConditions = Array<{ field: FieldData; value: unknown }>;
interface FindOneParams {
  field: FieldData;
  value: unknown;
  fieldsToShow?: Record<string, any>;
  additionalConditions?: AdditionalConditions;
  orderBy?: { field: FieldData; direction?: "asc" | "desc" }[];
}
export class FinancingService {
  async findOne(options: FindOneParams) {
    const { field, value, fieldsToShow, additionalConditions, orderBy } =
      options;

    let conditions = [eq(field, value)];

    if (additionalConditions && additionalConditions.length > 0) {
      additionalConditions.forEach((condition) => {
        conditions.push(eq(condition.field, condition.value));
      });
    }

    const query = db
      .select(fieldsToShow!)
      .from(financingTable)
      .where(and(...conditions));

    if (orderBy && orderBy.length > 0) {
      orderBy.forEach((order) => {
        if (order.direction === "asc") query.orderBy(asc(order.field));
        if (order.direction === "desc") query.orderBy(desc(order.field));
      });
    }

    const result = await query.execute();

    return result;
  }
}
