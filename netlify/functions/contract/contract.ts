import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS } from "../../config/constants";
import { GetContractsCustomer } from "./use-cases";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path, queryStringParameters } = event;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  if (httpMethod === "GET" && path.includes("/contract")) {
    if (queryStringParameters) {
      const customerId = queryStringParameters.customerId;

      return new GetContractsCustomer()
        .execute({ customerId })
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
