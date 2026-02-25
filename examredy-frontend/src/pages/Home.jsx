import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Target, Sparkles, Zap, Users, Trophy,
    ChevronRight, ArrowRight, BrainCircuit,
    CheckCircle2, Star, PlayCircle
} from 'lucide-react';
import AdSlot from '../components/AdSlot';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/structure/categories');
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const stats = [
        { label: 'Active Users', value: '50K+', icon: Users, color: 'text-blue-500' },
        { label: 'AI MCQs', value: '1M+', icon: BrainCircuit, color: 'text-indigo-500' },
        { label: 'Success Rate', value: '98%', icon: Trophy, color: 'text-emerald-500' },
        { label: 'Institutions', value: '500+', icon: Target, color: 'text-rose-500' },
    ];

    return (
        <div className="font-sans text-gray-900 min-h-screen bg-white">
            <AdSlot type="top" />

            {/* 1. Hero Section - Ultra Modern */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.08),transparent_50%)]"></div>
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="max-w-7xl mx-auto px-6 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-in slide-in-from-bottom duration-700">
                        <Sparkles size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">The Future of Exam Prep</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter mb-8 leading-[0.9] animate-in slide-in-from-bottom duration-700 delay-100">
                        MASTER YOUR <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">LIMITS WITH AI.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl font-medium mb-12 leading-relaxed animate-in slide-in-from-bottom duration-700 delay-200">
                        Experience the world's most advanced MCQ Practice Engine.
                        Personalized syllabus, real-time competition, and AI-driven insights
                        to ensure your 100% success.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom duration-700 delay-300">
                        <button
                            onClick={() => navigate('/practice')}
                            className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            Start Practice Now
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/prime')}
                            className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border border-gray-100 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                        >
                            View Prime Plans
                            <Zap size={18} className="text-yellow-500" />
                        </button>
                    </div>

                    {/* Stats Strip */}
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto animate-in fade-in duration-1000 delay-500">
                        {stats.map((stat, i) => (
                            <div key={i} className="group">
                                <p className="text-3xl md:text-4xl font-black text-gray-900 mb-1 leading-none">{stat.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-500 transition-colors">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. Explore Categories - Glassmorphism Carousel */}
            <section className="py-32 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <p className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Curated Silabus</p>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                                Explore <br /> Educational Paths
                            </h2>
                        </div>
                        <p className="max-w-md text-gray-500 font-medium text-sm leading-relaxed">
                            From primary schooling to elite competitive exams, our AI engine adapts to
                            every educational standard in India and beyond.
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden pl-6 md:pl-[max(1.5rem,calc((100%-80rem)/2))]">
                    <div
                        ref={sliderRef}
                        className="flex gap-8 overflow-x-auto pb-16 snap-x hide-scroll-bar scroll-smooth pr-6"
                    >
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="snap-start flex-shrink-0 w-[300px] h-[450px] bg-gray-200 rounded-[3rem] animate-pulse"></div>
                            ))
                        ) : (
                            categories.filter(c => c.is_active).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((cat, i) => (
                                <div
                                    key={cat.id}
                                    onClick={() => navigate(`/practice?cat=${cat.id}`)}
                                    className="snap-start flex-shrink-0 w-[300px] group cursor-pointer bg-white rounded-[3rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.15)] transition-all duration-500 transform hover:-translate-y-4 overflow-hidden flex flex-col"
                                >
                                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                                        {cat.image_url ? (
                                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
                                                <Target size={40} className="opacity-20 mb-2" />
                                                <span className="text-[10px] font-black tracking-widest uppercase opacity-20">Path Found</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-600 shadow-sm border border-white/20">
                                                Category 0{i + 1}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase leading-none">{cat.name}</h3>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 flex-1">
                                            {cat.description || "Master your upcoming exams with AI-driven insights and unlimited practice sessions."}
                                        </p>
                                        <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                                            Enter Module <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="container mx-auto px-6">
                    <AdSlot type="mid" />
                </div>
            </section>

            {/* 3. Features Section - Professional Bento Style */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <p className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Powerful Features</p>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                            Why Choose <br /> ExamRedy Engine?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-10 rounded-[3rem] bg-indigo-50/30 border border-indigo-100 space-y-6 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-indigo-50 group-hover:rotate-12 transition-transform">
                                <BrainCircuit className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Neural Engine</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                Our complex AI algorithms generate unique, curriculum-aligned questions that adapt to your knowledge levels in real-time.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-10 rounded-[3rem] bg-emerald-50/30 border border-emerald-100 space-y-6 hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-50 group-hover:rotate-12 transition-transform">
                                <Zap className="text-emerald-600" size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">On-Demand AI Fetch</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                Never hit a dead end. If a subject is missing, our AI fetches the official syllabus and generates it instantly just for you.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-10 rounded-[3rem] bg-amber-50/30 border border-amber-100 space-y-6 hover:bg-white hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-amber-50 group-hover:rotate-12 transition-transform">
                                <Trophy className="text-amber-600" size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Group Battles</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                Create or join real-time MCQ competitions with friends. Compete on the leaderboard and improve together.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Social Proof Section */}
            <section className="pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-gray-950 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-1 mb-8">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />)}
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6 leading-none">
                                Join the elite 5% <br /> in your next big exam.
                            </h2>
                            <p className="text-gray-400 font-medium mb-12 max-w-xl mx-auto text-sm leading-relaxed">
                                Join over 50,000 students who are using ExamRedy to stay ahead of the curve.
                                Get unlimited access to premium subjects and features.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-10 py-4 bg-white text-gray-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all"
                            >
                                Create Free Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-6 mb-10">
                <AdSlot type="bottom" />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scroll-bar::-webkit-scrollbar { display: none; }
                .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes slide-in-bottom {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-in {
                    animation-fill-mode: both;
                    animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .slide-in-from-bottom {
                    animation-name: slide-in-bottom;
                }
                .fade-in {
                    animation-name: fade-in-anim;
                }
                @keyframes fade-in-anim {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .duration-700 { animation-duration: 700ms; }
                .duration-1000 { animation-duration: 1000ms; }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
                .delay-500 { animation-delay: 500ms; }
            `}} />
        </div>
    );
};

export default Home;
