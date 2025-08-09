import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createReferral = async (req: Request, res: Response) => {
    const { code, commissionRate } = req.body;
    const userId = (req as any).user.id;

    try {
        const existingReferral = await prisma.referral.findFirst({
            where: {
                OR: [
                    { userId },
                    { code },
                ],
            },
        });

        if (existingReferral) {
            return res.status(400).json({ message: 'User already has a referral code or code is already in use' });
        }

        const referral = await prisma.referral.create({
            data: {
                userId,
                code,
                commissionRate,
            },
        });

        res.status(201).json(referral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getReferrals = async (req: Request, res: Response) => {
    try {
        const referrals = await prisma.referral.findMany({
            include: {
                _count: {
                    select: {
                        referredUsers: true,
                        orders: true,
                        commissions: true,
                    },
                },
            },
        });
        res.json(referrals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getReferral = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const referral = await prisma.referral.findUnique({
            where: { id },
            include: {
                referredUsers: true,
                orders: true,
                commissions: true,
            },
        });
        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }
        res.json(referral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateReferral = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { code, commissionRate } = req.body;
    const userId = (req as any).user.id;

    try {
        const referral = await prisma.referral.findUnique({
            where: { id },
        });

        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        if (referral.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this referral' });
        }

        const updatedReferral = await prisma.referral.update({
            where: { id },
            data: {
                code,
                commissionRate,
            },
        });

        res.json(updatedReferral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteReferral = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.referral.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyReferral = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        const referral = await prisma.referral.findUnique({
            where: { userId },
            include: {
                referredUsers: true,
                orders: true,
                commissions: true,
            },
        });

        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        res.json(referral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};