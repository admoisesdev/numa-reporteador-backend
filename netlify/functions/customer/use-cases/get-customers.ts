import { HandlerResponse } from "@netlify/functions";

import { CustomerService } from "../../../services";


import { HEADERS } from "../../../config/constants";

interface GetCustomersUseCase {
  execute(token: string): Promise<HandlerResponse>;
}

export class GetCustomers implements GetCustomersUseCase {
  constructor(
    private readonly customerService: CustomerService = new CustomerService()
  ) {}

  public async execute(): Promise<HandlerResponse> {
    try {
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
