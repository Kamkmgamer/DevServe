import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getCommissions = async (req: Request, res: Response) => {
    try {
        const commissions = await prisma.commission.findMany({
            include: {
                order: true,
                referral: true,
            },
        });
        res.json(commissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCommission = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const commission = await prisma.commission.findUnique({
            where: { id },
            include: {
                order: true,
                referral: true,
            },
        });
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
        const updatedCommission = await prisma.commission.update({
            where: { id },
            data: {
                status,
            },
        });

        res.json(updatedCommission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};