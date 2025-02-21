import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS } from "../../config/constants";


const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  if (httpMethod === "GET" && path.includes("/contract")) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Customer Contract!!!",
      }),
      headers: HEADERS.json,
    };
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
