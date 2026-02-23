import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Save, CheckCircle2, History, AlertCircle, Edit3, Shield, Info, Smartphone, FileSignature } from 'lucide-react';

const Toast = ({ msg, type }) => {
    if (!msg) return null;
    return (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
            <p className="text-sm font-black uppercase tracking-widest">{msg}</p>
        </div>
    );
};

export const LegalCompliance = () => {
    const [pages, setPages] = useState([]);
    const [activePageId, setActivePageId] = useState(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/legal-pages');
            setPages(res.data);
            if (res.data.length > 0 && !activePageId) {
                const firstPage = res.data[0];
                setActivePageId(firstPage.id);
                setContent(firstPage.content || '');
                setTitle(firstPage.title || '');
                setIsActive(firstPage.is_active);
            }
        } catch (e) {
            showToast('Failed to load legal pages', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handlePageSwitch = (page) => {
        setActivePageId(page.id);
        setContent(page.content || '');
        setTitle(page.title || '');
        setIsActive(page.is_active);
    };

    const handleSave = async () => {
        if (!activePageId) return;
        setSaving(true);
        try {
            await api.put(`/admin/legal-pages/${activePageId}`, {
                title,
                content,
                is_active: isActive
            });
            showToast('Document saved successfully');
            fetchPages(); // refresh the list to update "Last Updated" timestamps
        } catch (e) {
            showToast('Failed to save document', 'error');
        } finally {
            setSaving(false);
        }
    };

    const activePage = pages.find(p => p.id === activePageId);

    return (
        <div className="p-8 h-[calc(100vh-80px)] overflow-hidden flex flex-col space-y-6 animate-in fade-in duration-500">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-md shadow-2xl">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <FileSignature className="text-emerald-500" size={40} />
                        Legal Compliance
                    </h2>
                    <p className="text-gray-500 text-base font-medium mt-2 uppercase tracking-[0.2em]">
                        Manage Policies, Terms, & Legal Disclaimers
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <div className="flex-1 flex gap-8 overflow-hidden">

                    {/* Sidebar: Document List */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                        {pages.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => handlePageSwitch(page)}
                                className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group ${activePageId === page.id
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/60'
                                    }`}
                            >
                                {activePageId === page.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                                )}
                                <h4 className={`text-sm font-black uppercase tracking-widest mb-2 ${activePageId === page.id ? 'text-emerald-400' : 'text-gray-300 group-hover:text-white'
                                    }`}>
                                    {page.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    <History size={12} />
                                    {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : 'Never edited'}
                                    {!page.is_active && (
                                        <span className="ml-auto text-red-400 flex items-center gap-1"><AlertCircle size={10} /> DRAFT</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Main Editor Area */}
                    <div className="flex-1 bg-gray-900/60 border border-gray-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">

                        {/* Editor Header */}
                        <div className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-900/80">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center border border-gray-700">
                                    <FileText className="text-gray-400" size={18} />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-transparent text-xl font-black text-white uppercase tracking-tight outline-none w-64 placeholder-gray-600"
                                        placeholder="DOCUMENT TITLE"
                                    />
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
                                        Slug: {activePage?.slug}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 bg-gray-950 px-4 py-2 rounded-xl border border-gray-800">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer" htmlFor="status-toggle">
                                        Public Visibility
                                    </label>
                                    <input
                                        id="status-toggle"
                                        type="checkbox"
                                        className="w-4 h-4 accent-emerald-500"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
                                        }`}
                                >
                                    {saving ? 'SAVING...' : (
                                        <>
                                            <Save size={14} /> SAVE DOCUMENT
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Editor Body */}
                        <div className="flex-1 p-8 bg-gray-950/50 overflow-y-auto">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Start typing the legal document here. You can use Markdown or plain text..."
                                className="w-full h-full min-h-[500px] bg-transparent text-gray-300 font-medium text-sm leading-relaxed outline-none resize-none custom-scrollbar placeholder-gray-700"
                                style={{ whiteSpace: 'pre-wrap' }}
                            ></textarea>
                        </div>
                    </div>

                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(17, 24, 39, 0.5); 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(55, 65, 81, 1); 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(75, 85, 99, 1); 
                }
            `}</style>
        </div>
    );
};

export default LegalCompliance;
