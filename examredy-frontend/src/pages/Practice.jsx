import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MCQSession from '../components/MCQSession';
import PrimePopup from '../components/PrimePopup';

const Practice = () => {
    const [mode, setMode] = useState(null); // 'solo' | 'group'
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionComplete, setSessionComplete] = useState(false);
    const [scoreData, setScoreData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const startSoloPractice = async () => {
        setLoading(true);
        try {
            // Default category ID 1 (School) for now, or fetch dynamically
            const res = await api.get('/mcq/practice?category_id=1');
            if (res.data.length === 0) {
                setError('No questions available yet. Please generate some from Admin.');
            } else {
                setQuestions(res.data);
                setMode('solo');
            }
        } catch (err) {
            if (err.response?.data?.code === 'LIMIT_REACHED') {
                setShowPopup(true);
            } else {
                setError('Failed to start practice');
                const initialCatId = searchParams.get('cat');

                const [categories, setCategories] = useState([]);
                const [states, setStates] = useState([]);

                // Selection States
                const [selectedCat, setSelectedCat] = useState(initialCatId || '');
                const [selectedState, setSelectedState] = useState('');
                const [selectedBoard, setSelectedBoard] = useState('');
                const [selectedClass, setSelectedClass] = useState('');
                const [selectedSubject, setSelectedSubject] = useState('');
                const [selectedChapter, setSelectedChapter] = useState('');

                // Data States for Dropdowns
                const [boards, setBoards] = useState([]);
                const [classes, setClasses] = useState([]);
                const [subjects, setSubjects] = useState([]);
                const [chapters, setChapters] = useState([]);

                const [loading, setLoading] = useState(false);

                // Load Initial Data
                useEffect(() => {
                    const loadInitial = async () => {
                        const [catRes, stateRes] = await Promise.all([getCategories(), getStates()]);
                        setCategories(catRes.data);
                        setStates(stateRes.data);
                    };
                    loadInitial();
                }, []);

                // Load Boards when State changes
                useEffect(() => {
                    if (selectedState) {
                        getBoards(selectedState).then(res => setBoards(res.data)).catch(console.error);
                    } else { setBoards([]); }
                }, [selectedState]);

                // Load Classes when Board changes
                useEffect(() => {
                    if (selectedBoard) {
                        getClasses(selectedBoard).then(res => setClasses(res.data)).catch(console.error);
                    } else { setClasses([]); }
                }, [selectedBoard]);

                // Load Subjects when Class changes
                useEffect(() => {
                    if (selectedClass) {
                        getSubjects(selectedClass).then(res => setSubjects(res.data)).catch(console.error);
                    } else { setSubjects([]); }
                }, [selectedClass]);

                // Load Chapters when Subject changes
                useEffect(() => {
                    if (selectedSubject) {
                        getChapters(selectedSubject).then(res => setChapters(res.data)).catch(console.error);
                    } else { setChapters([]); }
                }, [selectedSubject]);


                const handleStartPractice = () => {
                    if (!selectedChapter) {
                        alert('Please select a chapter!');
                        return;
                    }
                    if (mode === 'solo' && questions.length > 0) {
                        return (
                            <div className="container mx-auto px-4 py-8">
                                <MCQSession questions={questions} onComplete={handleSessionComplete} />
                            </div>
                        );
                    }

                    return (
                        <div className="container mx-auto px-4 py-12">
                            <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">Choose Your Mode</h1>

                            {error && <div className="max-w-md mx-auto bg-red-100 text-red-700 p-4 rounded-lg mb-8 text-center">{error}</div>}

                            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {/* Individual Mode Card */}
                                <div
                                    onClick={startSoloPractice}
                                    className="bg-white p-8 rounded-2xl shadow-md border-2 border-transparent hover:border-primary hover:shadow-xl transition cursor-pointer text-center group"
                                >
                                    <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl group-hover:bg-primary group-hover:text-white transition">
                                        👤
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Individual Practice</h2>
                                    <p className="text-gray-600">Practice at your own pace. Master concepts with detailed AI explanations.</p>
                                </div>

                                {/* Group Mode Card */}
                                <div
                                    onClick={() => navigate('/group')}
                                    className="bg-white p-8 rounded-2xl shadow-md border-2 border-transparent hover:border-secondary hover:shadow-xl transition cursor-pointer text-center group"
                                >
                                    <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl group-hover:bg-secondary group-hover:text-white transition">
                                        👥
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Group Competition</h2>
                                    <p className="text-gray-600">Compete with friends in real-time. Join a session and climb the leaderboard.</p>
                                </div>
                            </div>

                            {loading && <div className="text-center mt-8 text-gray-500">Starting session...</div>}

                            {showPopup && <PrimePopup onClose={() => setShowPopup(false)} />}
                        </div>
                    );
                };

                export default Practice;
