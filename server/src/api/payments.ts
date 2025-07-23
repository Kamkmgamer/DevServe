import { Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { serviceId, clientEmail } = req.body;

  // In a real app, fetch service details from your DB
  // const service = await prisma.service.findUnique({ where: { id: serviceId } });
  // if (!service) return res.status(404).json({ error: "Service not found" });

  // For now, using placeholder data
  const placeholderService = { name: "Web Design Package", price: 1500 };

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
              name: placeholderService.name,
            },
            unit_amount: placeholderService.price * 100, // Amount in cents
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