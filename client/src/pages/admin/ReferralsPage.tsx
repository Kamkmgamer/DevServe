import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';

const ReferralsPage = () => {
    const [referrals, setReferrals] = useState<any[]>([]);
    const [selectedReferral, setSelectedReferral] = useState<any>(null);

    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                console.log('Making API call to /referrals');
                const { data } = await api.get('/referrals');
                setReferrals(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchReferrals();
    }, []);

    const createPayout = async (referralId: string, amount: number) => {
        try {
            await api.post('/payouts', { referralId, amount });
            // Refresh the referrals data
            const { data } = await api.get('/referrals');
            setReferrals(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Referrals</h1>
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Code</th>
                        <th>Commission Rate</th>
                        <th>Referred Users</th>
                        <th>Orders</th>
                        <th>Total Earnings</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {referrals.map((referral) => (
                        <tr key={referral.id}>
                            <td>{referral.userId}</td>
                            <td>{referral.code}</td>
                            <td>{referral.commissionRate * 100}%</td>
                            <td>{referral._count.referredUsers}</td>
                            <td>{referral._count.orders}</td>
                            <td>${referral.commissions.reduce((acc: number, commission: any) => acc + commission.amount, 0) / 100}</td>
                            <td>
                                <button onClick={() => setSelectedReferral(referral)}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedReferral && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{selectedReferral.code}</h2>
                        <p>User ID: {selectedReferral.userId}</p>
                        <p>Commission Rate: {selectedReferral.commissionRate * 100}%</p>
                        <h3>Commissions</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedReferral.commissions.map((commission: any) => (
                                    <tr key={commission.id}>
                                        <td>{commission.orderId}</td>
                                        <td>${commission.amount / 100}</td>
                                        <td>{commission.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            onClick={() =>
                                createPayout(
                                    selectedReferral.id,
                                    selectedReferral.commissions.reduce(
                                        (acc: number, commission: any) =>
                                            commission.status === 'UNPAID' ? acc + commission.amount : acc,
                                        0
                                    )
                                )
                            }
                        >
                            Create Payout
                        </button>
                        <button onClick={() => setSelectedReferral(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralsPage;