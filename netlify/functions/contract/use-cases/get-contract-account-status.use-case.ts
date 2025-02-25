import { HandlerResponse } from "@netlify/functions";

import { ChargesService, ContractService, FinancingService } from "../../../services";

import { financingTable,chargesTable, contractsTable } from "../../../data/schemas";
import { HEADERS } from "../../../config/constants";

type ContractAccountStatusParams = {
  contractId?: string;
};

interface GetContractAccountStatusUseCase {
  execute(params?: ContractAccountStatusParams): Promise<HandlerResponse>;
}

export class GetContractAccountStatus implements GetContractAccountStatusUseCase {
  constructor(
    private readonly contractService: ContractService = new ContractService(),
    private readonly financingService: FinancingService = new FinancingService(),
    private readonly chargesService: ChargesService = new ChargesService(),
  ) {}

  public async execute(
    params?: ContractAccountStatusParams
  ): Promise<HandlerResponse> {
    const { contractId = "" } = params || {};

    try {
      const contract = await this.contractService.findOne(contractsTable.id,contractId);

      const financing = await this.financingService.findOne(
        financingTable.id_contrato,
        contractId
      );

      const charges = await this.chargesService.findOne(
        chargesTable.id_contrato,
        contractId
      );

      const accountStatusContract = {
        contract: contract.at(0),
        financing,
        charges,
      };
     

      return {
        statusCode: 200,
        body: JSON.stringify(accountStatusContract),
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
