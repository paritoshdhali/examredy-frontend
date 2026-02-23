import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
    Cpu, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle,
    Loader2, Eye, EyeOff, Zap, Globe, ChevronDown, Clock, X
} from 'lucide-react';

const Toast = ({ msg, type }) => msg ? (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2 animate-fadeIn ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
        {msg}
    </div>
) : null;

const PRESET_PROVIDERS = [
    {
        name: 'OpenRouter',
        base_url: 'https://openrouter.ai/api/v1',
        model_name: 'meta-llama/llama-3.1-8b-instruct:free',
        hint: 'Get free key at openrouter.ai — supports 200+ models'
    },
    {
        name: 'Google Gemini',
        base_url: 'https://generativelanguage.googleapis.com/v1beta/models',
        model_name: 'gemini-1.5-flash',
        hint: 'Free tier available at aistudio.google.com'
    },
    {
        name: 'Groq (Fast)',
        base_url: 'https://api.groq.com/openai/v1',
        model_name: 'llama-3.1-8b-instant',
        hint: 'Extremely fast inference, free tier at groq.com'
    },
    {
        name: 'OpenAI',
        base_url: 'https://api.openai.com/v1',
        model_name: 'gpt-4o-mini',
        hint: 'Official OpenAI API — paid'
    },
];

