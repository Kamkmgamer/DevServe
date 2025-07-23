import { Request, Response } from "express";
import { z } from "zod";
// We will create the email service later
// import { sendContactEmail } from '../lib/email';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export const handleContactForm = async (req: Request, res: Response) => {
  const result = contactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }

  // await sendContactEmail(result.data);
  console.log("Sending email with data:", result.data);

  res.status(200).json({ message: "Message received, thank you!" });
};