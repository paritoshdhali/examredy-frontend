import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
    BookOpen, Users, Trophy, Brain, Zap, Target,
    BarChart2, FileText, CheckCircle, Clock,
    Shield, Star, TrendingUp, Activity, Smartphone
} from 'lucide-react';
import AdSlot from '../components/AdSlot';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const sliderRef = useRef(null);
    const [stats, setStats] = useState({
        users: 1200,
        exams: 5400,
        questions: 150000
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/structure/categories');
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
        // Simulate stats fetch or keep static for demo
    }, []);

    return (
        <div className="font-sans text-gray-900">

            {/* 1. Hero Section */}
            <section className="relative bg-indigo-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-purple-900 opacity-90"></div>
                <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                        Master Your Exams with <span className="text-yellow-400">AI Precision</span>
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
                        The ultimate SaaS platform for competitive exams.
                        Unlimited practice, AI-driven insights, and real-time group battles.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <Link to="/practice" className="bg-yellow-400 text-indigo-900 font-bold py-4 px-8 rounded-full shadow-lg hover:bg-yellow-300 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                            <Zap size={20} /> Start Practicing
                        </Link>
                        <Link to="/group" className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-white/20 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                            <Users size={20} /> Join Group Battle
                        </Link>
                        <Link to="/prime" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                            <Star size={20} /> Go Prime
                        </Link>
                    </div>
                </div>
            </section>

            {/* 10. Platform Statistics (Placed below Hero) */}
            <section className="bg-white py-12 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-4">
                        <div className="text-4xl font-bold text-indigo-600 mb-2">{stats.users.toLocaleString()}+</div>
                        <div className="text-gray-500 font-medium">Active Learners</div>
                    </div>
                    <div className="p-4 border-l border-r border-gray-100">
                        <div className="text-4xl font-bold text-purple-600 mb-2">{stats.exams.toLocaleString()}+</div>
                        <div className="text-gray-500 font-medium">Exams Completed</div>
                    </div>
                    <div className="p-4">
                        <div className="text-4xl font-bold text-pink-600 mb-2">{stats.questions.toLocaleString()}+</div>
                        <div className="text-gray-500 font-medium">Questions Solved</div>
                    </div>
                </div>
            </section>

            {/* 2. Academic Flow */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Path to Success</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Structured learning path designed to take you from basics to mastery.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

                        {[
                            { title: 'Select Stream', icon: <Target size={24} />, color: 'bg-blue-500' },
                            { title: 'Choose Class', icon: <BookOpen size={24} />, color: 'bg-indigo-500' },
                            { title: 'Pick Subject', icon: <FileText size={24} />, color: 'bg-purple-500' },
                            { title: 'Start Chapter', icon: <CheckCircle size={24} />, color: 'bg-pink-500' }
                        ].map((step, idx) => (
                            <div key={idx} className="relative z-10 bg-white p-6 rounded-xl shadow-md text-center border border-gray-100 hover:shadow-lg transition">
                                <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                                    {step.icon}
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg">{step.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Exam Type Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Diverse Exam Modes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Standard MCQ', desc: 'Topic-wise practice at your own pace.', icon: '📝', color: 'bg-blue-50 text-blue-600' },
                            { title: 'Timed Test', desc: 'Simulate real exam pressure with timer.', icon: '⏱️', color: 'bg-orange-50 text-orange-600' },
                            { title: 'AI Practice', desc: 'Adaptive questions based on your weak areas.', icon: '🤖', color: 'bg-purple-50 text-purple-600' },
                            { title: 'Daily Challenge', desc: 'New set of questions every day.', icon: '📅', color: 'bg-green-50 text-green-600' }
                        ].map((mode, idx) => (
                            <div key={idx} className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl transition cursor-pointer group">
                                <div className={`w-14 h-14 rounded-xl ${mode.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition`}>
                                    {mode.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">{mode.title}</h3>
                                <p className="text-gray-600 text-sm">{mode.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container mx-auto">
                <AdSlot type="mid" />
            </div>

            {/* 3. Main Category Display (Layer 3) */}
            <section className="py-20 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 text-center tracking-tight">Explore Categories</h2>
                    <p className="text-gray-500 text-center mt-2">Find the right path for your next big achievement</p>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 cursor-grab active:cursor-grabbing">
                    {/* Horizontal Scrollable Container - No Vertical Stacking */}
                    <div
                        ref={sliderRef}
                        onWheel={(e) => {
                            if (sliderRef.current) {
                                sliderRef.current.scrollLeft += e.deltaY;
                            }
                        }}
                        className="flex flex-nowrap overflow-x-auto overflow-y-hidden gap-6 pb-12 snap-x hide-scroll-bar scroll-smooth"
                        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
                    >
                        {(() => {
                            const STRICT_ORDER = ['School', 'University', 'UPSC', 'CTET', 'SSC', 'Banking', 'Railway', 'State Govt Exams', 'Others'];
                            const actCats = categories.filter(c => c.is_active);
                            return actCats.sort((a, b) => {
                                let idxA = STRICT_ORDER.indexOf(a.name);
                                let idxB = STRICT_ORDER.indexOf(b.name);
                                if (idxA === -1) idxA = 999;
                                if (idxB === -1) idxB = 999;
                                return idxA - idxB;
                            }).map(cat => (
                                <div key={cat.id} className="snap-start flex-shrink-0 w-[280px] group cursor-pointer bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 hover:border-indigo-100 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col">
                                    <div className="h-44 bg-gray-100 relative overflow-hidden flex-shrink-0">
                                        {cat.image_url ? (
                                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-300">
                                                <Target size={48} className="opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col items-center text-center">
                                        <h3 className="text-xl font-extrabold text-gray-900 mb-3">{cat.name}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed flex-1">
                                            {cat.description || "Master your upcoming exams with AI-driven insights and unlimited practice sessions."}
                                        </p>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scroll-bar::-webkit-scrollbar { display: none; }
                    .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />
            </section>

            {/* 8. AI Features Section */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-purple-600/20 blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-block bg-indigo-500/20 text-indigo-300 px-4 py-1 rounded-full text-sm font-semibold mb-6 border border-indigo-500/30">
                                Powered by Gemini AI
                            </div>
                            <h2 className="text-4xl font-bold mb-6 leading-tight">AI that Understands <br /> Your Learning Style</h2>
                            <p className="text-gray-400 text-lg mb-8">
                                Stop memorizing blindly. Our AI analyzes your mistakes, explains concepts instantly, and suggests personalized topics to improve your score.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={18} className="text-indigo-500" /> Instant AI Explanations</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={18} className="text-indigo-500" /> Personalized Study Plans</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={18} className="text-indigo-500" /> Weak Area Analysis</li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <div className="aspect-video bg-gray-800 rounded-2xl border border-white/10 flex items-center justify-center text-gray-500">
                                AI Dashboard Mockup
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Group Mode */}
            <section className="py-20 bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <Target size={48} className="mx-auto mb-6 text-yellow-300" />
                    <h2 className="text-3xl font-bold mb-4">Live Group Battles</h2>
                    <p className="text-orange-100 max-w-2xl mx-auto mb-10 text-lg">
                        Challenge your friends or join public rooms. Solve questions in real-time and see who tops the leaderboard!
                    </p>
                    <Link to="/group" className="inline-block bg-white text-orange-600 font-bold py-4 px-10 rounded-full shadow-xl hover:bg-gray-100 transition">
                        Enter Battle Arena
                    </Link>
                </div>
            </section>

            {/* 5. Study Materials */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Study Materials</h2>
                            <p className="text-gray-500 mt-2">Curated resources to boost your preparation</p>
                        </div>
                        <Link to="/materials" className="text-indigo-600 font-semibold hover:underline">View All &rarr;</Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {['Lecture Notes', 'PDF Books', 'Model Tests', 'Question Bank'].map((item, idx) => (
                            <div key={idx} className="bg-gray-50 p-6 rounded-xl text-center hover:bg-indigo-50 transition cursor-pointer group">
                                <div className="bg-white w-12 h-12 rounded-lg shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                                    <BookOpen size={20} className="text-indigo-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800">{item}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Performance Section */}
            <section className="py-20 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Track Your Progress</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Leaderboard Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Trophy className="text-yellow-500" size={20} /> Top Performers
                                </h3>
                                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">Weekly</span>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">{i}</div>
                                        <div className="flex-1">
                                            <div className="h-2 bg-gray-100 rounded-full w-full">
                                                <div className="h-2 bg-yellow-400 rounded-full" style={{ width: `${100 - (i * 15)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* My Progress Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                                <Activity className="text-blue-500" size={20} /> Your Growth
                            </h3>
                            <div className="flex items-end justify-between h-32 gap-2">
                                {[40, 60, 45, 70, 85, 60, 90].map((h, i) => (
                                    <div key={i} className="w-full bg-blue-100 rounded-t-lg relative group">
                                        <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500" style={{ height: `${h}%` }}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>Mon</span><span>Sun</span>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                                <Target className="text-red-500" size={20} /> Accuracy Rate
                            </h3>
                            <div className="flex items-center justify-center py-4">
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                                        <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="377" strokeDashoffset="94" className="text-red-500" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-800">75%</span>
                                        <span className="text-xs text-gray-500">Average</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. Subscription Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Pricing</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Simple, Transparent Pricing</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Free Starter</h3>
                            <p className="text-gray-500 mb-6">Perfect for casual practice.</p>
                            <div className="text-4xl font-bold text-gray-900 mb-8">$0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Daily 10 MCQ Limit</li>
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Basic Explanations</li>
                                <li className="flex items-center gap-3 text-gray-400"><CheckCircle size={18} className="text-gray-300" /> No AI Analysis</li>
                            </ul>
                            <Link to="/practice" className="block w-full py-4 text-center font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition">
                                Start Free
                            </Link>
                        </div>

                        {/* Prime Plan */}
                        <div className="p-8 rounded-2xl border-2 border-indigo-600 relative shadow-2xl scale-105 bg-white">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-lg">MOST POPULAR</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">ExamRedy Prime</h3>
                            <p className="text-gray-500 mb-6">For serious aspirants.</p>
                            <div className="text-4xl font-bold text-gray-900 mb-8">$9<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-800"><CheckCircle size={18} className="text-indigo-600" /> Unlimited MCQs</li>
                                <li className="flex items-center gap-3 text-gray-800"><CheckCircle size={18} className="text-indigo-600" /> Advanced AI Analysis</li>
                                <li className="flex items-center gap-3 text-gray-800"><CheckCircle size={18} className="text-indigo-600" /> Group Battle Access</li>
                                <li className="flex items-center gap-3 text-gray-800"><CheckCircle size={18} className="text-indigo-600" /> Ad-Free Experience</li>
                            </ul>
                            <Link to="/prime" className="block w-full py-4 text-center font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                Get Prime Access
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
