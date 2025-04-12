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

import { isAfter, isBefore, isEqual } from "date-fns";

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
          additionalConditions: [
            {
              field: financingTable.estado,
              value: "Vigente",
            },
          ],
          orderBy: [
            {
              field: financingTable.numero_dividendo,
              direction: "asc",
            },
            {
              field: financingTable.fecha_vencimiento,
              direction: "asc",
            }
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

      if (contract.length > 0) {
        const contractData = contract.at(0)!;
        const reserveValue = Number(contractData.valor_reserva);
        const entryFeeBalance = Number(contractData.saldo_ce);
        const salePrice = Number(contractData.precioventa);

        const now = new Date();

        const valueToBeat = financing
          .filter(
            (fin) =>
              !charges.some((charge) => charge.cabecera_id === fin.cabecera_id) &&
              isAfter(new Date(fin.fecha_vencimiento), now)
          )
          .reduce((sum, fin) => sum + Number(fin.valor_dividendos || 0), 0);

        const percentageCharged =
          (financing.reduce(
            (sum, fin) => sum + Number(fin.valor_dividendos || 0),
            0
          ) /
            salePrice) *
          100;

        const expiredDocumentsValue = financing
          .filter(
            (fin) =>
              charges.some((charge) => charge.cabecera_id === fin.cabecera_id) &&
              (isBefore(new Date(fin.fecha_vencimiento), now) ||
                isEqual(new Date(fin.fecha_vencimiento), now))
          )
          .reduce((sum, fin) => sum + Number(fin.valor_dividendos || 0), 0);

        const totalExpired =
          expiredDocumentsValue +
          financing.reduce((sum, fin) => sum + Number(fin.valor_mora || 0), 0);

        const totalCancelDiscount = charges.reduce(
          (sum, charge) => sum + Number(charge.valor_cobrado || 0),
          0
        );

        const netValueCancel =
          totalCancelDiscount +
          financing.reduce((sum, fin) => sum + Number(fin.valor_mora || 0), 0);

        const totalValueChargedCustomer = financing
          .filter((fin) => fin.estado_dividendo === "Vigente")
          .reduce((sum, fin) => sum + Number(fin.valor_dividendos || 0), 0);

        contractData.valor_entrada = String(reserveValue + entryFeeBalance);
        contractData.valor_por_vencer = String(valueToBeat);
        contractData.porcentaje_cobrado = String(percentageCharged);
        contractData.valor_documentos_vencidos = String(expiredDocumentsValue);
        contractData.valor_total_vencido = String(totalExpired);
        contractData.valor_total_descuento = String(totalCancelDiscount);
        contractData.valor_neto_cancel = String(netValueCancel);
        contractData.valor_total_cob_client = String(totalValueChargedCustomer);
      }
      

      const financingWithCharges = financing.map((fin) => {
        const relatedCharges = charges.filter((charge) => {
          return (
            charge.cabecera_id === fin.cabecera_id &&
            charge.num_dividendo === fin.numero_dividendo && 
            charge.tipo_dividendo === fin.tipo_dividendo
          );
        });

         const totalChardedValue = relatedCharges.reduce(
           (sum, charge) => sum + Number(charge.valor_cobrado || 0),
           0
        );
        
        const dividendBalanceValue =
          Number(contract[0].valor_reserva) - totalChardedValue;

        return {
          ...fin,
          charges: relatedCharges,
          valor_saldo_div: String(dividendBalanceValue),
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
