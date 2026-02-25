import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Target } from 'lucide-react';
import AdSlot from '../components/AdSlot';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch dynamically right from backend on mount. No caching.
                const res = await api.get('/structure/categories');
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="font-sans text-gray-900 min-h-screen bg-gray-50 pt-10">
            <AdSlot type="top" />

            {/* 1. Main Category Display (Layer 3) */}
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
                            const actCats = categories.filter(c => c.is_active);

                            return actCats.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => navigate(`/practice?cat=${cat.id}`)}
                                    className="snap-start flex-shrink-0 w-[280px] group cursor-pointer bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 hover:border-indigo-100 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col"
                                >
                                    <div className="h-44 bg-gray-100 relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {cat.image_url ? (
                                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-300">
                                                <Target size={48} className="opacity-50 mb-2" />
                                                <span className="text-xs font-bold uppercase tracking-widest opacity-40">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col items-center text-center">
                                        <h3 className="text-xl font-extrabold text-gray-900 mb-3">{cat.name}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed flex-1">
                                            {cat.description || "Master your upcoming exams with AI-driven insights and unlimited practice sessions."}
                                        </p>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                    {/* Fallback if list is legitimately empty so admin knows it's working */}
                    {categories.filter(c => c.is_active).length === 0 && (
                        <div className="text-center py-20 text-gray-400 font-medium">
                            No active categories found in database. Add them from the Admin Panel.
                        </div>
                    )}
                </div>
                <AdSlot type="mid" />
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scroll-bar::-webkit-scrollbar { display: none; }
                    .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />
            </section>

            <AdSlot type="bottom" />
        </div>
    );
};

export default Home;
