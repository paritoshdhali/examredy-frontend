import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MCQSession from '../components/MCQSession';

const Group = () => {
    const [step, setStep] = useState('menu'); // 'menu', 'lobby', 'active', 'results'
    const [sessionCode, setSessionCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [participants, setParticipants] = useState([]); // In a real app we'd poll or use sockets
    const [error, setError] = useState('');
    const [questions, setQuestions] = useState([]); // Group questions

    const createSession = async () => {
        try {
            const res = await api.post('/group/create');
            setSessionCode(res.data.code);
            setStep('lobby');
        } catch (err) {
            setError('Failed to create session');
        }
    };

    const joinSession = async () => {
        try {
            await api.post('/group/join', { code: inputCode });
            setSessionCode(inputCode);
            setStep('lobby');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join session');
        }
    };

    const startSession = async () => {
        // In a real app, host signals start -> sockets notify all -> fetch questions
        // For now, we simulate "Start" by fetching questions (assuming they are pre-determined or random)
        // Group questions logic not fully implemented in backend "start" route?
        // Let's just fetch random practice questions for the group for now.
        try {
            const res = await api.get('/mcq/practice?category_id=1'); // Default cat
            setQuestions(res.data);
            setStep('active');
        } catch (err) {
            setError('Failed to start session');
        }
    };

    if (step === 'active') {
        return (
            <div className="container mx-auto px-4 py-8">
                <MCQSession
                    questions={questions}
                    mode="group"
                    sessionId={sessionCode}
                    onComplete={() => setStep('results')}
                />
            </div>
        );
    }

    if (step === 'results') {
        return <Leaderboard sessionId={sessionCode} />;
    }

    if (step === 'lobby') {
        return (
            <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-4">Lobby</h2>
                <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-500 mb-1">Session Code</p>
                    <p className="text-4xl font-mono font-bold tracking-widest text-primary">{sessionCode}</p>
                </div>
                <p className="mb-8 text-gray-600">Share this code with your friends to join.</p>

                <button onClick={startSession} className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
                    Start Competition
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">Group Competition</h1>

            {error && <div className="max-w-md mx-auto bg-red-100 text-red-700 p-4 rounded-lg mb-8 text-center">{error}</div>}

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <h3 className="text-xl font-bold mb-4">Create New Session</h3>
                    <p className="text-gray-600 mb-6">Host a competition and invite friends.</p>
                    <button onClick={createSession} className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Create Session</button>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <h3 className="text-xl font-bold mb-4">Join Session</h3>
                    <p className="text-gray-600 mb-6">Enter code to join existing room.</p>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="CODE"
                            className="flex-1 border px-4 py-2 rounded-lg focus:ring-primary focus:border-primary uppercase"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                        />
                        <button onClick={joinSession} className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition">Join</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Leaderboard = ({ sessionId }) => {
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get(`/group/${sessionId}/leaderboard`);
                setResults(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLeaderboard();
        // Poll every 5 seconds?
    }, [sessionId]);

    return (
        <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8">Leaderboard</h2>
            <div className="space-y-4">
                {results.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-4 ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}>
                                #{index + 1}
                            </span>
                            <span className="font-semibold text-gray-800">{entry.username}</span>
                        </div>
                        <span className="font-bold text-primary">{entry.score} pts</span>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <button onClick={() => window.location.href = '/practice'} className="text-primary hover:text-indigo-800 font-medium">Return to Practice</button>
            </div>
        </div>
    );
};

export default Group;
