import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrimePopup = ({ onClose }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    ✕
                </button>

                <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">Daily Limit Reached! 🚀</h2>
                    <p>Upgrade to Prime to continue your streak.</p>
                </div>

                <div className="p-6 grid gap-4">
                    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition" onClick={() => navigate('/prime')}>
                        <div>
                            <h3 className="font-bold text-gray-800">1 Hour Pass</h3>
                            <p className="text-sm text-gray-600">Uninterrupted access</p>
                        </div>
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full font-bold">₹10</span>
                    </div>

                    <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition" onClick={() => navigate('/prime')}>
                        <div>
                            <h3 className="font-bold text-gray-800">3 Hour Pass</h3>
                            <p className="text-sm text-gray-600">Best Value</p>
                        </div>
                        <span className="bg-primary text-white px-3 py-1 rounded-full font-bold">₹25</span>
                    </div>

                    <div className="border border-green-200 bg-green-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition" onClick={() => navigate('/prime?tab=referral')}>
                        <h3 className="font-bold text-green-700">🎁 Refer & Earn</h3>
                        <p className="text-sm text-green-600">Get 1.5 Hours Free per friend</p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 text-center">
                    <button onClick={onClose} className="text-gray-500 text-sm hover:underline">Maybe later</button>
                </div>
            </div>
        </div>
    );
};

export default PrimePopup;
