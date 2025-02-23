import { HandlerResponse } from "@netlify/functions";

import { CustomerService } from "../../../services";


import { HEADERS } from "../../../config/constants";
import { customersTable } from "../../../data/schemas";

type GetCustomersParams = {
  onlyActives?: boolean;
};

interface GetCustomersUseCase {
  execute(params?: GetCustomersParams): Promise<HandlerResponse>;
}

export class GetCustomers implements GetCustomersUseCase {
  constructor(
    private readonly customerService: CustomerService = new CustomerService()
  ) {}

  public async execute(params?: GetCustomersParams): Promise<HandlerResponse> {
    const { onlyActives = false } = params || {};

    try {
      if (onlyActives) {
        const activesCustomers = await this.customerService.findOne(
          customersTable.activo,
          onlyActives
        );

        return {
          statusCode: 200,
          body: JSON.stringify(activesCustomers),
          headers: HEADERS.json,
        };
      }

      
      const customers = await this.customerService.findAll();
     

      return {
        statusCode: 200,
        body: JSON.stringify(customers),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
