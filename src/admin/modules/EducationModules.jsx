import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
    School, RefreshCw, Plus, Edit, Trash2, Check, X,
    ChevronRight, Globe, AlertCircle, Loader2, CheckCircle, Save
} from 'lucide-react';

/* ─── Reusable small UI pieces ──────────────────────────────────────────── */

const StatusBadge = ({ active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${active
            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20'}`}
    >
        {active ? 'ENABLED' : 'DISABLED'}
    </button>
);

const Toast = ({ msg, type }) => msg ? (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2 animate-fadeIn ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
        {msg}
    </div>
) : null;

const AIFetchBtn = ({ label, onClick, loading }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
    >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
        {label}
    </button>
);

const AddBtn = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-600 hover:text-white transition-all"
    >
        <Plus size={13} /> {label}
    </button>
);

/* ─────────────────────────────────────────────────────────────────────────
   SCHOOL CENTRAL
   State → Board → Class → Stream → Subject → Chapter
────────────────────────────────────────────────────────────────────────── */
export function SchoolCentral() {
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [fetchingKey, setFetchingKey] = useState('');

    // Data
    const [states, setStates] = useState([]);
    const [boards, setBoards] = useState([]);
    const [classes, setClasses] = useState([]);
    const [streams, setStreams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    // Selection
    const [selState, setSelState] = useState(null);
    const [selBoard, setSelBoard] = useState(null);
    const [selClass, setSelClass] = useState(null);
    const [selStream, setSelStream] = useState(null);
    const [selSubject, setSelSubject] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    };

    const load = useCallback(async () => {
        try {
            const [st, bo, cl, str, sub, ch] = await Promise.all([
                api.get('/admin/states'),
                api.get('/admin/boards'),
                api.get('/admin/classes'),
                api.get('/admin/streams'),
                api.get('/admin/subjects'),
                api.get('/admin/chapters'),
            ]);
            setStates(st.data); setBoards(bo.data); setClasses(cl.data);
            setStreams(str.data); setSubjects(sub.data); setChapters(ch.data);
        } catch (e) { showToast('Load error: ' + (e.response?.data?.error || e.message), 'error'); }
    }, []);

    useEffect(() => { load(); }, [load]);

    // -- AI Fetch boards (syncMode=true: deletes existing boards for state first)
    const aiFetchBoards = async (syncMode = false) => {
        if (!selState) return showToast('Select a state first', 'error');
        setFetchingKey('boards');
        try {
            if (syncMode) {
                // Delete all existing boards for this state first
                await api.delete(`/admin/boards/state/${selState.id}`);
                showToast('Old boards cleared, fetching fresh from internet...');
            }
            const r = await api.post('/ai-fetch/boards', { state_id: selState.id, state_name: selState.name });
            if (r.data.updatedData) setBoards(r.data.updatedData);
            showToast(r.data.message || 'Boards fetched!');
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const aiFetchSubjects = async () => {
        if (!selBoard || !selClass) return showToast('Select Board & Class first', 'error');
        const classNum = parseInt(selClass?.name.replace(/\D/g, ''));
        const needsStream = classNum >= 11;
        if (needsStream && !selStream) return showToast('Select Stream first', 'error');

        // Quota save: check if subjects already exist for this context
        const existingSubjects = subjects.filter(s =>
            s.board_id === selBoard.id && s.class_id === selClass.id &&
            (selStream ? s.stream_id === selStream.id : !s.stream_id)
        );
        if (existingSubjects.length > 0) {
            return showToast(`${existingSubjects.length} subjects already loaded. Delete them first to re-fetch.`, 'error');
        }

        setFetchingKey('subjects');
        const SCHOOL_CAT_ID = 1;
        try {
            const context = `${selBoard.name}, Class ${selClass.name}${selStream ? ', ' + selStream.name + ' stream' : ''}`;
            const r = await api.post('/ai-fetch/subjects', {
                category_id: SCHOOL_CAT_ID,
                board_id: selBoard.id,
                class_id: selClass.id,
                stream_id: selStream?.id || null,
                context_name: context,
            });
            if (r.data.updatedData) setSubjects(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    // ── Auto-cascade helpers ───────────────────────────────────────────────
    const autoFetchSubjects = async (board, cls, stream) => {
        if (!board || !cls) return;
        const classNum = parseInt(cls.name.replace(/\D/g, ''));
        if (classNum >= 11 && !stream) return; // needs stream first
        // Skip if data already exists
        const existing = subjects.filter(s =>
            s.board_id === board.id && s.class_id === cls.id &&
            (stream ? s.stream_id === stream.id : !s.stream_id)
        );
        if (existing.length > 0) return; // already loaded, no AI needed
        setFetchingKey('subjects');
        try {
            const context = `${board.name}, Class ${cls.name}${stream ? ', ' + stream.name + ' stream' : ''}`;
            const r = await api.post('/ai-fetch/subjects', {
                category_id: 1,
                board_id: board.id,
                class_id: cls.id,
                stream_id: stream?.id || null,
                context_name: context,
            });
            if (r.data.updatedData) setSubjects(r.data.updatedData);
            if (r.data.count > 0) showToast(`✅ ${r.data.count} subjects auto-loaded!`);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const autoFetchChapters = async (subject) => {
        if (!subject) return;
        const existing = chapters.filter(c => c.subject_id === subject.id);
        if (existing.length > 0) return; // already loaded
        setFetchingKey('chapters');
        try {
            const r = await api.post('/ai-fetch/chapters', { subject_id: subject.id, subject_name: subject.name });
            if (r.data.updatedData) setChapters(r.data.updatedData);
            if (r.data.count > 0) showToast(`✅ ${r.data.count} chapters auto-loaded!`);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const aiFetchChapters = async () => {
        if (!selSubject) return showToast('Select a subject first', 'error');
        // Quota save: check if chapters already exist for this subject
        const existingChapters = chapters.filter(c => c.subject_id === selSubject.id);
        if (existingChapters.length > 0) {
            return showToast(`${existingChapters.length} chapters already loaded. Delete them first to re-fetch.`, 'error');
        }
        setFetchingKey('chapters');
        try {
            const r = await api.post('/ai-fetch/chapters', { subject_id: selSubject.id, subject_name: selSubject.name });
            if (r.data.updatedData) setChapters(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const aiFetchStreams = async () => {
        if (!selBoard || !selClass) return showToast('Select Board & Class first', 'error');
        setFetchingKey('streams');
        try {
            const r = await api.post('/ai-fetch/streams', {
                board_name: selBoard.name,
                class_name: selClass.name,
            });
            if (r.data.streams) setStreams(prev => {
                const ids = new Set(prev.map(s => s.id));
                const newOnes = r.data.streams.filter(s => !ids.has(s.id));
                return [...prev, ...newOnes];
            });
            showToast(r.data.message || 'Streams loaded!');
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    // -- Toggle active
    const toggleBoard = async (b) => {
        await api.put(`/admin/boards/${b.id}`, { ...b, is_active: !b.is_active });
        load();
    };
    const toggleSubject = async (s) => {
        await api.put(`/admin/subjects/${s.id}`, { ...s, is_active: !s.is_active });
        load();
    };
    const toggleChapter = async (c) => {
        await api.put(`/admin/chapters/${c.id}`, { ...c, is_active: !c.is_active });
        load();
    };

    // -- Delete
    const del = async (table, id) => {
        if (!window.confirm('Delete this item?')) return;
        try { await api.delete(`/admin/${table}/${id}`); load(); showToast('Deleted'); }
        catch (e) { showToast(e.response?.data?.error || e.message, 'error'); }
    };

    // -- Manual Add helpers
    const addBoard = async () => {
        if (!selState) return showToast('Select a state first', 'error');
        const name = prompt('Board Name:');
        if (!name) return;
        await api.post('/admin/boards', { name, state_id: selState.id });
        load(); showToast('Board added');
    };

    const addSubject = async () => {
        if (!selBoard || !selClass) return showToast('Select Board & Class', 'error');
        const name = prompt('Subject Name:'); if (!name) return;
        const SCHOOL_CAT_ID = 1;
        await api.post('/admin/subjects', { name, category_id: SCHOOL_CAT_ID, board_id: selBoard.id, class_id: selClass.id, stream_id: selStream?.id || null });
        load(); showToast('Subject added');
    };

    const addChapter = async () => {
        if (!selSubject) return showToast('Select a subject', 'error');
        const name = prompt('Chapter Name:'); if (!name) return;
        await api.post('/admin/chapters', { name, subject_id: selSubject.id });
        load(); showToast('Chapter added');
    };

    // -- Smart class filtering based on board name
    const getFilteredClasses = (board) => {
        if (!board) return [];
        const n = board.name.toLowerCase();
        // Higher secondary boards → only Class 11-12
        if (n.includes('higher secondary') || n.includes('intermediate') ||
            n.includes('pre-university') || n.includes('+2') || n.includes('hsc') ||
            n.includes('higher sec') || n.includes('hs board') || n.includes('hslc') ||
            n.includes('council of higher')) {
            return classes.filter(c => parseInt(c.name.replace(/\D/g, '')) >= 11);
        }
        // Primary / elementary boards → Class 1-5
        if (n.includes('primary') || n.includes('elementary') || n.includes('prathamic')) {
            return classes.filter(c => parseInt(c.name.replace(/\D/g, '')) <= 5);
        }
        // Secondary only boards (not higher) → Class 1-10
        if ((n.includes('secondary') && !n.includes('higher')) ||
            n.includes('madhyamik') || n.includes('matriculation') ||
            n.includes('sslc') || n.includes('10th')) {
            return classes.filter(c => parseInt(c.name.replace(/\D/g, '')) <= 10);
        }
        // CBSE, ICSE, NIOS, general state boards → all Classes
        return classes;
    };

    // -- Derived filtered lists
    const filtBoards = selState ? boards.filter(b => b.state_id === selState.id) : [];
    const filtClasses = getFilteredClasses(selBoard);
    const filtSubjects = selBoard && selClass
        ? subjects.filter(s => s.board_id === selBoard.id && s.class_id === selClass.id && (selStream ? s.stream_id === selStream.id : true))
        : [];
    const filtChapters = selSubject ? chapters.filter(c => c.subject_id === selSubject.id) : [];
    // Fix: parseInt('Class 11') = NaN bug — extract number properly
    const needsStream = selClass && parseInt(selClass.name.replace(/\D/g, '')) >= 11;

    // -- Column selector component
    const Col = ({ title, icon: Icon, color, items, selId, onSel, children }) => (
        <div className="flex flex-col min-w-[160px] max-w-[200px] flex-shrink-0">
            <div className={`px-3 py-2 border-b border-gray-800 flex items-center gap-2 ${color}`}>
                <Icon size={14} /> <span className="text-[11px] font-black uppercase tracking-wider">{title}</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-72 space-y-0.5 p-2">
                {items.length === 0
                    ? <p className="text-[10px] text-gray-600 italic p-2">None yet</p>
                    : items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onSel(item)}
                            title={item.name}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-between group ${selId === item.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <span className="truncate">{item.name}</span>
                            <ChevronRight size={11} className={`flex-shrink-0 ${selId === item.id ? 'opacity-60' : 'opacity-0 group-hover:opacity-60'}`} />
                        </button>
                    ))
                }
            </div>
            {children && <div className="p-2 border-t border-gray-800 space-y-1">{children}</div>}
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">School Central</h2>
                    <p className="text-gray-500 text-xs mt-0.5">State → Board → Class → Stream → Subject → Chapter</p>
                </div>
                <button onClick={load} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><RefreshCw size={16} /></button>
            </div>

            {/* Hierarchy Flow */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
                <div className="flex divide-x divide-gray-800">

                    {/* STATES */}
                    <Col title="State" icon={School} color="text-blue-400" items={states} selId={selState?.id}
                        onSel={async (s) => {
                            setSelState(s);
                            setSelBoard(null); setSelClass(null); setSelStream(null); setSelSubject(null);
                            // Auto-fetch boards for selected state
                            const existing = boards.filter(b => b.state_id === s.id);
                            if (existing.length === 0) {
                                setFetchingKey('boards');
                                try {
                                    const r = await api.post('/ai-fetch/boards', { state_id: s.id, state_name: s.name });
                                    if (r.data.updatedData) setBoards(r.data.updatedData);
                                    showToast(r.data.message || 'Boards loaded!');
                                } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
                                finally { setFetchingKey(''); }
                            }
                        }}
                    >
                        <AddBtn label="Add State" onClick={async () => { const n = prompt('State Name:'); if (n) { await api.post('/admin/states', { name: n }); load(); } }} />
                    </Col>

                    {/* BOARDS */}
                    <Col title="Board" icon={School} color="text-indigo-400" items={filtBoards} selId={selBoard?.id} onSel={(b) => { setSelBoard(b); setSelClass(null); setSelStream(null); setSelSubject(null); }}>
                        <AIFetchBtn
                            label={fetchingKey === 'boards' ? 'Fetching...' : 'AI Fetch'}
                            onClick={() => aiFetchBoards(false)}
                            loading={fetchingKey === 'boards'}
                        />
                        <button
                            onClick={() => {
                                if (!window.confirm(`Re-sync all boards for ${selState?.name}? This will DELETE existing boards and fetch fresh from internet.`)) return;
                                aiFetchBoards(true);
                            }}
                            disabled={!selState || fetchingKey === 'boards'}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-600 hover:text-white transition-all disabled:opacity-40"
                        >
                            🔄 Re-sync
                        </button>
                        <AddBtn label="Add Manual" onClick={addBoard} />
                    </Col>

                    {/* CLASSES — filtered based on board type */}
                    <Col title="Class" icon={School} color="text-violet-400" items={filtClasses} selId={selClass?.id}
                        onSel={async (c) => {
                            setSelClass(c); setSelStream(null); setSelSubject(null);
                            // Auto-fetch subjects if no stream needed
                            const classNum = parseInt(c.name.replace(/\D/g, ''));
                            if (classNum < 11) await autoFetchSubjects(selBoard, c, null);
                        }}
                    />

                    {/* STREAM (only for Class 11-12) */}
                    {needsStream && (
                        <Col title="Stream" icon={School} color="text-yellow-400" items={streams} selId={selStream?.id}
                            onSel={async (s) => { setSelStream(s); setSelSubject(null); await autoFetchSubjects(selBoard, selClass, s); }}
                        >
                            <AIFetchBtn label="AI Fetch" onClick={aiFetchStreams} loading={fetchingKey === 'streams'} />
                        </Col>
                    )}

                    {/* SUBJECTS */}
                    <Col title="Subject" icon={School} color="text-green-400"
                        items={filtSubjects}
                        selId={selSubject?.id}
                        onSel={async (s) => { setSelSubject(s); await autoFetchChapters(s); }}
                    >
                        <AIFetchBtn label="AI Fetch" onClick={aiFetchSubjects} loading={fetchingKey === 'subjects'} />
                        <AddBtn label="Add Manual" onClick={addSubject} />
                    </Col>

                    {/* CHAPTERS */}
                    <Col title="Chapter" icon={School} color="text-orange-400" items={filtChapters} selId={null} onSel={() => { }}>
                        <AIFetchBtn label="AI Fetch" onClick={aiFetchChapters} loading={fetchingKey === 'chapters'} />
                        <AddBtn label="Add Manual" onClick={addChapter} />
                    </Col>
                </div>
            </div>

            {/* Board management table */}
            {filtBoards.length > 0 && (
                <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Boards in {selState?.name}</h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase tracking-wider">
                                <tr><th className="px-4 py-3">Board Name</th><th className="px-4 py-3">State</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtBoards.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-800/30 text-gray-300">
                                        <td className="px-4 py-3 text-sm font-bold text-white">{b.name}</td>
                                        <td className="px-4 py-3 text-xs">{b.state_name}</td>
                                        <td className="px-4 py-3"><StatusBadge active={b.is_active} onClick={() => toggleBoard(b)} /></td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => del('boards', b.id)} className="text-gray-500 hover:text-red-400 p-1.5 transition-colors"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Chapters management table */}
            {filtChapters.length > 0 && (
                <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Chapters in {selSubject?.name}</h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase tracking-wider">
                                <tr><th className="px-4 py-3">Chapter</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtChapters.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-800/30 text-gray-300">
                                        <td className="px-4 py-3 text-sm font-bold text-white">{c.name}</td>
                                        <td className="px-4 py-3 text-xs">{c.subject_name}</td>
                                        <td className="px-4 py-3"><StatusBadge active={c.is_active} onClick={() => toggleChapter(c)} /></td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => del('chapters', c.id)} className="text-gray-500 hover:text-red-400 p-1.5 transition-colors"><Trash2 size={14} /></button>
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

/* ─────────────────────────────────────────────────────────────────────────
   UNIVERSITY HUB
   University → Stream → Degree Type → Semester → Subject → Chapter
────────────────────────────────────────────────────────────────────────── */
export function UniversityHub() {
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [fetchingKey, setFetchingKey] = useState('');

    const [states, setStates] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [degreeTypes, setDegreeTypes] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    const [selState, setSelState] = useState(null);
    const [selUni, setSelUni] = useState(null);
    const [selDegree, setSelDegree] = useState(null);
    const [selSemester, setSelSemester] = useState(null);
    const [selSubject, setSelSubject] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    };

    const load = useCallback(async () => {
        try {
            const [st, uni, deg, sem, sub, ch] = await Promise.all([
                api.get('/admin/states'),
                api.get('/admin/universities'),
                api.get('/admin/degree-types'),
                api.get('/admin/semesters'),
                api.get('/admin/subjects'),
                api.get('/admin/chapters'),
            ]);
            setStates(st.data); setUniversities(uni.data); setDegreeTypes(deg.data);
            setSemesters(sem.data); setSubjects(sub.data); setChapters(ch.data);
        } catch (e) { showToast('Load error', 'error'); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const aiFetchUnis = async () => {
        if (!selState) return showToast('Select a state first', 'error');
        setFetchingKey('unis');
        try {
            const r = await api.post('/ai-fetch/universities', { state_id: selState.id, state_name: selState.name });
            if (r.data.updatedData) setUniversities(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const aiFetchSubjects = async () => {
        if (!selUni || !selDegree) return showToast('Select University & Degree Type', 'error');
        setFetchingKey('subjects');
        const UNIV_CAT_ID = 2;
        try {
            const context = `${selUni.name}, ${selDegree.name}${selSemester ? ', Semester ' + selSemester.name : ''}`;
            const r = await api.post('/ai-fetch/subjects', {
                category_id: UNIV_CAT_ID,
                university_id: selUni.id,
                degree_type_id: selDegree.id,
                semester_id: selSemester?.id || null,
                context_name: context,
            });
            if (r.data.updatedData) setSubjects(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const aiFetchChapters = async () => {
        if (!selSubject) return showToast('Select a subject first', 'error');
        setFetchingKey('chapters');
        try {
            const r = await api.post('/ai-fetch/chapters', { subject_id: selSubject.id, subject_name: selSubject.name });
            if (r.data.updatedData) setChapters(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const del = async (table, id) => {
        if (!window.confirm('Delete?')) return;
        try { await api.delete(`/admin/${table}/${id}`); load(); showToast('Deleted'); }
        catch (e) { showToast(e.response?.data?.error || e.message, 'error'); }
    };

    const filtUnis = selState ? universities.filter(u => u.state_id === selState.id) : [];
    const filtSubjects = selUni && selDegree
        ? subjects.filter(s => s.university_id === selUni.id && s.degree_type_id === selDegree.id && (selSemester ? s.semester_id === selSemester.id : true))
        : [];
    const filtChapters = selSubject ? chapters.filter(c => c.subject_id === selSubject.id) : [];

    const Col = ({ title, color, items, selId, onSel, children }) => (
        <div className="flex flex-col min-w-[160px] max-w-[200px] flex-shrink-0">
            <div className={`px-3 py-2 border-b border-gray-800 flex items-center gap-2 ${color}`}>
                <span className="text-[11px] font-black uppercase tracking-wider">{title}</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-64 space-y-0.5 p-2">
                {items.length === 0
                    ? <p className="text-[10px] text-gray-600 italic p-2">None yet</p>
                    : items.map(item => (
                        <button key={item.id} onClick={() => onSel(item)}
                            title={item.name}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all ${selId === item.id ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            {item.name}
                        </button>
                    ))
                }
            </div>
            {children && <div className="p-2 border-t border-gray-800 space-y-1">{children}</div>}
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            <Toast msg={toast.msg} type={toast.type} />

            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">University Hub</h2>
                    <p className="text-gray-500 text-xs mt-0.5">University → Degree Type → Semester → Subject → Chapter</p>
                </div>
                <button onClick={load} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><RefreshCw size={16} /></button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
                <div className="flex divide-x divide-gray-800">
                    <Col title="State" color="text-blue-400" items={states} selId={selState?.id}
                        onSel={(s) => { setSelState(s); setSelUni(null); setSelDegree(null); setSelSemester(null); setSelSubject(null); }}
                    >
                        <AddBtn label="Add State" onClick={async () => { const n = prompt('State Name:'); if (n) { await api.post('/admin/states', { name: n }); load(); } }} />
                    </Col>

                    <Col title="University" color="text-violet-400" items={filtUnis} selId={selUni?.id}
                        onSel={(u) => { setSelUni(u); setSelDegree(null); setSelSemester(null); setSelSubject(null); }}
                    >
                        <AIFetchBtn label="AI Fetch" onClick={aiFetchUnis} loading={fetchingKey === 'unis'} />
                        <AddBtn label="Add Manual" onClick={async () => {
                            if (!selState) return showToast('Select a state', 'error');
                            const n = prompt('University Name:'); if (!n) return;
                            await api.post('/admin/universities', { name: n, state_id: selState.id });
                            load(); showToast('Added');
                        }} />
                    </Col>

                    <Col title="Degree Type" color="text-pink-400" items={selUni ? degreeTypes : []} selId={selDegree?.id}
                        onSel={(d) => { setSelDegree(d); setSelSemester(null); setSelSubject(null); }}
                    />

                    <Col title="Semester" color="text-yellow-400" items={selDegree ? semesters : []} selId={selSemester?.id}
                        onSel={(s) => { setSelSemester(s); setSelSubject(null); }}
                    />

                    <Col title="Subject" color="text-green-400" items={filtSubjects} selId={selSubject?.id} onSel={setSelSubject}>
                        <AIFetchBtn label="AI Fetch" onClick={aiFetchSubjects} loading={fetchingKey === 'subjects'} />
                        <AddBtn label="Add Manual" onClick={async () => {
                            if (!selUni || !selDegree) return showToast('Select Uni & Degree', 'error');
                            const n = prompt('Subject Name:'); if (!n) return;
                            await api.post('/admin/subjects', { name: n, category_id: 2, university_id: selUni.id, degree_type_id: selDegree.id, semester_id: selSemester?.id || null });
                            load(); showToast('Subject added');
                        }} />
                    </Col>

                    <Col title="Chapter" color="text-orange-400" items={filtChapters} selId={null} onSel={() => { }}>
                        <AIFetchBtn label="AI Fetch" onClick={aiFetchChapters} loading={fetchingKey === 'chapters'} />
                        <AddBtn label="Add Manual" onClick={async () => {
                            if (!selSubject) return showToast('Select a subject', 'error');
                            const n = prompt('Chapter Name:'); if (!n) return;
                            await api.post('/admin/chapters', { name: n, subject_id: selSubject.id });
                            load(); showToast('Chapter added');
                        }} />
                    </Col>
                </div>
            </div>

            {/* University Table */}
            {filtUnis.length > 0 && (
                <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Universities in {selState?.name}</h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase tracking-wider">
                                <tr><th className="px-4 py-3">University</th><th className="px-4 py-3">State</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtUnis.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-800/30 text-gray-300">
                                        <td className="px-4 py-3 text-sm font-bold text-white">{u.name}</td>
                                        <td className="px-4 py-3 text-xs">{u.state_name}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge active={u.is_active} onClick={() => { api.put(`/admin/universities/${u.id}`, { ...u, is_active: !u.is_active }).then(load); }} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => del('universities', u.id)} className="text-gray-500 hover:text-red-400 p-1.5 transition-colors"><Trash2 size={14} /></button>
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

/* ─────────────────────────────────────────────────────────────────────────
   COMPETITIVE ARENA
   Exam Category → Paper/Stage → Subject → Chapter
────────────────────────────────────────────────────────────────────────── */
const COMPETITIVE_EXAMS = ['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC', 'NDA', 'CDS', 'NEET', 'JEE', 'Others'];

export function CompetitiveArena() {
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [fetchingKey, setFetchingKey] = useState('');

    const [categories, setCategories] = useState([]);
    const [papers, setPapers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    const [selCat, setSelCat] = useState(null);
    const [selPaper, setSelPaper] = useState(null);
    const [selSubject, setSelSubject] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    };

    const load = useCallback(async () => {
        try {
            const [cat, pap, sub, ch] = await Promise.all([
                api.get('/admin/categories'),
                api.get('/admin/papers-stages'),
                api.get('/admin/subjects'),
                api.get('/admin/chapters'),
            ]);
            // Filter to competitive categories only (those matching exam names or category_id >= 3)
            setCategories(cat.data);
            setPapers(pap.data); setSubjects(sub.data); setChapters(ch.data);
        } catch (e) { showToast('Load error', 'error'); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const aiFetchPapers = async () => {
        if (!selCat) return showToast('Select an exam category', 'error');
        setFetchingKey('papers');
        try {
            const r = await api.post('/ai-fetch/papers', { category_id: selCat.id, category_name: selCat.name });
            if (r.data.updatedData) setPapers(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const aiFetchSubjects = async () => {
        if (!selCat || !selPaper) return showToast('Select Category & Paper', 'error');
        setFetchingKey('subjects');
        try {
            const r = await api.post('/ai-fetch/subjects', {
                category_id: selCat.id,
                paper_stage_id: selPaper.id,
                context_name: `${selCat.name} - ${selPaper.name}`,
            });
            if (r.data.updatedData) setSubjects(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const aiFetchChapters = async () => {
        if (!selSubject) return showToast('Select a subject', 'error');
        setFetchingKey('chapters');
        try {
            const r = await api.post('/ai-fetch/chapters', { subject_id: selSubject.id, subject_name: selSubject.name });
            if (r.data.updatedData) setChapters(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const del = async (table, id) => {
        if (!window.confirm('Delete?')) return;
        try { await api.delete(`/admin/${table}/${id}`); load(); showToast('Deleted'); }
        catch (e) { showToast(e.response?.data?.error || e.message, 'error'); }
    };

    const filtPapers = selCat ? papers.filter(p => p.category_id === selCat.id) : [];
    const filtSubjects = selCat && selPaper
        ? subjects.filter(s => s.category_id === selCat.id && s.paper_stage_id === selPaper.id)
        : [];
    const filtChapters = selSubject ? chapters.filter(c => c.subject_id === selSubject.id) : [];

    const Col = ({ title, color, items, selId, onSel, children }) => (
        <div className="flex flex-col min-w-[160px] max-w-[200px] flex-shrink-0">
            <div className={`px-3 py-2 border-b border-gray-800 text-[11px] font-black uppercase tracking-wider ${color}`}>{title}</div>
            <div className="flex-1 overflow-y-auto max-h-64 space-y-0.5 p-2">
                {items.length === 0
                    ? <p className="text-[10px] text-gray-600 italic p-2">None yet</p>
                    : items.map(item => (
                        <button key={item.id} onClick={() => onSel(item)}
                            title={item.name}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all ${selId === item.id ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >{item.name}</button>
                    ))
                }
            </div>
            {children && <div className="p-2 border-t border-gray-800 space-y-1">{children}</div>}
        </div>
    );

    // Quick-access exam grid
    const compCategories = categories.filter(c =>
        COMPETITIVE_EXAMS.some(ex => c.name?.toLowerCase().includes(ex.toLowerCase()))
        || (c.sort_order >= 3)
    );

    return (
        <div className="p-6 space-y-6">
            <Toast msg={toast.msg} type={toast.type} />

            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Competitive Arena</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Exam → Paper/Stage → Subject → Chapter</p>
                </div>
                <div className="flex gap-2">
                    <AIFetchBtn label="AI Fetch Papers" onClick={aiFetchPapers} loading={fetchingKey === 'papers'} />
                    <button onClick={load} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><RefreshCw size={16} /></button>
                </div>
            </div>

            {/* Exam quick-select grid */}
            <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Select Exam Category</p>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelCat(cat); setSelPaper(null); setSelSubject(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border transition-all ${selCat?.id === cat.id
                                ? 'bg-yellow-500 text-black border-yellow-400'
                                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-yellow-500/50 hover:text-yellow-400'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                    <button
                        onClick={async () => {
                            const n = prompt('New Exam Category Name:'); if (!n) return;
                            await api.post('/admin/categories', { name: n, sort_order: 99 });
                            load(); showToast('Category added');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-black border border-dashed border-gray-600 text-gray-500 hover:text-white hover:border-gray-400 transition-all flex items-center gap-1"
                    >
                        <Plus size={12} /> Add Exam
                    </button>
                </div>
            </div>

            {/* Hierarchy columns */}
            {selCat && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
                    <div className="flex divide-x divide-gray-800">
                        <Col title="Paper / Stage" color="text-yellow-400" items={filtPapers} selId={selPaper?.id}
                            onSel={(p) => { setSelPaper(p); setSelSubject(null); }}
                        >
                            <AIFetchBtn label="AI Fetch" onClick={aiFetchPapers} loading={fetchingKey === 'papers'} />
                            <AddBtn label="Add Manual" onClick={async () => {
                                const n = prompt('Paper/Stage Name:'); if (!n) return;
                                await api.post('/admin/papers-stages', { name: n, category_id: selCat.id });
                                load(); showToast('Added');
                            }} />
                        </Col>

                        <Col title="Subject" color="text-green-400" items={filtSubjects} selId={selSubject?.id} onSel={setSelSubject}>
                            <AIFetchBtn label="AI Fetch" onClick={aiFetchSubjects} loading={fetchingKey === 'subjects'} />
                            <AddBtn label="Add Manual" onClick={async () => {
                                if (!selPaper) return showToast('Select a paper first', 'error');
                                const n = prompt('Subject Name:'); if (!n) return;
                                await api.post('/admin/subjects', { name: n, category_id: selCat.id, paper_stage_id: selPaper.id });
                                load(); showToast('Subject added');
                            }} />
                        </Col>

                        <Col title="Chapter" color="text-orange-400" items={filtChapters} selId={null} onSel={() => { }}>
                            <AIFetchBtn label="AI Fetch" onClick={aiFetchChapters} loading={fetchingKey === 'chapters'} />
                            <AddBtn label="Add Manual" onClick={async () => {
                                if (!selSubject) return showToast('Select a subject', 'error');
                                const n = prompt('Chapter Name:'); if (!n) return;
                                await api.post('/admin/chapters', { name: n, subject_id: selSubject.id });
                                load(); showToast('Chapter added');
                            }} />
                        </Col>
                    </div>
                </div>
            )}

            {/* Papers table */}
            {filtPapers.length > 0 && (
                <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Papers / Stages in {selCat?.name}</h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase tracking-wider">
                                <tr><th className="px-4 py-3">Paper / Stage</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtPapers.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-800/30 text-gray-300">
                                        <td className="px-4 py-3 text-sm font-bold text-white">{p.name}</td>
                                        <td className="px-4 py-3 text-xs">{p.category_name}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge active={p.is_active} onClick={() => { api.put(`/admin/papers-stages/${p.id}`, { ...p, is_active: !p.is_active }).then(load); }} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => del('papers_stages', p.id)} className="text-gray-500 hover:text-red-400 p-1.5 transition-colors"><Trash2 size={14} /></button>
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
