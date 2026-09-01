import { WhopClient } from "@whop/sdk";

let client: WhopClient | null = null;

export function getWhopClient(): WhopClient {
  if (!client) {
    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey) {
      throw new Error("WHOP_API_KEY is not set on the server.");
    }
    client = new WhopClient({ token: apiKey });
  }
  return client;
}
