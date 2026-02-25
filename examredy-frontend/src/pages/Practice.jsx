import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MCQSession from '../components/MCQSession';
import PrimePopup from '../components/PrimePopup';
import AdSlot from '../components/AdSlot';

const Practice = () => {
    const [searchParams] = useSearchParams();
    const initialCatId = searchParams.get('cat');
    const navigate = useNavigate();

    // UI States
    const [mode, setMode] = useState(null); // 'solo' | 'group'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [language, setLanguage] = useState('English');

    // Global Data States
    const [categories, setCategories] = useState([]);
    const [states, setStates] = useState([]);

    // Flow Type
    const [flowType, setFlowType] = useState('competitive'); // 'school' | 'university' | 'competitive'

    // School Data States
    const [boards, setBoards] = useState([]);
    const [classes, setClasses] = useState([]);
    const [streams, setStreams] = useState([]);

    // University Data States
    const [universities, setUniversities] = useState([]);
    const [semesters, setSemesters] = useState([]);

    // Competitive Data States
    const [papersStages, setPapersStages] = useState([]);

    // Common Target States
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [questions, setQuestions] = useState([]);

    // Selection States
    const [selectedCat, setSelectedCat] = useState(initialCatId || '');

    // Common / Flow-specific Selection
    const [selectedState, setSelectedState] = useState('');
    const [selectedBoard, setSelectedBoard] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStream, setSelectedStream] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedPaperStage, setSelectedPaperStage] = useState('');

    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');

    // User AI Fetch State
    const [isFetchingAI, setIsFetchingAI] = useState('');

    // Flow Detection
    useEffect(() => {
        if (!selectedCat || categories.length === 0) return;
        const cat = categories.find(c => String(c.id) === String(selectedCat));
        if (!cat) return;

        const name = cat.name.toLowerCase();
        if (name.includes('school')) setFlowType('school');
        else if (name.includes('university') || name.includes('college')) setFlowType('university');
        else setFlowType('competitive');

        // Reset lower cascade when category changes to prevent invalid state
        setSelectedState('');
        setSelectedBoard('');
        setSelectedUniversity('');
        setSelectedClass('');
        setSelectedStream('');
        setSelectedSemester('');
        setSelectedPaperStage('');
        setSelectedSubject('');
        setSelectedChapter('');
    }, [selectedCat, categories]);

    // Initial Load
    useEffect(() => {
        const loadInitial = async () => {
            try {
                const [catRes, stateRes, semRes] = await Promise.all([
                    api.get('/structure/categories'),
                    api.get('/structure/states'),
                    api.get('/structure/semesters')
                ]);
                setCategories(catRes.data);
                setStates(stateRes.data);
                setSemesters(semRes.data);
            } catch (err) {
                console.error('Failed to load initial data', err);
            }
        };
        loadInitial();
    }, []);

    // ── DATA CASCADE LOGIC ──

    // State changes -> Load Boards (School) OR Universities (University)
    useEffect(() => {
        if (selectedState && flowType === 'school') {
            api.get(`/structure/boards/${selectedState}`).then(res => setBoards(res.data));
        } else if (selectedState && flowType === 'university') {
            api.get(`/structure/universities/${selectedState}`).then(res => setUniversities(res.data));
        } else {
            setBoards([]);
            setUniversities([]);
        }
    }, [selectedState, flowType]);

    // Board changes -> Load Classes & Streams
    useEffect(() => {
        if (selectedBoard && flowType === 'school') {
            api.get(`/structure/classes/${selectedBoard}`).then(res => setClasses(res.data));
            api.get(`/structure/streams`).then(res => setStreams(res.data));
        } else {
            setClasses([]);
            setStreams([]);
        }
    }, [selectedBoard, flowType]);

    // Category changes (Competitive) -> Load Papers Stages
    useEffect(() => {
        if (selectedCat && flowType === 'competitive') {
            api.get(`/structure/papers-stages/${selectedCat}`).then(res => setPapersStages(res.data));
        } else {
            setPapersStages([]);
        }
    }, [selectedCat, flowType]);

    // Subject loading unified handler
    useEffect(() => {
        let url = `/structure/subjects?category_id=${selectedCat}`;
        let shouldFetch = false;

        if (flowType === 'school' && selectedClass) {
            url += `&board_id=${selectedBoard}&class_id=${selectedClass}`;
            if (selectedStream) url += `&stream_id=${selectedStream}`;
            shouldFetch = true;
        } else if (flowType === 'university' && selectedUniversity && selectedSemester) {
            url += `&university_id=${selectedUniversity}&semester_id=${selectedSemester}`;
            shouldFetch = true;
        } else if (flowType === 'competitive' && selectedPaperStage) {
            url += `&paper_stage_id=${selectedPaperStage}`;
            shouldFetch = true;
        }

        if (shouldFetch) {
            api.get(url).then(res => setSubjects(res.data));
        } else {
            setSubjects([]);
        }
    }, [selectedCat, flowType, selectedClass, selectedBoard, selectedStream, selectedUniversity, selectedSemester, selectedPaperStage]);

    // Chapter Loading
    useEffect(() => {
        if (selectedSubject) {
            api.get(`/structure/chapters/${selectedSubject}`).then(res => setChapters(res.data));
        } else {
            setChapters([]);
        }
    }, [selectedSubject]);


    // Helper functions for School UI logic
    const classNum = selectedClass ? parseInt(classes.find(c => c.id == selectedClass)?.name.replace(/\D/g, '')) : 0;
    const needsStream = classNum >= 11;


    // ── SESSION START ──
    const startSoloPractice = async () => {
        setLoading(true);
        setError('');
        try {
            let topicName = '';
            if (selectedChapter) {
                const chap = chapters.find(c => c.id == selectedChapter);
                if (chap) topicName = chap.name;
            } else if (selectedSubject) {
                const sub = subjects.find(s => s.id == selectedSubject);
                if (sub) topicName = sub.name;
            }

            if (!topicName) topicName = 'General Topics';

            // Use the Live AI Generation endpoint
            const res = await api.post('/mcq/generate-practice', {
                topic: topicName,
                language: language,
                limit: 5 // Reduced from 10 to halve AI processing time
            });

            if (res.data.length === 0) {
                setError('No questions available for this selection. Try another chapter.');
            } else {
                setQuestions(res.data);
                setMode('solo');
            }
        } catch (err) {
            if (err.response?.data?.code === 'LIMIT_REACHED' || err.response?.data?.code === 'SESSIONS_EXHAUSTED') {
                setShowPopup(true);
            } else {
                setError(err.response?.data?.message || 'Failed to start practice session');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSessionComplete = (data) => {
        setMode(null);
        setQuestions([]);
    };

    // ── USER AI FETCH HANDLER ──
    const handleAIFetch = async (type) => {
        setIsFetchingAI(type);
        try {
            if (type === 'boards') {
                const s = states.find(x => x.id == selectedState);
                if (!s) return;
                await api.post('/structure/fetch-out-boards', { state_id: s.id, state_name: s.name });
                const res = await api.get(`/structure/boards/${selectedState}`);
                setBoards(res.data);
            } else if (type === 'subjects') {
                const b = boards.find(x => x.id == selectedBoard);
                const c = classes.find(x => x.class_id == selectedClass || x.id == selectedClass);
                const st = streams.find(x => x.id == selectedStream);
                if (!b || !c) return;
                await api.post('/structure/fetch-out-subjects', {
                    board_id: b.id, board_name: b.name,
                    class_id: c.class_id || c.id, class_name: c.name,
                    stream_id: st?.id, stream_name: st?.name
                });
                let url = `/structure/subjects?category_id=${selectedCat}&board_id=${selectedBoard}&class_id=${selectedClass}`;
                if (selectedStream) url += `&stream_id=${selectedStream}`;
                const res = await api.get(url);
                setSubjects(res.data);
            } else if (type === 'chapters') {
                const s = subjects.find(x => x.id == selectedSubject);
                const b = boards.find(x => x.id == selectedBoard);
                const c = classes.find(x => x.class_id == selectedClass || x.id == selectedClass);
                if (!s || !b || !c) return;
                await api.post('/structure/fetch-out-chapters', {
                    subject_id: s.id, subject_name: s.name,
                    board_name: b.name, class_name: c.name
                });
                const res = await api.get(`/structure/chapters/${selectedSubject}`);
                setChapters(res.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || `Failed to fetch ${type} via AI`);
        } finally {
            setIsFetchingAI('');
        }
    };

    // ── RENDERERS ──

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
            <AdSlot type="mid" />

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8 text-center">{error}</div>}

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">

                {/* 1. Category Identifier - Global for all flows */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Category</label>
                    <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold text-indigo-900"
                        value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
                        <option value="">Choose Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* ── FLOW SPECIFIC UIs ── */}

                {/* SCHOOL FLOW */}
                {flowType === 'school' && selectedCat && (
                    <>
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
                                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)} disabled={!selectedState || isFetchingAI === 'boards'}>
                                    <option value="">{isFetchingAI === 'boards' ? 'Generating by AI...' : 'Choose Board'}</option>
                                    {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                {selectedState && boards.length === 0 && (
                                    <button onClick={() => handleAIFetch('boards')} disabled={isFetchingAI === 'boards'}
                                        className="mt-2 w-full text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 py-2 rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                                        ✨ {isFetchingAI === 'boards' ? 'Searching Internet...' : 'Fetch Official Boards via Neural Engine'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Class</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStream(''); setSelectedSubject(''); }} disabled={!selectedBoard}>
                                    <option value="">Choose Class</option>
                                    {classes.map(c => <option key={c.id} value={c.class_id || c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            {needsStream ? (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Stream</label>
                                    <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedStream} onChange={e => { setSelectedStream(e.target.value); setSelectedSubject(''); }} disabled={!selectedClass}>
                                        <option value="">Choose Stream</option>
                                        {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Subject</label>
                                    <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); }} disabled={!selectedClass || isFetchingAI === 'subjects'}>
                                        <option value="">{isFetchingAI === 'subjects' ? 'Generating Syllabus...' : 'Choose Subject'}</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {selectedClass && subjects.length === 0 && (
                                        <button onClick={() => handleAIFetch('subjects')} disabled={isFetchingAI === 'subjects'}
                                            className="mt-2 w-full text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 py-2 rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                                            ✨ {isFetchingAI === 'subjects' ? 'Fetching Syllabus...' : 'Fetch Missing Subjects'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* UNIVERSITY FLOW */}
                {flowType === 'university' && selectedCat && (
                    <>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select State</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedState} onChange={e => setSelectedState(e.target.value)}>
                                    <option value="">Choose State</option>
                                    {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select University</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedUniversity} onChange={e => setSelectedUniversity(e.target.value)} disabled={!selectedState}>
                                    <option value="">Choose University</option>
                                    {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Semester</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedSemester} onChange={e => { setSelectedSemester(e.target.value); setSelectedSubject(''); }} disabled={!selectedUniversity}>
                                    <option value="">Choose Semester</option>
                                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Subject</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); }} disabled={!selectedSemester}>
                                    <option value="">Choose Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {/* COMPETITIVE FLOW */}
                {flowType === 'competitive' && selectedCat && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Exam Stage / Paper</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedPaperStage} onChange={e => { setSelectedPaperStage(e.target.value); setSelectedSubject(''); }}>
                                <option value="">Choose Exam Stage</option>
                                {papersStages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Subject</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); }} disabled={!selectedPaperStage}>
                                <option value="">Choose Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}


                {/* ── COMMON CHAPTER SELECTOR & ACTION BUTTON ── */}

                {selectedCat && (
                    <>
                        {/* If it's School Stream mode we need a different layout to match the original, but let's just use grid logic */}
                        {((flowType === 'school' && needsStream) || flowType !== 'school') && selectedSubject !== false && (
                            <div className={`grid md:grid-cols-2 gap-6 ${(flowType === 'competitive' || flowType === 'university') ? 'mt-0' : 'mt-0'}`}>
                                {flowType === 'school' && needsStream && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Subject</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); }} disabled={!selectedStream || isFetchingAI === 'subjects'}>
                                            <option value="">{isFetchingAI === 'subjects' ? 'Fetching Syllabus...' : 'Choose Subject'}</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        {selectedStream && subjects.length === 0 && (
                                            <button onClick={() => handleAIFetch('subjects')} disabled={isFetchingAI === 'subjects'}
                                                className="mt-2 w-full text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 py-2 rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                                                ✨ {isFetchingAI === 'subjects' ? 'Deep AI Search...' : 'Fetch Missing Subjects'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div className={flowType !== 'school' || !needsStream ? 'col-span-1' : ''}>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Chapter</label>
                                    <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} disabled={!selectedSubject || isFetchingAI === 'chapters'}>
                                        <option value="">{isFetchingAI === 'chapters' ? 'Reading Books...' : 'Choose Chapter'}</option>
                                        {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {selectedSubject && chapters.length === 0 && (
                                        <button onClick={() => handleAIFetch('chapters')} disabled={isFetchingAI === 'chapters'}
                                            className="mt-2 w-full text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 py-2 rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                                            ✨ {isFetchingAI === 'chapters' ? 'Extracting Chapters...' : 'Fetch Official Chapters via NCERT/Board Logic'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {flowType === 'school' && !needsStream && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Chapter</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} disabled={!selectedSubject || isFetchingAI === 'chapters'}>
                                    <option value="">{isFetchingAI === 'chapters' ? 'Loading Chapters...' : 'Choose Chapter'}</option>
                                    {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {selectedSubject && chapters.length === 0 && (
                                    <button onClick={() => handleAIFetch('chapters')} disabled={isFetchingAI === 'chapters'}
                                        className="mt-2 w-full text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 py-2 rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                                        ✨ {isFetchingAI === 'chapters' ? 'Compiling Texts...' : 'Fetch Official Chapters via NCERT/Board Logic'}
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Exam Language</label>
                            <select className="w-full p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold" value={language} onChange={e => setLanguage(e.target.value)}>
                                <option value="English">English</option>
                                <option value="Bengali">Bengali (বাংলা)</option>
                                <option value="Hindi">Hindi (हिंदी)</option>
                                <option value="Urdu">Urdu (اردو)</option>
                                <option value="Assamese">Assamese (অসমীয়া)</option>
                                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                                <option value="Marathi">Marathi (मराठी)</option>
                                <option value="Tamil">Tamil (தமிழ்)</option>
                                <option value="Telugu">Telugu (తెలుగు)</option>
                            </select>
                            <p className="text-xs text-indigo-500 font-medium mt-2">* Exam MCQs will be instantly generated by AI in your chosen language.</p>
                        </div>

                        <button
                            onClick={startSoloPractice}
                            disabled={!selectedChapter || loading}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-indigo-200 transition-all hover:-translate-y-1 block text-center mt-6 disabled:opacity-50 disabled:hover:translate-y-0 relative overflow-hidden"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Generating AI Exam in {language}...
                                </span>
                            ) : 'Start Practice Now'}
                        </button>
                    </>
                )}
            </div>

            <div className="mt-12 text-center text-gray-400">
                <p className="text-sm">Want to compete with friends? <button onClick={() => navigate('/group')} className="text-secondary font-bold hover:underline">Launch Group Mode</button></p>
            </div>

            {showPopup && <PrimePopup onClose={() => setShowPopup(false)} />}
        </div>
    );
};

export default Practice;