export function NeuralHub() {
    const [providers, setProviders] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [fetchingModels, setFetchingModels] = useState(null);
    const [availableModels, setAvailableModels] = useState({});
    const [showKey, setShowKey] = useState({});
    const [activating, setActivating] = useState(null);

    const [form, setForm] = useState({
        name: '', base_url: '', api_key: '', model_name: ''
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [pRes, lRes] = await Promise.all([
                api.get('/admin/ai-providers'),
                api.get('/ai-fetch/logs').catch(() => ({ data: [] }))
            ]);
            setProviders(pRes.data || []);
            setLogs((lRes.data || []).slice(0, 20));
        } catch (e) {
            showToast('Failed to load providers: ' + (e.response?.data?.error || e.message), 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const applyPreset = (preset) => {
        setForm(f => ({ ...f, name: preset.name, base_url: preset.base_url, model_name: preset.model_name }));
    };

    const fetchModels = async (provider, isFromForm = false) => {
        const id = isFromForm ? 'form' : (provider.id || 'form');
        setFetchingModels(id);
        try {
            const r = await api.post('/admin/ai-providers/fetch-models', {
                base_url: provider.base_url || form.base_url,
                api_key: provider.api_key || form.api_key
            });
            if (r.data.models?.length > 0) {
                setAvailableModels(prev => ({ ...prev, [id]: r.data.models }));
                showToast(`${r.data.models.length} models loaded!`);
            } else {
                showToast('No models returned from provider', 'error');
            }
        } catch (e) {
            showToast(e.response?.data?.error || e.message, 'error');
        } finally {
            setFetchingModels(null);
        }
    };

    const handleSave = async () => {
        if (!form.name || !form.api_key || !form.model_name) {
            return showToast('Name, API Key, and Model Name are required', 'error');
        }
        try {
            if (editingId) {
                await api.put(`/admin/ai-providers/${editingId}`, form);
                showToast('Provider updated!');
            } else {
                await api.post('/admin/ai-providers', form);
                showToast('Provider added!');
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ name: '', base_url: '', api_key: '', model_name: '' });
            load();
        } catch (e) {
            showToast(e.response?.data?.error || e.message, 'error');
        }
    };

    const handleEdit = (p) => {
        setForm({ name: p.name, base_url: p.base_url || '', api_key: p.api_key || '', model_name: p.model_name || '' });
        setEditingId(p.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this AI provider?')) return;
        try {
            await api.delete(`/admin/ai-providers/${id}`);
            showToast('Provider deleted');
            load();
        } catch (e) {
            showToast(e.response?.data?.error || e.message, 'error');
        }
    };

    const toggleActive = async (p) => {
        setActivating(p.id);
        try {
            await api.put(`/admin/ai-providers/${p.id}/status`, { is_active: !p.is_active });
            showToast(!p.is_active ? `✅ "${p.name}" is now ACTIVE` : `"${p.name}" deactivated`);
            load();
        } catch (e) {
            showToast(e.response?.data?.error || e.message, 'error');
        } finally {
            setActivating(null);
        }
    };

    const maskKey = (key) => {
        if (!key || key.length < 8) return '••••••••';
        return key.substring(0, 6) + '••••••••' + key.slice(-4);
    };

    return (
        <div className="p-6 space-y-6">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Cpu size={20} className="text-cyan-400" /> Neural Hub (AI)
                    </h2>
                    <p className="text-gray-500 text-xs mt-0.5">Manage AI providers for MCQ generation and content fetching</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', base_url: '', api_key: '', model_name: '' }); }}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all"
                    >
                        <Plus size={15} /> Add Provider
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-black text-sm uppercase tracking-wider">
                            {editingId ? 'Edit Provider' : 'Add New AI Provider'}
                        </h3>
                        <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-500 hover:text-white p-1"><X size={16} /></button>
                    </div>

                    {/* Presets */}
                    {!editingId && (
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Quick Presets</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_PROVIDERS.map(p => (
                                    <button
                                        key={p.name}
                                        onClick={() => applyPreset(p)}
                                        title={p.hint}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.name === p.name ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400'}`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                            {form.name && PRESET_PROVIDERS.find(p => p.name === form.name) && (
                                <p className="text-[10px] text-cyan-400 mt-1.5 italic">
                                    💡 {PRESET_PROVIDERS.find(p => p.name === form.name)?.hint}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Provider Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. OpenRouter"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Base URL</label>
                            <input
                                value={form.base_url}
                                onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))}
                                placeholder="https://openrouter.ai/api/v1"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>
                        <div className="relative">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">API Key *</label>
                            <input
                                type={showKey['form'] ? 'text' : 'password'}
                                value={form.api_key}
                                onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))}
                                placeholder="sk-or-... / AIza... / sk-..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 pr-10 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50"
                            />
                            <button onClick={() => setShowKey(s => ({ ...s, form: !s.form }))} className="absolute right-3 top-8 text-gray-500 hover:text-white">
                                {showKey['form'] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <div className="relative">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Model Name *</label>
                            <div className="flex gap-2">
                                <input
                                    value={form.model_name}
                                    onChange={e => setForm(f => ({ ...f, model_name: e.target.value }))}
                                    placeholder="e.g. meta-llama/llama-3.1-8b-instruct:free"
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50"
                                />
                                <button
                                    onClick={() => fetchModels({ base_url: form.base_url, api_key: form.api_key }, true)}
                                    disabled={fetchingModels === 'form' || !form.api_key}
                                    title="Fetch available models from provider"
                                    className="px-3 py-2 bg-gray-700 hover:bg-cyan-600 hover:text-white text-gray-300 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1 whitespace-nowrap"
                                >
                                    {fetchingModels === 'form' ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} />}
                                    Load Models
                                </button>
                            </div>
                            {/* Proper dropdown when models fetched */}
                            {availableModels['form'] && availableModels['form'].length > 0 && (
                                <div className="mt-2">
                                    <p className="text-[10px] text-cyan-400 font-bold mb-1">
                                        ↓ {availableModels['form'].length} models — select one:
                                    </p>
                                    <select
                                        value={form.model_name}
                                        onChange={e => setForm(f => ({ ...f, model_name: e.target.value }))}
                                        className="w-full bg-gray-800 border border-cyan-500/40 text-white text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                                        size={Math.min(8, availableModels['form'].length)}
                                    >
                                        {availableModels['form'].map(m => (
                                            <option key={m} value={m} className="py-1">{m}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button onClick={handleSave} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-black transition-all">
                            {editingId ? 'Update Provider' : 'Save Provider'}
                        </button>
                        <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-bold transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Providers List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-cyan-400" />
                </div>
            ) : providers.length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                    <Cpu size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No AI providers configured</p>
                    <p className="text-xs mt-1">Add one above to enable AI fetch features</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {providers.map(p => (
                        <div
                            key={p.id}
                            className={`bg-gray-900 border rounded-2xl p-5 transition-all ${p.is_active ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/5' : 'border-gray-800'}`}
                        >
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {/* Status dot */}
                                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${p.is_active ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse' : 'bg-gray-600'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-white font-black text-sm">{p.name}</h3>
                                            {p.is_active && (
                                                <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black border border-cyan-500/20 rounded-full uppercase tracking-wider">
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1.5 space-y-1">
                                            <p className="text-[11px] text-gray-500 font-mono truncate">
                                                <Globe size={10} className="inline mr-1 opacity-60" />
                                                {p.base_url || <span className="italic opacity-50">No base URL (auto-detect)</span>}
                                            </p>
                                            <p className="text-[11px] font-mono">
                                                <span className="text-gray-600">Key: </span>
                                                <span className="text-gray-400">
                                                    {showKey[p.id] ? (p.api_key || '—') : maskKey(p.api_key)}
                                                </span>
                                                <button onClick={() => setShowKey(s => ({ ...s, [p.id]: !s[p.id] }))} className="ml-1 text-gray-600 hover:text-gray-400">
                                                    {showKey[p.id] ? <EyeOff size={11} className="inline" /> : <Eye size={11} className="inline" />}
                                                </button>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[11px] font-mono text-indigo-300">
                                                    <Zap size={10} className="inline mr-1 opacity-60" />
                                                    {p.model_name || <span className="italic text-gray-600">No model set</span>}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Model selector if fetched */}
                                        {availableModels[p.id] && availableModels[p.id].length > 0 && (
                                            <div className="mt-2">
                                                <select
                                                    defaultValue={p.model_name}
                                                    onChange={async (e) => {
                                                        try {
                                                            await api.put(`/admin/ai-providers/${p.id}`, { ...p, model_name: e.target.value });
                                                            showToast('Model updated!');
                                                            load();
                                                        } catch (err) {
                                                            showToast('Failed to update model', 'error');
                                                        }
                                                    }}
                                                    className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500/50 max-w-xs"
                                                >
                                                    {availableModels[p.id].map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                                <span className="text-[10px] text-gray-600 ml-2">← select then it saves automatically</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                    <button
                                        onClick={() => fetchModels(p)}
                                        disabled={fetchingModels === p.id || !p.api_key}
                                        title="Load available models from this provider"
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                                    >
                                        {fetchingModels === p.id ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
                                        Models
                                    </button>
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => toggleActive(p)}
                                        disabled={activating === p.id}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${p.is_active
                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white'
                                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white'}`}
                                    >
                                        {activating === p.id ? <Loader2 size={12} className="animate-spin" /> : null}
                                        {p.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* AI Fetch Logs */}
            {logs.length > 0 && (
                <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock size={14} /> Recent AI Fetch Logs
                    </h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Context</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {logs.map(l => (
                                    <tr key={l.id} className="hover:bg-gray-800/30 text-gray-300">
                                        <td className="px-4 py-2.5 text-xs font-bold text-cyan-400 uppercase">{l.type}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-400 max-w-xs truncate">{l.context}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${l.status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                {l.status}
                                            </span>
                                            {l.error_message && <span className="text-[10px] text-red-400 ml-2 italic">{l.error_message.substring(0, 60)}</span>}
                                        </td>
                                        <td className="px-4 py-2.5 text-[10px] text-gray-600">
                                            {new Date(l.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}
