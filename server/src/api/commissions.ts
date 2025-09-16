import { Request, Response } from 'express';
import { db } from '../lib/db';
import { commissions } from '../lib/schema';
import { eq } from 'drizzle-orm';

export const getCommissions = async (req: Request, res: Response) => {
    try {
        const allCommissions = await db.select().from(commissions);
        res.json(allCommissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCommission = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const commissionResult = await db.select().from(commissions).where(eq(commissions.id, id));
        const commission = commissionResult[0];

        if (!commission) {
            return res.status(404).json({ message: 'Commission not found' });
        }
        res.json(commission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCommission = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updateResult = await db.update(commissions).set({ status }).where(eq(commissions.id, id)).returning();
        const updatedCommission = updateResult[0];

        res.json(updatedCommission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};