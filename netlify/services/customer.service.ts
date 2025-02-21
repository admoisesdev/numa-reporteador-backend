import { db } from "../data/db";

import { customersTable } from "../data/schemas";


export class CustomerService {
  async findAll() {
    const customers = await db
      .select()
      .from(customersTable)

    return customers;
  }
}
