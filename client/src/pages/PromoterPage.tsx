import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { SectionHeading } from '../components/ui/SectionHeading';


import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const PromoterPage = () => {
    const [referral, setReferral] = useState<any>(null);
    const [code, setCode] = useState('');
    const [commissionRate, setCommissionRate] = useState<number | string>(0.1); // Allow string for input
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReferral = async () => {
            try {
                const { data } = await api.get('/referrals/me');
                setReferral(data);
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    setReferral(null); // No referral found, show creation form
                } else {
                    toast.error(error.response?.data?.message || 'Failed to fetch referral information.');
                    console.error(error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchReferral();
    }, []);

    const createReferral = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!code.trim()) {
            toast.error('Referral code cannot be empty.');
            return;
        }
        const rate = parseFloat(commissionRate as string);
        if (isNaN(rate) || rate <= 0 || rate > 1) {
            toast.error('Commission rate must be a number between 0.01 and 1 (e.g., 0.1 for 10%).');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post('/referrals', { code: code.trim(), commissionRate: rate });
            setReferral(data);
            toast.success('Referral code created successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create referral code.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-10 text-center">
                <p>Loading promoter information...</p>
            </Container>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="overflow-x-hidden"
        >
            <Container className="py-10 space-y-8">
                {!referral ? (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                        <SectionHeading
                            title="Apply for Affiliate Program"
                            description="Create your unique referral code to start earning commissions. Share this code with others, and you'll earn a percentage of every sale made through your link."
                            className="text-center mb-6"
                        />
                        <form onSubmit={createReferral} className="space-y-4">
                            <InputField
                                label="Referral Code"
                                id="referralCode"
                                type="text"
                                placeholder="e.g., MYPROMO10"
                                value={code}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                                required
                                helpText="This code will be part of your unique referral link."
                            />
                            <InputField
                                label="Commission Rate (e.g., 0.1 for 10%)"
                                id="commissionRate"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max="1"
                                placeholder="e.g., 0.1"
                                value={commissionRate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommissionRate(e.target.value)}
                                required
                                helpText="Enter a value between 0.01 (1%) and 1 (100%)."
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Referral Code'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                        <SectionHeading
                            title="Promoter Dashboard"
                            description="Your affiliate program details and earnings."
                            className="text-center mb-6"
                        />
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p><strong>Your Referral Code:</strong> <span className="font-mono text-blue-600 dark:text-blue-400">{referral.code}</span></p>
                            <p><strong>Commission Rate:</strong> <span className="font-bold text-green-600 dark:text-green-400">{referral.commissionRate * 100}%</span></p>
                            <p><strong>Referred Users:</strong> {referral.referredUsers?.length || 0}</p>
                            <p>
                                <strong>Total Earnings:</strong>{' '}
                                <span className="font-bold text-purple-600 dark:text-purple-400">
                                    ${(referral.commissions?.reduce((acc: number, commission: any) => acc + commission.amount, 0) / 100 || 0).toFixed(2)}
                                </span>
                            </p>
                            {/* You might want to add a list of referred users or commissions here */}
                        </div>
                    </div>
                )}
            </Container>
        </motion.div>
    );
};

export default PromoterPage;