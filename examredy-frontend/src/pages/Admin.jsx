import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Admin = () => {
    const [stats, setStats] = useState(null);
    const [topic, setTopic] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/admin/stats').then(res => setStats(res.data)).catch(err => console.error(err));
    }, []);

    const generateMCQs = async () => {
        try {
            setMsg('Generating...');
            await api.post('/mcq/generate', { topic, category_id: 1, count: 5 });
            setMsg('Generated 5 MCQs successfully!');
        } catch (err) {
            setMsg('Failed to generate.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {stats && (
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-500 text-sm">Total Users</div>
                        <div className="text-3xl font-bold">{stats.totalUsers}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-500 text-sm">Premium Users</div>
                        <div className="text-3xl font-bold">{stats.premiumUsers}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-500 text-sm">Revenue</div>
                        <div className="text-3xl font-bold">₹{stats.totalRevenue}</div>
                    </div>
                </div>
            )}

            <div className="bg-white p-8 rounded-lg shadow max-w-xl">
                <h2 className="text-xl font-bold mb-4">AI MCQ Generator</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter Topic (e.g. Physics, History)"
                        className="w-full border p-2 rounded"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <button onClick={generateMCQs} className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Generate & Add to Pool
                    </button>
                    {msg && <p className="text-sm text-gray-600">{msg}</p>}
                </div>
            </div>
        </div>
    );
};

export default Admin;
