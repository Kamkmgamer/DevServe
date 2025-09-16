import { Response } from 'express';
import { db } from '../lib/db';
import { referrals } from '../lib/schema';
import { eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth';

type Referral = typeof referrals.$inferSelect;

function hasRows<T>(val: unknown): val is { rows: T[] } {
  return typeof val === 'object' && val !== null && 'rows' in (val as any);
}

export const createReferral = async (req: AuthRequest, res: Response) => {
    const { code, commissionRate } = req.body;
    const userId = req.user!.id;

    try {
        const existingRaw = await db.select().from(referrals).where(eq(referrals.referredUserId, userId));
        const existingResult: Referral[] = hasRows<Referral>(existingRaw) ? existingRaw.rows : (existingRaw as Referral[]);
        const existingReferral = existingResult[0];

        if (existingReferral) {
            return res.status(400).json({ message: 'User already has a referral code or code is already in use' });
        }

        const insertedRaw = await db.insert(referrals).values({ userId, code, commissionRate }).returning();
        const inserted: Referral[] = hasRows<Referral>(insertedRaw) ? insertedRaw.rows : (insertedRaw as Referral[]);
        const newReferral = inserted[0];

        res.status(201).json(newReferral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getReferrals = async (_req: AuthRequest, res: Response) => {
    try {
        const raw = await db.select().from(referrals);
        const referralsList: Referral[] = hasRows<Referral>(raw) ? raw.rows : (raw as Referral[]);
        res.json(referralsList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getReferral = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const raw = await db.select().from(referrals).where(eq(referrals.id, id));
        const singleResult: Referral[] = hasRows<Referral>(raw) ? raw.rows : (raw as Referral[]);
        const singleReferral = singleResult[0];

        if (!singleReferral) {
            return res.status(404).json({ message: 'Referral not found' });
        }
        res.json(singleReferral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateReferral = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { code, commissionRate } = req.body;
    const userId = req.user!.id;

    try {
        const raw = await db.select().from(referrals).where(eq(referrals.id, id));
        const referral: Referral[] = hasRows<Referral>(raw) ? raw.rows : (raw as Referral[]);
        const existingReferral = referral[0];

        if (!existingReferral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        if (existingReferral.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this referral' });
        }

        const updatedRaw = await db.update(referrals).set({ code, commissionRate }).where(eq(referrals.id, id)).returning();
        const updateResult: Referral[] = hasRows<Referral>(updatedRaw) ? updatedRaw.rows : (updatedRaw as Referral[]);
        const updatedReferral = updateResult[0];

        res.json(updatedReferral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteReferral = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        await db.delete(referrals).where(eq(referrals.id, id));

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyReferral = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    console.log('getMyReferral: userId from req.user', userId);

    try {
        const raw = await db.select().from(referrals).where(eq(referrals.userId, userId));
        const referral: Referral[] = hasRows<Referral>(raw) ? raw.rows : (raw as Referral[]);
        const userReferral = referral[0];

        console.log('getMyReferral: fetched referral', userReferral);

        if (!userReferral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        res.json(userReferral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getReferralByCode = async (req: AuthRequest, res: Response) => {
    const { code } = req.params;
    console.log('Referral code received:', code);
    try {
        const raw = await db.select().from(referrals).where(eq(referrals.code, code));
        const referral: Referral[] = hasRows<Referral>(raw) ? raw.rows : (raw as Referral[]);
        const foundReferral = referral[0];

        if (!foundReferral) {
            return res.status(404).json({ message: 'Referral not found' });
        }
        res.json(foundReferral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};