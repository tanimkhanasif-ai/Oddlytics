import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let client: Paddle | null = null;

export function getPaddleClient(): Paddle {
  if (!client) {
    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      throw new Error("PADDLE_API_KEY is not set on the server.");
    }
    const environment =
      process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
        ? Environment.production
        : Environment.sandbox;
    client = new Paddle(apiKey, { environment });
  }
  return client;
}
