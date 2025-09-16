import { Request, Response } from 'express';
import { db } from '../lib/db';
import { payouts, commissions } from '../lib/schema';
import { eq } from 'drizzle-orm';

type Payout = typeof payouts.$inferSelect;

function hasRows<T>(val: unknown): val is { rows: T[] } {
  return typeof val === 'object' && val !== null && 'rows' in (val as Record<string, unknown>);
}

export const createPayout = async (req: Request, res: Response) => {
    const { referralId, amount } = req.body;

    try {
        const data = {
            referralId,
            amount,
        };

        const raw = await db.insert(payouts).values(data).returning();
        const payoutResult: Payout[] = hasRows<Payout>(raw) ? raw.rows : (raw as Payout[]);
        const payout = payoutResult[0];

        await db.update(commissions).set({ status: 'PAID' }).where(eq(commissions.payoutId, payout.id));

        res.status(201).json(payout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPayouts = async (req: Request, res: Response) => {
    try {
        const raw = await db.select().from(payouts);
        const rows: Payout[] = hasRows<Payout>(raw) ? raw.rows : (raw as Payout[]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPayout = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const raw = await db.select().from(payouts).where(eq(payouts.id, id));
        const singleResult: Payout[] = hasRows<Payout>(raw) ? raw.rows : (raw as Payout[]);
        const singlePayout = singleResult[0];

        if (!singlePayout) {
            return res.status(404).json({ message: 'Payout not found' });
        }
        res.json(singlePayout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};