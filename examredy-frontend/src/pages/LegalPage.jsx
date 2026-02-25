import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ChevronLeft, Scale, ShieldCheck, FileText, Info, HelpCircle } from 'lucide-react';

const LegalPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/structure/legal/${slug}`);
                setPage(res.data);
                setError(null);
            } catch (err) {
                console.error("Legal Page Load Error:", err);
                setError("Page not found or failed to load.");
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
        window.scrollTo(0, 0);
    }, [slug]);

    const getIcon = (slug) => {
        if (slug.includes('privacy')) return <ShieldCheck size={48} className="text-emerald-500" />;
        if (slug.includes('terms')) return <Scale size={48} className="text-indigo-500" />;
        if (slug.includes('about')) return <Info size={48} className="text-blue-500" />;
        if (slug.includes('contact')) return <HelpCircle size={48} className="text-pink-500" />;
        return <FileText size={48} className="text-gray-500" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                    <HelpCircle className="text-red-500" size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Oops!</h2>
                <p className="text-gray-500 font-medium mb-8 max-w-md">{error || "The page you are looking for does not exist."}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors font-bold uppercase text-[10px] tracking-[0.2em] mb-12 group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Go Back
                </button>

                {/* Header */}
                <div className="mb-16 text-center md:text-left flex flex-col md:flex-row items-center md:items-end gap-8">
                    <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100 shadow-inner">
                        {getIcon(slug)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-4 leading-none">
                            {page.title}
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                            Last Updated: {new Date(page.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="prose prose-indigo max-w-none">
                    <div
                        className="text-gray-600 leading-[1.8] font-medium text-lg whitespace-pre-wrap"
                        style={{ wordBreak: 'break-word' }}
                    >
                        {page.content || "Content coming soon..."}
                    </div>
                </div>

                {/* Decorative End */}
                <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col items-center">
                    <div className="w-12 h-1 bg-gray-100 rounded-full mb-8"></div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">&copy; ExamRedy</p>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
