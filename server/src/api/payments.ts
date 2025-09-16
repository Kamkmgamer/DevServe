import { Request, Response } from "express";
import { db } from "../lib/db";
import { services } from "../lib/schema";
import { eq } from "drizzle-orm";
import { createPayPalOrder, capturePayPalOrder } from "../lib/paypal";

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { serviceId, clientEmail } = req.body;

  // Dynamically require Stripe so tests can mock the constructor before import
  const { default: Stripe } = await import("stripe");

  const serviceResult = await db.select().from(services).where(eq(services.id, serviceId));
  const service = serviceResult[0];

  if (!service) return res.status(404).json({ error: "Service not found" });

  try {
    // Instantiate Stripe inside the handler so tests can mock the constructor without module init side-effects
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "test_key");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: service.name,
            },
            unit_amount: service.price * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
    });

    res.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Stripe error";
    res.status(500).json({ error: message });
  }
};

export const createPaypalOrder = async (req: Request, res: Response) => {
  const { totalCents } = req.body;
  try {
    const order = await createPayPalOrder(totalCents);
    res.status(200).json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "PayPal create error";
    res.status(500).json({ error: message });
  }
};

export const capturePaypalOrder = async (req: Request, res: Response) => {
  const { authorizationId, totalCents } = req.body;
  try {
    const capture = await capturePayPalOrder(authorizationId, totalCents);
    res.status(200).json(capture);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "PayPal capture error";
    res.status(500).json({ error: message });
  }
};