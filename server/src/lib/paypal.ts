import paypal from "@paypal/checkout-server-sdk";
const env = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET!
);
export const client = new paypal.core.PayPalHttpClient(env);
 
export async function createPayPalOrder(totalCents: number) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "AUTHORIZE",
    purchase_units: [{
      amount: {
        currency_code: "USD",
        value: (totalCents/100).toFixed(2)
      }
    }]
  });
  const { result } = await client.execute(request);
  return result;
}

export async function capturePayPalOrder(authorizationId: string, totalCents: number) {
  const request = new paypal.payments.AuthorizationsCaptureRequest(
    authorizationId
  );
  // @ts-expect-error
  request.requestBody({
    amount: {
      currency_code: "USD",
      value: (totalCents / 100).toFixed(2),
    },
    final_capture: true,
    invoice_id: "",
    note_to_payer: "",
    soft_descriptor: "",
  });
  const { result } = await client.execute(request);
  return result;
}