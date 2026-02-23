import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
    CheckSquare, Clock, CheckCircle2, XCircle, Edit3, Trash2,
    Upload, Search, Filter, ChevronLeft, ChevronRight, X,
    AlertCircle, FileText, Database, Layers, BookOpen, Tag
} from 'lucide-react';

const Toast = ({ msg, type }) => {
    if (!msg) return null;
    return (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
            <p className="text-sm font-black uppercase tracking-widest">{msg}</p>
        </div>
    );
};

export const MCQModeration = () => {
    const [mcqs, setMcqs] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    // Modals
    const [editingMcq, setEditingMcq] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkJson, setBulkJson] = useState('');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [listRes, statsRes] = await Promise.all([
                api.get(`/admin/mcqs?page=${page}&status=${statusFilter}`),
                api.get('/admin/mcqs/stats')
            ]);
            setMcqs(listRes.data);
            setStats(statsRes.data);
        } catch (e) {
            showToast('Failed to sync data', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/mcqs/${id}/approve`);
            showToast('Question synchronized to pool');
            fetchData();
        } catch (e) { showToast('Approval failed', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Eject this question from the database?')) return;
        try {
            await api.delete(`/admin/mcqs/${id}`);
            showToast('Question deleted');
            fetchData();
        } catch (e) { showToast('Operation failed', 'error'); }
    };

    const handleSaveEdit = async () => {
        try {
            await api.put(`/admin/mcqs/${editingMcq.id}`, editingMcq);
            showToast('MCQ content updated');
            setEditingMcq(null);
            fetchData();
        } catch (e) { showToast('Update failed', 'error'); }
    };

    const handleBulkUpload = async () => {
        try {
            const parsed = JSON.parse(bulkJson);
            const mcqsArray = Array.isArray(parsed) ? parsed : [parsed];
            await api.post('/admin/mcqs/bulk', { mcqs: mcqsArray });
            showToast('Bulk synchronization successful');
            setShowBulkModal(false);
            setBulkJson('');
            fetchData();
        } catch (e) { showToast('Invalid JSON format or Upload failed', 'error'); }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Metrics Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 bg-gray-950 border border-gray-800 p-8 rounded-[2.5rem] flex flex-col justify-center">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <CheckSquare className="text-orange-500" size={40} />
                        MCQ Moderation
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-2 uppercase tracking-[0.2em]">
                        Ensuring integrity in the AI-powered learning stream
                    </p>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Queue Size</p>
                    <div className="text-3xl font-black text-orange-400">{stats.pending}</div>
                    <div className="w-12 h-1 bg-orange-500/20 rounded-full mt-3"></div>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Verified Pool</p>
                    <div className="text-3xl font-black text-emerald-400">{stats.approved}</div>
                    <div className="w-12 h-1 bg-emerald-500/20 rounded-full mt-3"></div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-gray-900/40 p-4 rounded-3xl border border-gray-800/50 backdrop-blur-md">
                <div className="flex bg-gray-950 p-1.5 rounded-2xl border border-gray-800 self-stretch lg:self-auto">
                    {['pending', 'approved', 'all'].map(status => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 self-stretch lg:self-auto">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-700 transition-all"
                    >
                        <Upload size={16} /> Bulk Sync
                    </button>
                </div>
            </div>

            {/* Questions Stream */}
            <div className="space-y-6">
                {mcqs.map((mcq, idx) => (
                    <div key={mcq.id} className="bg-gray-900/50 border border-gray-800 p-8 rounded-[2rem] hover:border-orange-500/20 transition-all group relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                {/* hierarchy badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-950 border border-gray-800 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                        <Layers size={10} /> {mcq.subject || 'GENERAL'}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-950 border border-gray-800 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                        <BookOpen size={10} /> {mcq.chapter || 'UNASSIGNED'}
                                    </span>
                                    <span className={`flex items-center gap-1.5 px-3 py-1 border text-[9px] font-black uppercase tracking-widest rounded-lg ${mcq.difficulty === 'hard' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                            mcq.difficulty === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        }`}>
                                        <Tag size={10} /> {mcq.difficulty || 'MEDIUM'}
                                    </span>
                                    {mcq.is_approved ? (
                                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg">VERIFIED</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-widest rounded-lg">PENDING REVIEW</span>
                                    )}
                                </div>

                                {/* question text */}
                                <div className="space-y-4">
                                    <h4 className="text-xl font-black text-white leading-relaxed tracking-tight group-hover:text-orange-400 transition-colors">
                                        <span className="text-gray-700 mr-3 text-sm font-mono">#{mcq.id}</span>
                                        {mcq.question}
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(typeof mcq.options === 'string' ? JSON.parse(mcq.options) : mcq.options).map(([key, val], i) => (
                                            <div key={key} className={`p-4 rounded-xl border text-sm font-bold flex items-center justify-between transition-all ${i + 1 === mcq.correct_option
                                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                                    : 'bg-gray-950/50 border-gray-800 text-gray-500'
                                                }`}>
                                                <span>{val}</span>
                                                {i + 1 === mcq.correct_option && <CheckCircle2 size={16} />}
                                            </div>
                                        ))}
                                    </div>

                                    {mcq.explanation && (
                                        <div className="p-5 bg-gray-950 rounded-2xl border-l-4 border-indigo-500/50">
                                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2 italic">
                                                <FileText size={12} /> Insight Explanation
                                            </p>
                                            <p className="text-gray-400 text-sm italic font-medium leading-relaxed">{mcq.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* operations */}
                            <div className="flex flex-row lg:flex-col items-center justify-end gap-3 min-w-[140px]">
                                {!mcq.is_approved && (
                                    <button
                                        onClick={() => handleApprove(mcq.id)}
                                        className="flex-1 w-full flex items-center justify-center gap-2 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/10 transition-all hover:scale-105"
                                    >
                                        <CheckCircle2 size={16} /> Approve
                                    </button>
                                )}
                                <button
                                    onClick={() => setEditingMcq(mcq)}
                                    className="p-4 bg-gray-800 hover:bg-indigo-500/10 border border-gray-700 hover:border-indigo-500/30 text-gray-400 hover:text-indigo-400 rounded-2xl transition-all"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(mcq.id)}
                                    className="p-4 bg-gray-800 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/30 text-gray-400 hover:text-red-400 rounded-2xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="p-8 bg-gray-900 border border-gray-800 rounded-[2rem] flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Stream Page: {page}</p>
                <div className="flex gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-20 text-white rounded-xl transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* MODAL: EDIT MCQ */}
            {editingMcq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/70 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 scroll-smooth">
                        <div className="p-8 border-b border-gray-800 bg-gray-800/20 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Edit3 className="text-indigo-500" /> Adjust Parameters
                            </h3>
                            <button onClick={() => setEditingMcq(null)} className="p-2 hover:bg-gray-800 rounded-2xl text-gray-500 hover:text-white transition-all"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Question content</label>
                                <textarea
                                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[100px]"
                                    value={editingMcq.question}
                                    onChange={e => setEditingMcq({ ...editingMcq, question: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.keys(typeof editingMcq.options === 'string' ? JSON.parse(editingMcq.options) : editingMcq.options).map((key, i) => (
                                    <div key={key} className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1 flex justify-between">
                                            Option {i + 1}
                                            <input
                                                type="radio"
                                                name="correct"
                                                checked={editingMcq.correct_option === i + 1}
                                                onChange={() => setEditingMcq({ ...editingMcq, correct_option: i + 1 })}
                                                className="accent-emerald-500"
                                            />
                                        </label>
                                        <input
                                            className={`w-full bg-gray-950 border rounded-xl py-3 px-5 text-white text-xs font-bold focus:outline-none transition-all ${editingMcq.correct_option === i + 1 ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-gray-800'
                                                }`}
                                            value={(typeof editingMcq.options === 'string' ? JSON.parse(editingMcq.options) : editingMcq.options)[key]}
                                            onChange={e => {
                                                const opts = typeof editingMcq.options === 'string' ? JSON.parse(editingMcq.options) : { ...editingMcq.options };
                                                opts[key] = e.target.value;
                                                setEditingMcq({ ...editingMcq, options: opts });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Subject</label>
                                    <input className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-5 text-white text-xs font-bold" value={editingMcq.subject || ''} onChange={e => setEditingMcq({ ...editingMcq, subject: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Chapter</label>
                                    <input className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-5 text-white text-xs font-bold" value={editingMcq.chapter || ''} onChange={e => setEditingMcq({ ...editingMcq, chapter: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Detailed Explanation</label>
                                <textarea
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-4 px-6 text-gray-300 font-medium italic text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[120px]"
                                    value={editingMcq.explanation || ''}
                                    onChange={e => setEditingMcq({ ...editingMcq, explanation: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleSaveEdit}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 mt-4 hover:scale-[1.01] transition-all"
                            >
                                Persist Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: BULK UPLOAD */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/70 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in scale-95 duration-200">
                        <div className="p-8 border-b border-gray-800 bg-gray-800/20 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Database className="text-emerald-500" /> Mass Synchronization
                            </h3>
                            <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-gray-800 rounded-2xl text-gray-500 hover:text-white transition-all"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl flex gap-4">
                                <AlertCircle className="text-emerald-500 shrink-0" size={20} />
                                <div className="text-[10px] text-emerald-400 font-bold leading-relaxed">
                                    <p className="uppercase tracking-widest mb-1 font-black underline">Protocol Specification:</p>
                                    <p>JSON format: <code className="bg-gray-900 px-1 py-0.5 rounded">{"{ \"question\": \"...\", \"options\": { \"1\": \"...\", \"2\": \"...\", \"3\": \"...\", \"4\": \"...\" }, \"correct_option\": 1, \"explanation\": \"...\", \"subject\": \"...\", \"chapter\": \"...\" }"}</code></p>
                                    <p className="mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> All bulk imports are automatically marked as VERIFIED.</p>
                                </div>
                            </div>
                            <textarea
                                className="w-full h-80 bg-gray-950 border border-gray-800 rounded-2xl py-6 px-8 text-emerald-400 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none custom-scrollbar"
                                placeholder="PASTE MCQ JSON ARRAY HERE..."
                                value={bulkJson}
                                onChange={e => setBulkJson(e.target.value)}
                            />
                            <button
                                onClick={handleBulkUpload}
                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:scale-[1.01] transition-all"
                            >
                                Initiate Sync Protocol
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MCQModeration;
