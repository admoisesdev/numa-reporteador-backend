import { Handler, HandlerEvent } from "@netlify/functions";

import { GetContractAccountStatus, GetContractsCustomer } from "./use-cases";
import { HEADERS } from "../../config/constants";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path, queryStringParameters } = event;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  if (queryStringParameters) {
    const customerId = queryStringParameters.customerId;
    const contractId = queryStringParameters.contractId;

    if (httpMethod === "GET" && path.includes("/contract") && customerId) {
      return new GetContractsCustomer()
        .execute({ customerId })
        .then((res) => res)
        .catch((error) => error);
    }

    if (httpMethod === "GET" && path.includes("/contract/account-status") && contractId) {
      return new GetContractAccountStatus()
        .execute({ contractId })
        .then((res) => res)
        .catch((error) => error);
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({
      message: "Method Not Allowed",
    }),
    headers: HEADERS.json,
  };
};

export { handler };
