import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Prime = () => {
    const { user: authUser } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = authUser || JSON.parse(localStorage.getItem('user')) || { username: 'Guest', email: 'guest@example.com', id: '1' };

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await api.get('/subscription/plans');
                if (res.data) {
                    setPlans(res.data);
                }
            } catch (err) {
                console.error("Failed to load plans:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBuy = async (planId, price) => {
        const res = await loadRazorpay();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            // 0. Get Public Config (Key ID)
            const configRes = await api.get('/subscription/config');
            const { key_id } = configRes.data;

            // 1. Create Order
            const orderRes = await api.post('/subscription/create-order', { planId });
            const order = orderRes.data;

            // 2. Initialize Razorpay
            const options = {
                key: key_id,
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
                        alert('Payment Successful! Sessions Added to your account.');
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
                    color: "#2563EB"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error("Payment initiation failed", err);
            const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
            alert(`Failed to start payment: ${msg}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Upgrade to <span className="text-yellow-500">Prime 👑</span></h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Unlock high-quality practice sessions, exclusive group features, and an ad-free learning experience.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 mb-16">
                        <div className="text-5xl mb-4">⌛</div>
                        <h3 className="text-xl font-bold text-gray-800">No active plans available right now</h3>
                        <p className="text-gray-500">Please check back later or contact support.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {plans.map((plan) => (
                            <div key={plan.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
                                <div className="p-8 text-center flex flex-col h-full">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{plan.name}</h3>
                                    <div className="text-5xl font-extrabold text-blue-600 mb-2">₹{plan.price}</div>
                                    <p className="text-emerald-600 font-bold mb-8">{plan.sessions_limit} Premium Sessions</p>

                                    <ul className="text-gray-600 text-left space-y-3 mb-8 flex-1">
                                        <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> {plan.sessions_limit} AI-Powered Sessions</li>
                                        <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Instant Analysis</li>
                                        <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> {plan.referral_bonus_sessions} Sessions Referral Bonus</li>
                                    </ul>

                                    <button
                                        onClick={() => handleBuy(plan.id, plan.price)}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg transform hover:scale-105"
                                    >
                                        Get Started
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Referral Section */}
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">🎁 Refer a Friend & Earn Prime</h2>
                        <p className="mb-8 text-lg opacity-90 max-w-2xl mx-auto">
                            Share your unique link. When they subscribe, you both get <span className="font-bold underline">Bonus Sessions</span> instantly!
                        </p>

                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl flex items-center justify-between border border-white/20 max-w-xl mx-auto">
                            <code className="text-sm md:text-lg font-mono px-4 truncate flex-1 text-left">
                                {window.location.origin}/register?ref={user?.id}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.id}`);
                                    alert('Link Copied!');
                                }}
                                className="bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition shadow-md whitespace-nowrap"
                            >
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Prime;

