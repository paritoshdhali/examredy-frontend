import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MCQSession from '../components/MCQSession';

const Group = () => {
    const [step, setStep] = useState('menu'); // 'menu', 'lobby', 'active', 'results'
    const [sessionCode, setSessionCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Create a new session
    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/group/create'); // Updated to use axios instance
            setSessionCode(res.data.code);
            setStep('lobby');
            setParticipants([{ username: 'You (Host)', isHost: true }]);
        } catch (err) {
            setError('Failed to create session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Join existing session
    const handleJoin = async () => {
        if (!inputCode) return;
        setLoading(true);
        try {
            await api.post('/group/join', { code: inputCode }); // Code must be in the body, not url
            setSessionCode(inputCode);
            setStep('lobby');
            setParticipants([{ username: 'You', isHost: false }]);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Session Code');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        // In real app, Host triggers start event via socket
        setStep('active');
    };

    if (step === 'active') {
        return (
            <MCQSession
                categoryId="1" // Default or passed from lobby settings
                mode="group"
                sessionId={sessionCode}
                onComplete={() => setStep('results')}
            />
        );
    }

    if (step === 'results') {
        return <Leaderboard sessionId={sessionCode} />;
    }

    if (step === 'lobby') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold mb-6">
                        🟢 Lobby Active
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Waiting Room</h2>
                    <p className="text-gray-500 mb-8">Share code with friends to join.</p>

                    <div className="bg-gray-100 rounded-2xl p-6 mb-8 border-2 border-dashed border-gray-300">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-2">Session Code</p>
                        <div className="text-5xl font-mono font-bold text-blue-600 tracking-wider select-all">
                            {sessionCode}
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h3 className="text-left text-sm font-bold text-gray-400 uppercase">Participants ({participants.length})</h3>
                        {participants.map((p, i) => (
                            <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                                    {p.username[0]}
                                </div>
                                <span className="font-medium text-gray-700">{p.username}</span>
                                {p.isHost && <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">HOST</span>}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg transition transform hover:-translate-y-1"
                    >
                        Start Competition 🚀
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">

                {/* Intro Side */}
                <div className="text-white flex flex-col justify-center">
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                        Compete with <br /> <span className="text-yellow-400">Friends</span>
                    </h1>
                    <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                        Create a private lobby, invite your study group, and solve MCQs together in real-time. See who tops the leaderboard!
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-blue-600 bg-gray-300" />
                            ))}
                        </div>
                        <span className="text-sm font-medium opacity-80">100+ Students online</span>
                    </div>
                </div>

                {/* Action Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Group Mode</h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-blue-700 transition"
                        >
                            {loading ? 'Creating...' : 'Create New Lobby'}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR JOIN EXISTING</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="ENTER CODE (e.g. A1B2)"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-mono text-center text-lg uppercase tracking-widest focus:border-blue-500 focus:ring-0 outline-none transition"
                            />
                            <button
                                onClick={handleJoin}
                                disabled={!inputCode || loading}
                                className="w-full mt-4 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Join Lobby
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Leaderboard = ({ sessionId }) => {
    const [results, setResults] = useState([]);

    useEffect(() => {
        // Mock results for now since backend might not return data without real submissions
        setResults([
            { username: 'You', score: 85 },
            { username: 'Player 2', score: 70 },
            { username: 'Player 3', score: 65 }
        ]);
        /* 
        const fetchLeaderboard = async () => {
            const res = await getGroupLeaderboard(sessionId);
            setResults(res.data);
        };
        fetchLeaderboard();
        */
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🏆</div>
                    <h2 className="text-3xl font-bold text-gray-900">Final Leaderboard</h2>
                </div>

                <div className="space-y-4">
                    {results.map((r, i) => (
                        <div key={i} className={`flex items-center p-4 rounded-xl border-2 ${i === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 bg-white'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${i === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {i + 1}
                            </div>
                            <div className="flex-1 font-bold text-gray-800 text-lg">{r.username}</div>
                            <div className="font-mono font-bold text-blue-600 text-xl">{r.score} pts</div>
                        </div>
                    ))}
                </div>

                <button onClick={() => window.location.href = '/practice'} className="w-full mt-8 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition">
                    Back to Practice
                </button>
            </div>
        </div>
    );
};

export default Group;

