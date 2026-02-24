import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrimePopup = ({ onClose }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border-4 border-amber-400">
                {/* Close button removed to enforce subscription/sharing */}
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-white text-center">
                    <div className="text-5xl mb-4">🛑</div>
                    <h2 className="text-3xl font-black mb-2">Sessions Exhausted</h2>
                    <p className="font-medium text-lg">You have used up all your available sessions.</p>
                </div>

                <div className="p-6 bg-gray-50 text-center border-b border-gray-100">
                    <p className="text-gray-800 font-bold text-lg mb-1">Want to keep practicing?</p>
                    <p className="text-gray-600 text-sm">Unlock Prime or refer a friend to get more sessions instantly.</p>
                </div>

                <div className="p-6 grid gap-4 bg-white">
                    <button onClick={() => { onClose?.(); navigate('/prime'); }} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl p-4 flex justify-between items-center hover:shadow-lg transition transform hover:-translate-y-1 shadow-md">
                        <div className="text-left">
                            <h3 className="font-black text-xl drop-shadow-sm">🚀 Get Prime Sessions</h3>
                            <p className="text-sm font-medium opacity-90 drop-shadow-sm">Plans starting at just ₹10</p>
                        </div>
                        <span className="bg-white text-orange-600 px-4 py-2 rounded-full font-black shadow-sm">View Plans</span>
                    </button>

                    <button onClick={() => { onClose?.(); navigate('/prime'); }} className="w-full border-2 border-green-500 bg-green-50 text-green-700 rounded-2xl p-4 flex justify-between items-center hover:bg-green-100 transition transform hover:-translate-y-1 shadow-sm">
                        <div className="text-left">
                            <h3 className="font-black text-xl">🎁 Refer & Earn</h3>
                            <p className="text-sm font-medium opacity-90">Get Bonus Sessions per friend</p>
                        </div>
                        <span className="bg-green-500 text-white px-4 py-2 rounded-full font-black shadow-sm">Get Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrimePopup;
