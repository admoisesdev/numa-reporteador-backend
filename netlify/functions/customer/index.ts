import { Handler, HandlerEvent } from "@netlify/functions";

import { GetCustomers } from "./use-cases";
import { HEADERS } from "../../config/constants";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  if (httpMethod === "GET" && path.includes("/customer")) {
    return new GetCustomers()
      .execute()
      .then((res) => res)
      .catch((error) => error);
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
