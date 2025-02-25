import { HandlerResponse } from "@netlify/functions";

import { ContractService } from "../../../services";

import { contractsTable } from "../../../data/schemas";
import { HEADERS } from "../../../config/constants";

type ContractsCustomerParams = {
  customerId?: string;
};

interface GetContractsCustomerUseCase {
  execute(params?: ContractsCustomerParams): Promise<HandlerResponse>;
}

export class GetContractsCustomer implements GetContractsCustomerUseCase {
  constructor(
    private readonly contractService: ContractService = new ContractService()
  ) {}

  public async execute(
    params?: ContractsCustomerParams
  ): Promise<HandlerResponse> {
    const { customerId = "" } = params || {};

    try {
      const contractsByCustomer = await this.contractService.findOne(
        contractsTable.cliente_id,
        customerId
      );

      return {
        statusCode: 200,
        body: JSON.stringify(contractsByCustomer),
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
