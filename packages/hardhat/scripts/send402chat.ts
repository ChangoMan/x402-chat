import * as dotenv from "dotenv";
dotenv.config();
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { getDecryptedPK } from "./getDecryptedPK";

const URL_TO_SEND_REQUEST = "http://localhost:3000/api/payment/chat";
const DEFAULT_MESSAGE = "Hello! Can you help me test the x402 payment integration?";

async function main() {
  // Get custom message from environment variable or use default
  // Usage: CHAT_MESSAGE="your message" yarn send402chat
  const customMessage = process.env.CHAT_MESSAGE;
  const messageContent = customMessage && customMessage.trim() ? customMessage.trim() : DEFAULT_MESSAGE;

  if (!customMessage) {
    console.log(" ℹ️  Tip: You can provide a custom message:");
    console.log('    CHAT_MESSAGE="your message" yarn send402chat\n');
  }

  const privateKey = await getDecryptedPK();

  if (!privateKey) return;

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  console.log("\n 📡 Sending x402 chat request on baseSepolia from", account.address);
  console.log(` 💬 Message: "${messageContent}"\n`);

  const fetchWithPayment = wrapFetchWithPayment(fetch, account);

  const testMessages = [
    {
      role: "user",
      content: messageContent,
    },
  ];

  fetchWithPayment(URL_TO_SEND_REQUEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages: testMessages }),
  })
    .then(async (response: Response) => {
      const body = await response.json();
      console.log("\n✅ Chat Response:");
      console.log(body);

      const paymentResponse = decodeXPaymentResponse(response.headers.get("x-payment-response")!);
      console.log("\n💳 Payment Details:");
      console.log(paymentResponse);
    })
    .catch((error: any) => {
      console.error("\n❌ Error:", error.message || error.response?.data?.error || error);
    });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
