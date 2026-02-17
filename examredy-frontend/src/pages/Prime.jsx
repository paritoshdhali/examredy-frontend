import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Prime = () => {
    const [plans, setPlans] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        api.get('/subscription/plans').then(res => setPlans(res.data)).catch(err => console.error(err));
    }, []);

    const handleBuy = async (planId) => {
        try {
            // 1. Create Order
            const orderRes = await api.post('/subscription/create-order', { planId });
            const order = orderRes.data;

            // 2. Initialize Razorpay
            const options = {
                key: "YOUR_RAZORPAY_KEY_ID_PLACEHOLDER", // Replace with env var in real app
                amount: order.amount,
                currency: order.currency,
                name: "ExamRedy",
                description: "Premium Subscription",
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        await api.post('/subscription/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId
                        });
                        alert('Payment Successful! Subscription Active.');
                        window.location.reload();
                    } catch (err) {
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: user.username,
                    email: user.email,
                },
                theme: {
                    color: "#4F46E5"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Payment initiation failed", err);
            alert('Failed to start payment');
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Upgrade to Prime 👑</h1>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                Unlock unlimited practice, exclusive group features, and ad-free experience.
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition transform hover:-translate-y-1">
                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                            <div className="text-4xl font-bold text-primary mb-4">₹{plan.price}</div>
                            <p className="text-gray-500 mb-8">{plan.duration_hours} Hours Access</p>
                            <button
                                onClick={() => handleBuy(plan.id)}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Referral Section */}
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white text-center">
                <h2 className="text-2xl font-bold mb-4">🎁 Refer a Friend & Earn Prime</h2>
                <p className="mb-6 opacity-90">Share your unique link. When they practice for 2 days, you get 1.5 hours of Prime FREE!</p>

                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between border border-white/30">
                    <code className="text-lg font-mono">http://localhost:5173/register?ref={user?.id}</code>
                    <button
                        onClick={() => navigator.clipboard.writeText(`http://localhost:5173/register?ref=${user?.id}`)}
                        className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition"
                    >
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Prime;
