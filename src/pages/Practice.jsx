import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MCQSession from '../components/MCQSession';
import PrimePopup from '../components/PrimePopup';

const Practice = () => {
    const [searchParams] = useSearchParams();
    const initialCatId = searchParams.get('cat');
    const navigate = useNavigate();

    // UI States
    const [mode, setMode] = useState(null); // 'solo' | 'group'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    // Data States
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [states, setStates] = useState([]);
    const [boards, setBoards] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    // Selection States
    const [selectedCat, setSelectedCat] = useState(initialCatId || '');
    const [selectedState, setSelectedState] = useState('');
    const [selectedBoard, setSelectedBoard] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const [catRes, stateRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/structure/states')
                ]);
                setCategories(catRes.data);
                setStates(stateRes.data);
            } catch (err) {
                console.error('Failed to load initial data');
            }
        };
        loadInitial();
    }, []);

    useEffect(() => {
        if (selectedState) {
            api.get(`/structure/boards/${selectedState}`).then(res => setBoards(res.data));
        } else setBoards([]);
    }, [selectedState]);

    useEffect(() => {
        if (selectedBoard) {
            api.get(`/structure/classes`).then(res => setClasses(res.data));
        } else setClasses([]);
    }, [selectedBoard]);

    useEffect(() => {
        if (selectedClass) {
            api.get(`/structure/subjects?class_id=${selectedClass}`).then(res => setSubjects(res.data));
        } else setSubjects([]);
    }, [selectedClass]);

    useEffect(() => {
        if (selectedSubject) {
            api.get(`/structure/chapters/${selectedSubject}`).then(res => setChapters(res.data));
        } else setChapters([]);
    }, [selectedSubject]);

    const startSoloPractice = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/mcq/practice?category_id=${selectedCat}&chapter_id=${selectedChapter}`);
            if (res.data.length === 0) {
                setError('No questions available for this selection. Try another chapter.');
            } else {
                setQuestions(res.data);
                setMode('solo');
            }
        } catch (err) {
            if (err.response?.data?.code === 'LIMIT_REACHED') {
                setShowPopup(true);
            } else {
                setError('Failed to start practice session');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSessionComplete = (data) => {
        console.log('Session complete:', data);
        setMode(null);
        setQuestions([]);
    };

    if (mode === 'solo' && questions.length > 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <MCQSession questions={questions} onComplete={handleSessionComplete} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Ready to Practice?</h1>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8 text-center">{error}</div>}

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select State</label>
                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedState} onChange={e => setSelectedState(e.target.value)}>
                            <option value="">Choose State</option>
                            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Board</label>
                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)} disabled={!selectedState}>
                            <option value="">Choose Board</option>
                            {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Class</label>
                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedBoard}>
                            <option value="">Choose Class</option>
                            {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Subject</label>
                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedClass}>
                            <option value="">Choose Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Chapter</label>
                    <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} disabled={!selectedSubject}>
                        <option value="">Choose Chapter</option>
                        {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <button
                    onClick={startSoloPractice}
                    disabled={!selectedChapter || loading}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-indigo-200 transition-all hover:-translate-y-1 block text-center"
                >
                    {loading ? 'Starting Session...' : 'Start Practice Now'}
                </button>
            </div>

            <div className="mt-12 text-center text-gray-400">
                <p className="text-sm">Want to compete with friends? <button onClick={() => navigate('/group')} className="text-secondary font-bold hover:underline">Launch Group Mode</button></p>
            </div>

            {showPopup && <PrimePopup onClose={() => setShowPopup(false)} />}
        </div>
    );
};

export default Practice;
