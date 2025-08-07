import { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../lib/prisma";
import { createPayPalOrder, capturePayPalOrder } from "../lib/paypal";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { serviceId, clientEmail } = req.body;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return res.status(404).json({ error: "Service not found" });

  try {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPaypalOrder = async (req: Request, res: Response) => {
  const { totalCents } = req.body;
  try {
    const order = await createPayPalOrder(totalCents);
    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const capturePaypalOrder = async (req: Request, res: Response) => {
  const { authorizationId } = req.body;
  try {
    const capture = await capturePayPalOrder(authorizationId);
    res.status(200).json(capture);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};