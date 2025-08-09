import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const PromoterPage = () => {
    const [referral, setReferral] = useState<any>(null);
    const [code, setCode] = useState('');
    const [commissionRate, setCommissionRate] = useState(0.1);

    useEffect(() => {
        const fetchReferral = async () => {
            try {
                const { data } = await api.get('/referrals/me');
                setReferral(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchReferral();
    }, []);

    const createReferral = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/referrals', { code, commissionRate });
            setReferral(data);
        } catch (error) {
            console.error(error);
        }
    };

    if (!referral) {
        return (
            <div>
                <h1>Create a Referral Code</h1>
                <form onSubmit={createReferral}>
                    <input
                        type="text"
                        placeholder="Referral Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Commission Rate"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                    />
                    <button type="submit">Create</button>
                </form>
            </div>
        );
    }

    return (
        <div>
            <h1>Promoter Dashboard</h1>
            <p>Referral Code: {referral.code}</p>
            <p>Commission Rate: {referral.commissionRate * 100}%</p>
            <p>Referred Users: {referral.referredUsers.length}</p>
            <p>Total Earnings: ${referral.commissions.reduce((acc: number, commission: any) => acc + commission.amount, 0) / 100}</p>
        </div>
    );
};

export default PromoterPage;