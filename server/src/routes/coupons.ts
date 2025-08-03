// server/src/routes/coupons.ts
import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/* Shared Zod schema – identical rules to the client                  */
/* ------------------------------------------------------------------ */
const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .transform((s) => s.toUpperCase()),

    type: z.enum(["percentage", "fixed"]),
    value: z.number().positive().int(),
    minOrderAmount: z.number().positive().int().optional().nullable(),
    maxUses: z.number().positive().int().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
    active: z.boolean(),
  })
  .refine(
    (d) => (d.type === "percentage" ? d.value <= 100 : true),
    {
      path: ["value"],
      message: "Percentage value may not exceed 100",
    }
  );

/* ------------------------------------------------------------------ */
const formatZodError = (err: z.ZodError) =>
  err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));

/* ------------------------------------------------------------------ */
/* Public route: get single coupon                                    */
/* ------------------------------------------------------------------ */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: req.params.id },
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(coupon);
  } catch (e) {
    console.error("Fetch coupon error", e);
    res
      .status(500)
      .json({ message: "Failed to fetch coupon", error: (e as Error).message });
  }
});

/* ------------------------------------------------------------------ */
/* Public route: list all coupons (simple pagination)                 */
/* /coupons?page=1&pageSize=25                                        */
/* ------------------------------------------------------------------ */
router.get("/", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 100;
  try {
    const [total, data] = await prisma.$transaction([
      prisma.coupon.count(),
      prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    res.json({ data, total, page, pageSize });
  } catch (e) {
    console.error("Fetch coupons error", e);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
});

/* ------------------------------------------------------------------ */
/* Protected routes after this point                                  */
/* ------------------------------------------------------------------ */
router.use(require("../middleware/auth").authMiddleware);

/* ------------------------------------------------------------------ */
/* Create                                                             */
/* ------------------------------------------------------------------ */
router.post("/", async (req: Request, res: Response) => {
  const parsed = couponSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Validation failed", errors: formatZodError(parsed.error) });

  const data = parsed.data;
  try {
    const duplicate = await prisma.coupon.findUnique({
      where: { code: data.code },
    });
    if (duplicate) return res.status(400).json({ message: "Coupon code already exists" });

    const coupon = await prisma.coupon.create({
      data: { ...data, currentUses: 0 },
    });
    res.status(201).json(coupon);
  } catch (e) {
    console.error("Create coupon error", e);
    res.status(500).json({ message: "Failed to create coupon" });
  }
});

/* ------------------------------------------------------------------ */
/* Update                                                             */
/* ------------------------------------------------------------------ */
router.patch("/:id", async (req: Request, res: Response) => {
  const parsed = couponSchema.partial().safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Validation failed", errors: formatZodError(parsed.error) });

  const data = parsed.data;
  try {
    if (data.code) {
      const dup = await prisma.coupon.findFirst({
        where: { code: data.code, NOT: { id: req.params.id } },
      });
      if (dup) return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data,
    });
    res.json(coupon);
  } catch (e: any) {
    if (e.message?.includes("Record to update"))
      return res.status(404).json({ message: "Coupon not found" });

    console.error("Update coupon error", e);
    res.status(500).json({ message: "Failed to update coupon" });
  }
});

/* ------------------------------------------------------------------ */
/* Delete                                                             */
/* ------------------------------------------------------------------ */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: "Coupon not found" });
  }
});

export default router;