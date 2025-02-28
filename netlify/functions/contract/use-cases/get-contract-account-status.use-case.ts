import { HandlerResponse } from "@netlify/functions";

import {
  ChargesService,
  ContractService,
  FinancingService,
} from "../../../services";

import {
  financingTable,
  chargesTable,
  contractsTable,
} from "../../../data/schemas";
import { HEADERS } from "../../../config/constants";

type ContractAccountStatusParams = {
  contractId?: string;
};

interface GetContractAccountStatusUseCase {
  execute(params?: ContractAccountStatusParams): Promise<HandlerResponse>;
}

export class GetContractAccountStatus
  implements GetContractAccountStatusUseCase
{
  constructor(
    private readonly contractService: ContractService = new ContractService(),
    private readonly financingService: FinancingService = new FinancingService(),
    private readonly chargesService: ChargesService = new ChargesService()
  ) {}

  public async execute(
    params?: ContractAccountStatusParams
  ): Promise<HandlerResponse> {
    const { contractId = "" } = params || {};

    try {
      const [contract, financing, charges] = await Promise.all([
        this.contractService.findOne(contractsTable.id, contractId),
        this.financingService.findOne({
          field: financingTable.id_contrato,
          value: contractId,
          orderBy: [
            {
              field: financingTable.numero_dividendo,
              direction: "asc",
            },
          ],
        }),
        await this.chargesService.findOne({
          field: chargesTable.id_contrato,
          value: contractId,
          orderBy: [
            {
              field: chargesTable.num_dividendo,
              direction: "asc",
            },
            {
              field: chargesTable.fecha_cobro,
              direction: "asc",
            },
          ],
        }),
      ]);

      const financingWithCharges = financing.map((fin) => {
        const relatedCharges = charges.filter((charge) => {
          return (
            charge.cabecera_id === fin.cabecera_id &&
            charge.num_dividendo === fin.numero_dividendo
          );
        });

        return {
          ...fin,
          charges: relatedCharges,
        };
      });

      const accountStatusContract = {
        contract: contract.at(0),
        financing: financingWithCharges,
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
