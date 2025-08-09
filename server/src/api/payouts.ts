import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createPayout = async (req: Request, res: Response) => {
    const { referralId, amount } = req.body;

    try {
        const payout = await prisma.payout.create({
            data: {
                referralId,
                amount,
            },
        });

        await prisma.commission.updateMany({
            where: {
                referralId,
                status: 'UNPAID',
            },
            data: {
                status: 'PAID',
                payoutId: payout.id,
            },
        });

        res.status(201).json(payout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPayouts = async (req: Request, res: Response) => {
    try {
        const payouts = await prisma.payout.findMany({
            include: {
                commissions: true,
            },
        });
        res.json(payouts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPayout = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const payout = await prisma.payout.findUnique({
            where: { id },
            include: {
                commissions: true,
            },
        });
        if (!payout) {
            return res.status(404).json({ message: 'Payout not found' });
        }
        res.json(payout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};