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
    const [catId, setCatId] = useState(1);

    // Selection & Bulk Approval
    const [checkedItems, setCheckedItems] = useState({});
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
            console.log("DEBUG: SchoolCentral load() starting...");
            const [st, bo, cl, str, sub, ch, catRes] = await Promise.all([
                api.get('/admin/states'),
                api.get('/admin/boards'),
                api.get('/admin/classes'),
                api.get('/admin/streams'),
                api.get('/admin/subjects'),
                api.get('/admin/chapters'),
                api.get('/structure/categories')
            ]);
            console.log("DEBUG: SchoolCentral load() success", {
                states: st.data.length,
                boards: bo.data.length,
                subjects: sub.data.length
            });
            setStates(st.data); setBoards(bo.data);
            setStreams(str.data); setSubjects(sub.data); setChapters(ch.data);
            const foundCat = catRes.data.find(c => c.name.toLowerCase().includes('school'));
            if (foundCat) setCatId(foundCat.id);
        } catch (e) {
            console.error("DEBUG: SchoolCentral load() failed", e);
            showToast('Load error: ' + (e.response?.data?.error || e.message), 'error');
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (selBoard) {
            api.get(`/admin/classes/${selBoard.id}`).then(res => {
                console.log("DEBUG: Classes fetched for board", selBoard.id, res.data);
                setClasses(res.data);
            });
        } else {
            setClasses([]);
        }
    }, [selBoard]);

    useEffect(() => {
        console.log("DEBUG: SchoolCentral Data State", {
            boards: boards.length,
            classes: classes.length,
            subjects: subjects.length,
            selBoard: selBoard?.id,
            selClass: selClass?.id || selClass?.class_id
        });
    }, [boards, classes, subjects, selBoard, selClass]);

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
        } catch (e) {
            console.error('[AI-FETCH-BOARDS-ERROR]', e.response?.data || e.message);
            showToast(e.response?.data?.message || e.message, 'error');
        }
        finally { setFetchingKey(''); }
    };

    const aiFetchClasses = async () => {
        if (!selBoard) return showToast('Select a board first', 'error');
        setFetchingKey('classes');
        try {
            const r = await api.post('/ai-fetch/classes', { board_id: selBoard.id, board_name: selBoard.name });
            if (r.data.updatedData) setClasses(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) {
            console.error('[AI-FETCH-CLASSES-ERROR]', e.response?.data || e.message);
            showToast(e.response?.data?.message || e.message, 'error');
        }
        finally { setFetchingKey(''); }
    };

    const aiFetchSubjects = async (force = false) => {
        if (!selBoard || !selClass) return showToast('Select Board & Class first', 'error');
        const classNumStr = selClass?.name.replace(/\D/g, '');
        const classNum = classNumStr ? parseInt(classNumStr) : 0;
        const needsStream = classNum >= 11;
        if (needsStream && !selStream) return showToast('Select Stream first', 'error');

        // Quota save: check if subjects already exist for this context
        const existingSubjects = subjects.filter(s => {
            const isStreamEmpty = !s.stream_id || s.stream_id === 'null' || Number(s.stream_id) === 0;
            return Number(s.board_id) === Number(selBoard.id) &&
                Number(s.class_id) === Number(selClass.class_id || selClass.id) &&
                (selStream ? Number(s.stream_id) === Number(selStream.id) : isStreamEmpty);
        });

        if (!force && existingSubjects.length > 0) {
            return showToast(`Already has ${existingSubjects.length} subjects. Use Force Re-sync to refresh.`, 'info');
        }

        setFetchingKey('subjects');
        try {
            const context_name = `${selBoard.name} ${selClass.name} ${selStream ? selStream.name : ''}`;
            const r = await api.post('/ai-fetch/subjects', {
                category_id: catId,
                board_id: selBoard.id,
                class_id: selClass.class_id || selClass.id,
                stream_id: selStream?.id || null,
                context_name,
                force: force === true
            });
            if (r.data.updatedData) setSubjects(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) {
            console.error('[AI-FETCH-SUBJECTS-ERROR]', e.response?.data || e.message);
            showToast(e.response?.data?.message || e.message, 'error');
        }
        finally { setFetchingKey(''); }
    };

    // ── Auto-cascade helpers ───────────────────────────────────────────────
    const autoFetchSubjects = async (board, cls, stream) => {
        if (!board || !cls) return;
        const classNumStr = cls.name.replace(/\D/g, '');
        const classNum = classNumStr ? parseInt(classNumStr) : 0;
        if (classNum >= 11 && !stream) return; // needs stream first
        // Skip if data already exists
        const existing = subjects.filter(s => {
            const isStreamEmpty = !s.stream_id || s.stream_id === 'null' || Number(s.stream_id) === 0;
            return Number(s.board_id) === Number(board.id) &&
                Number(s.class_id) === Number(cls.class_id || cls.id) &&
                (stream ? Number(s.stream_id) === Number(stream.id) : isStreamEmpty);
        });
        if (existing.length > 0) return; // already loaded, no AI needed
        setFetchingKey('subjects');
        try {
            const context = `${board.name}, Class ${cls.name}${stream ? ', ' + stream.name + ' stream' : ''}`;
            const r = await api.post('/ai-fetch/subjects', {
                category_id: catId,
                board_id: board.id,
                class_id: cls.class_id || cls.id,
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
        const sId = Number(subject.id);
        const existing = chapters.filter(c => Number(c.subject_id) === sId);
        if (existing.length > 0) return; // already loaded
        setFetchingKey('chapters');
        try {
            const r = await api.post('/ai-fetch/chapters', { subject_id: sId, subject_name: subject.name });
            if (r.data.updatedData) setChapters(r.data.updatedData);
            if (r.data.count > 0) showToast(`✅ ${r.data.count} chapters auto-loaded!`);
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const aiFetchChapters = async () => {
        if (!selSubject) return showToast('Select a subject first', 'error');
        // Quota save: check if chapters already exist for this subject
        const existingChapters = chapters.filter(c => Number(c.subject_id) === Number(selSubject.id));
        if (existingChapters.length > 0) {
            return showToast(`${existingChapters.length} chapters already loaded. Delete them first to re-fetch.`, 'error');
        }
        setFetchingKey('chapters');
        try {
            const r = await api.post('/ai-fetch/chapters', { subject_id: selSubject.id, subject_name: selSubject.name });
            if (r.data.updatedData) setChapters(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) {
            console.error('[AI-FETCH-CHAPTERS-ERROR]', e.response?.data || e.message);
            showToast(e.response?.data?.message || e.message, 'error');
        }
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

    // -- Bulk Approve
    const handleBulkApprove = async () => {
        const payloadPromises = [];
        for (const [table, ids] of Object.entries(checkedItems)) {
            const arr = Array.from(ids);
            if (arr.length > 0) {
                payloadPromises.push(api.put('/admin/bulk-approve', { type: table, ids: arr }));
            }
        }
        if (payloadPromises.length === 0) return showToast('No items checked', 'error');
        try {
            await Promise.all(payloadPromises);
            setCheckedItems({});
            load();
            showToast('Selected items approved and live!');
        } catch (e) { showToast(e.response?.data?.error || e.message, 'error'); }
    };

    // -- Manual Add helpers
    const addBoard = async () => {
        if (!selState) return showToast('Select a state first', 'error');
        const name = prompt('Board Name:');
        if (!name) return;
        await api.post('/admin/boards', { name, state_id: selState.id });
        load(); showToast('Board added');
    };

    const addClass = async () => {
        if (!selBoard) return showToast('Select a board first', 'error');
        const name = prompt('Class Name (e.g. Class 7):');
        if (!name) return;
        try {
            await api.post('/admin/classes', { name, board_id: selBoard.id });
            load(); showToast('Class added and linked to board');
        } catch (e) { showToast(e.response?.data?.error || e.message, 'error'); }
    };

    const addSubject = async () => {
        if (!selBoard || !selClass) return showToast('Select Board & Class', 'error');
        const name = prompt('Subject Name:'); if (!name) return;
        await api.post('/admin/subjects', { name, category_id: catId, board_id: selBoard.id, class_id: selClass.id, stream_id: selStream?.id || null });
        load(); showToast('Subject added');
    };

    const addChapter = async () => {
        if (!selSubject) return showToast('Select a subject', 'error');
        const name = prompt('Chapter Name:'); if (!name) return;
        await api.post('/admin/chapters', { name, subject_id: selSubject.id });
        load(); showToast('Chapter added');
    };

    // -- Derived filtered lists
    const filtBoards = selState ? boards.filter(b => b.state_id == selState.id) : [];

    // Debug subjects filter
    const filtSubjects = selBoard && selClass
        ? subjects.filter(s => {
            const curB = Number(selBoard.id);
            const curC = Number(selClass.class_id || selClass.id);
            const curS = selStream ? Number(selStream.id) : null;

            const bMatch = Number(s.board_id) === curB;
            const cMatch = Number(s.class_id) === curC;

            // Handle cases where stream_id might be null, undefined, 0, or the string 'null'
            const isStreamEmpty = !s.stream_id || s.stream_id === 'null' || Number(s.stream_id) === 0;
            const sMatch = curS ? Number(s.stream_id) === curS : isStreamEmpty;

            return bMatch && cMatch && sMatch;
        })
        : [];

    const filtChapters = selSubject ? chapters.filter(c => c.subject_id == selSubject.id) : [];

    // Fix: parseInt('Class 11') = NaN bug — extract number properly
    const classNumStr = selClass?.name.replace(/\D/g, '');
    const needsStream = selClass && classNumStr && parseInt(classNumStr) >= 11;

    // -- Column selector component with Multi-Check support
    const Col = ({ title, tableType, icon: Icon, color, items, selId, onSel, children }) => {
        const isTableValid = !!tableType;
        const handleCheck = (e, id) => {
            e.stopPropagation();
            setCheckedItems(prev => {
                const map = { ...prev };
                if (!map[tableType]) map[tableType] = new Set();
                const set = new Set(map[tableType]);
                if (set.has(id)) set.delete(id); else set.add(id);
                return { ...map, [tableType]: set };
            });
        };
        const handleCheckAll = () => {
            const allInactive = items.filter(i => !i.is_active).map(i => i.id);
            if (allInactive.length === 0) return;
            setCheckedItems(prev => {
                const map = { ...prev };
                const set = new Set(map[tableType] || []);
                const allSelected = allInactive.every(id => set.has(id));
                if (allSelected) {
                    allInactive.forEach(id => set.delete(id));
                } else {
                    allInactive.forEach(id => set.add(id));
                }
                return { ...map, [tableType]: set };
            });
        };

        const hasInactive = items.some(i => !i.is_active);
        const allInactive = items.filter(i => !i.is_active);
        const mapSet = checkedItems[tableType] || new Set();
        const isAllSelected = allInactive.length > 0 && allInactive.every(i => mapSet.has(i.id));

        return (
            <div className="flex flex-col min-w-[160px] max-w-[200px] flex-shrink-0 relative">
                <div className={`px-3 py-2 border-b border-gray-800 flex items-center justify-between gap-1`}>
                    <div className={`flex items-center gap-2 ${color}`}>
                        <Icon size={14} /> <span className="text-[11px] font-black uppercase tracking-wider">{title}</span>
                    </div>
                </div>
                {isTableValid && hasInactive && (
                    <div className="px-3 py-2.5 border-b-2 border-indigo-500 bg-indigo-900/40 flex items-center justify-between cursor-pointer hover:bg-indigo-700/50 transition-all shadow-inner" onClick={handleCheckAll}>
                        <span className="text-xs font-black text-indigo-100 uppercase tracking-widest leading-none mt-0.5">MARK ALL</span>
                        <input type="checkbox" checked={isAllSelected} onChange={() => { }} className="w-4 h-4 text-indigo-400 rounded border-indigo-400 bg-gray-900 focus:ring-0 cursor-pointer pointer-events-none shadow" />
                    </div>
                )}
                <div className="flex-1 overflow-y-auto max-h-72 space-y-0.5 p-2" style={{ paddingBottom: '3rem' }}>
                    {items.length === 0
                        ? <p className="text-[10px] text-gray-600 italic p-2">None yet</p>
                        : items.map(item => (
                            <div key={item.id} className={`flex items-center mb-1 border-b border-gray-800/50 pb-1 rounded-sm transition-colors ${selId === item.id ? 'bg-indigo-600/10' : 'hover:bg-gray-800/50'}`}>
                                {isTableValid && (
                                    <div className="pl-2 pr-1.5 py-1.5 cursor-pointer flex-shrink-0" onClick={(e) => !item.is_active && handleCheck(e, item.id)}>
                                        {!item.is_active ? (
                                            <input type="checkbox" checked={mapSet.has(item.id)} onChange={() => { }} className="w-3.5 h-3.5 rounded border-gray-500 bg-gray-900 text-indigo-500 focus:ring-0 cursor-pointer pointer-events-none" />
                                        ) : (
                                            <div title="Saved / Live" className="w-3.5 h-3.5 rounded-sm bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                                <Check size={10} className="text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button
                                    onClick={() => onSel(item)}
                                    title={item.name}
                                    className={`flex-1 text-left px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-between group ${selId === item.id ? 'text-indigo-300 font-bold' : 'text-gray-400 hover:text-white'} ${!item.is_active ? 'opacity-70' : ''}`}
                                >
                                    <span className="truncate">{item.name}</span>
                                    <ChevronRight size={11} className={`flex-shrink-0 ml-1 ${selId === item.id ? 'opacity-100 text-indigo-400' : 'opacity-0 group-hover:opacity-40'}`} />
                                </button>
                            </div>
                        ))
                    }
                </div>
                {children && <div className="p-2 border-t border-gray-800 z-10 space-y-1 bg-gray-900 absolute bottom-0 w-full shadow-[0_-10px_20px_rgb(0,0,0,0.5)]">{children}</div>}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">School Central</h2>
                    <p className="text-gray-500 text-xs mt-0.5">State → Board → Class → Stream → Subject → Chapter</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={async () => {
                        try {
                            const r = await api.get('/admin/fix-subjects');
                            showToast(r.data.message || 'Database Healed successfully!');
                            load();
                        } catch (e) { showToast(e.response?.data?.error || e.message, 'error'); }
                    }} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-500 hover:text-white transition-all">
                        Fix Database Sync
                    </button>
                    <button onClick={load} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><RefreshCw size={16} /></button>
                </div>
            </div>

            {/* Hierarchy Flow */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
                <div className="flex divide-x divide-gray-800">

                    {/* STATES */}
                    <Col title="State" tableType="states" icon={School} color="text-blue-400" items={states} selId={selState?.id}
                        onSel={async (s) => {
                            setSelState(s);
                            setSelBoard(null); setSelClass(null); setSelStream(null); setSelSubject(null);
                            // Auto-fetch boards for selected state
                            const existing = boards.filter(b => b.state_id == s.id);
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
                    <Col title="Board" tableType="boards" icon={School} color="text-indigo-400" items={filtBoards} selId={selBoard?.id} onSel={(b) => { setSelBoard(b); setSelClass(null); setSelStream(null); setSelSubject(null); }}>
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

                    {/* CLASSES — fetched strictly per board */}
                    <Col title="Class" tableType="classes" icon={School} color="text-violet-400" items={classes} selId={selClass?.id}
                        onSel={async (c) => {
                            setSelClass(c); setSelStream(null); setSelSubject(null);
                            // Auto-fetch subjects if no stream needed
                            const classNumStr = c.name.replace(/\D/g, '');
                            const classNum = classNumStr ? parseInt(classNumStr) : 0;
                            if (classNum < 11) await autoFetchSubjects(selBoard, c, null);
                        }}
                    >
                        <AIFetchBtn label="AI Fetch" onClick={aiFetchClasses} loading={fetchingKey === 'classes'} />
                        <AddBtn label="Add Manual" onClick={addClass} />
                    </Col>

                    {/* STREAM (only for Class 11-12) */}
                    {needsStream && (
                        <Col title="Stream" tableType="streams" icon={School} color="text-yellow-400" items={streams} selId={selStream?.id}
                            onSel={async (s) => { setSelStream(s); setSelSubject(null); await autoFetchSubjects(selBoard, selClass, s); }}
                        >
                            <AIFetchBtn label="AI Fetch" onClick={aiFetchStreams} loading={fetchingKey === 'streams'} />
                        </Col>
                    )}

                    {/* SUBJECTS */}
                    <Col title="Subject" tableType="subjects" icon={School} color="text-green-400"
                        items={filtSubjects}
                        selId={selSubject?.id}
                        onSel={async (s) => { setSelSubject(s); await autoFetchChapters(s); }}
                    >
                        {selBoard && selClass && (
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    disabled={fetchingKey === 'subjects'}
                                    onClick={() => aiFetchSubjects(false)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase"
                                >
                                    <Globe size={10} className={fetchingKey === 'subjects' ? 'animate-spin' : ''} />
                                    AI Fetch
                                </button>
                                <button
                                    title="Force fetch even if backend thinks subjects exist"
                                    disabled={fetchingKey === 'subjects'}
                                    onClick={() => aiFetchSubjects(true)}
                                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-pink-600/20 border border-pink-500/30 text-pink-400 rounded hover:bg-pink-600 hover:text-white transition-all text-[10px] font-black uppercase"
                                >
                                    <RefreshCw size={10} className={fetchingKey === 'subjects' ? 'animate-spin' : ''} />
                                    Force
                                </button>
                            </div>
                        )}
                        <AddBtn label="Add Manual" onClick={addSubject} />
                    </Col>

                    {/* CHAPTERS */}
                    <Col title="Chapter" tableType="chapters" icon={School} color="text-orange-400" items={filtChapters} selId={null} onSel={() => { }}>
                        <AIFetchBtn label="AI Fetch" onClick={aiFetchChapters} loading={fetchingKey === 'chapters'} />
                        <AddBtn label="Add Manual" onClick={addChapter} />
                    </Col>
                </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            {Object.values(checkedItems).some(set => set.size > 0) && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-4 z-50 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-400" size={20} />
                        <span className="text-white font-bold text-sm">{Object.values(checkedItems).reduce((sum, set) => sum + set.size, 0)} items selected</span>
                    </div>
                    <button onClick={handleBulkApprove} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Save size={16} /> Save & Enable Selected
                    </button>
                    <button onClick={() => setCheckedItems({})} className="text-gray-400 hover:text-white px-3 text-sm">Cancel</button>
                </div>
            )}

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
    const [checkedItems, setCheckedItems] = useState({}); // { tableType: Set<id> }

    const [states, setStates] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [degreeTypes, setDegreeTypes] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [catId, setCatId] = useState(2);

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
            const [st, uni, deg, sem, sub, ch, catRes] = await Promise.all([
                api.get('/admin/states'),
                api.get('/admin/universities'),
                api.get('/admin/degree-types'),
                api.get('/admin/semesters'),
                api.get('/admin/subjects'),
                api.get('/admin/chapters'),
                api.get('/structure/categories')
            ]);
            setStates(st.data); setUniversities(uni.data); setDegreeTypes(deg.data);
            setSemesters(sem.data); setSubjects(sub.data); setChapters(ch.data);
            const foundCat = catRes.data.find(c => c.name.toLowerCase().includes('university') || c.name.toLowerCase().includes('college'));
            if (foundCat) setCatId(foundCat.id);
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

    const autoFetchSemesters = async (uni, deg) => {
        if (!uni || !deg) return;
        // Check if semesters already exist for this university
        const existing = semesters.filter(s => s.university_id == uni.id);
        if (existing.length > 0) return; // already loaded

        setFetchingKey('semesters');
        try {
            const r = await api.post('/ai-fetch/semesters', {
                university_id: uni.id,
                university_name: uni.name,
                degree_type_name: deg.name
            });
            if (r.data.semesters) {
                setSemesters(prev => {
                    const ids = new Set(prev.map(s => s.id));
                    const newOnes = r.data.semesters.filter(s => !ids.has(s.id));
                    return [...prev, ...newOnes];
                });
                if (r.data.semesters.length > 0) showToast(`✅ ${r.data.semesters.length} terms auto-loaded!`);
            }
        } catch (e) { console.error('Auto Fetch Semesters Error:', e); }
        finally { setFetchingKey(''); }
    };

    const aiFetchSemesters = async () => {
        if (!selUni || !selDegree) return showToast('Select University & Degree Type', 'error');
        const existing = semesters.filter(s => s.university_id == selUni.id);
        if (existing.length > 0) {
            return showToast(`${existing.length} terms already loaded.`, 'error');
        }
        setFetchingKey('semesters');
        try {
            const r = await api.post('/ai-fetch/semesters', {
                university_id: selUni.id,
                university_name: selUni.name,
                degree_type_name: selDegree.name
            });
            if (r.data.semesters) {
                setSemesters(prev => {
                    const ids = new Set(prev.map(s => s.id));
                    const newOnes = r.data.semesters.filter(s => !ids.has(s.id));
                    return [...prev, ...newOnes];
                });
                showToast(r.data.message);
            }
        } catch (e) { showToast(e.response?.data?.message || e.message, 'error'); }
        finally { setFetchingKey(''); }
    };

    const aiFetchSubjects = async (force = false) => {
        if (!selUni || !selDegree) return showToast('Select University & Degree Type', 'error');

        // Quota save: skip if already has subjects
        const existing = subjects.filter(s =>
            Number(s.university_id) === Number(selUni.id) &&
            Number(s.degree_type_id) === Number(selDegree.id) &&
            (selSemester ? Number(s.semester_id) === Number(selSemester.id) : !s.semester_id)
        );

        if (!force && existing.length > 0) {
            return showToast(`Already has ${existing.length} subjects. Use Force to refresh.`, 'info');
        }

        setFetchingKey('subjects');
        try {
            const context = `${selUni.name}, ${selDegree.name}${selSemester ? ', Semester ' + selSemester.name : ''}`;
            const r = await api.post('/ai-fetch/subjects', {
                category_id: catId,
                university_id: selUni.id,
                degree_type_id: selDegree.id,
                semester_id: selSemester?.id || null,
                context_name: context,
                force: force === true
            });
            if (r.data.updatedData) setSubjects(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) {
            console.error('[AI-FETCH-SUBJECTS-ERROR]', e.response?.data || e.message);
            showToast(e.response?.data?.message || e.message, 'error');
        }
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

    const handleBulkApprove = async () => {
        if (Object.values(checkedItems).every(set => set.size === 0)) {
            return showToast('No items selected for bulk action.', 'error');
        }

        try {
            const payloadPromises = [];
            for (const [tableType, idsSet] of Object.entries(checkedItems)) {
                const ids = Array.from(idsSet);
                if (ids.length > 0) {
                    payloadPromises.push(api.put('/admin/bulk-approve', { type: tableType, ids }));
                }
            }
            if (payloadPromises.length > 0) {
                await Promise.all(payloadPromises);
                showToast('Selected items enabled successfully!');
                setCheckedItems({});
                load();
            }
        } catch (e) {
            showToast(e.response?.data?.message || e.message, 'error');
        }
    };

    const filtUnis = selState ? universities.filter(u => u.state_id == selState.id) : [];
    const filtSubjects = selUni && selDegree
        ? subjects.filter(s =>
            s.university_id == selUni.id && s.degree_type_id == selDegree.id &&
            (selSemester ? s.semester_id == selSemester.id : !s.semester_id)
        )
        : [];
    const filtChapters = selSubject ? chapters.filter(c => c.subject_id == selSubject.id) : [];

    const Col = ({ title, tableType, color, items, selId, onSel, children }) => {
        const isTableValid = !!tableType && !['states', 'classes', 'streams', 'degree_types', 'semesters'].includes(tableType);
        const handleCheck = (e, id) => {
            e.stopPropagation();
            setCheckedItems(prev => {
                const map = { ...prev };
                if (!map[tableType]) map[tableType] = new Set();
                const set = new Set(map[tableType]);
                if (set.has(id)) set.delete(id); else set.add(id);
                return { ...map, [tableType]: set };
            });
        };
        const handleCheckAll = () => {
            const allInactive = items.filter(i => !i.is_active).map(i => i.id);
            if (allInactive.length === 0) return;
            setCheckedItems(prev => {
                const map = { ...prev };
                const set = new Set(map[tableType] || []);
                const allSelected = allInactive.every(id => set.has(id));
                if (allSelected) {
                    allInactive.forEach(id => set.delete(id));
                } else {
                    allInactive.forEach(id => set.add(id));
                }
                return { ...map, [tableType]: set };
            });
        };

        const hasInactive = items.some(i => !i.is_active);
        const allInactive = items.filter(i => !i.is_active);
        const mapSet = checkedItems[tableType] || new Set();
        const isAllSelected = allInactive.length > 0 && allInactive.every(i => mapSet.has(i.id));

        return (
            <div className="flex flex-col min-w-[160px] max-w-[200px] flex-shrink-0 relative">
                <div className={`px-3 py-2 border-b border-gray-800 flex items-center justify-between gap-1`}>
                    <div className={`flex items-center gap-2 ${color}`}>
                        <span className="text-[11px] font-black uppercase tracking-wider">{title}</span>
                    </div>
                </div>
                {isTableValid && hasInactive && (
                    <div className="px-3 py-2 border-b border-gray-800 bg-gray-800/50 flex items-center justify-between cursor-pointer group hover:bg-gray-800 transition-all" onClick={handleCheckAll}>
                        <span className="text-[10px] font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">Select All Inactive</span>
                        <input type="checkbox" checked={isAllSelected} onChange={() => { }} className="w-3.5 h-3.5 text-indigo-500 rounded border-gray-500 bg-gray-800 focus:ring-0 cursor-pointer pointer-events-none" />
                    </div>
                )}
                <div className="flex-1 overflow-y-auto max-h-64 space-y-0.5 p-2" style={{ paddingBottom: '3rem' }}>
                    {items.length === 0
                        ? <p className="text-[10px] text-gray-600 italic p-2">None yet</p>
                        : items.map(item => (
                            <div key={item.id} className="flex flex-col mb-1 border-b border-gray-800/50 pb-1">
                                <button
                                    onClick={() => onSel(item)}
                                    title={item.name}
                                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-between group ${selId == item.id ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} ${!item.is_active ? 'opacity-50 line-through decoration-red-500/50' : ''}`}
                                >
                                    <span className="truncate">{item.name}</span>
                                    <ChevronRight size={11} className={`flex-shrink-0 ${selId == item.id ? 'opacity-60' : 'opacity-0 group-hover:opacity-60'}`} />
                                </button>
                                {isTableValid && (
                                    <div className="flex items-center justify-between px-2 pt-1">
                                        <div className="flex items-center gap-1.5" onClick={(e) => handleCheck(e, item.id)}>
                                            <input type="checkbox" checked={mapSet.has(item.id)} onChange={() => { }} className="w-3 h-3 text-indigo-600 rounded border-gray-600 focus:ring-0 cursor-pointer" />
                                            <span className="text-[9px] text-gray-500 font-bold uppercase cursor-pointer">{item.is_active ? 'LIVE' : 'HIDDEN'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>
                {children && <div className="p-2 border-t border-gray-800 z-10 space-y-1 bg-gray-900 absolute bottom-0 w-full shadow-[0_-10px_20px_rgb(0,0,0,0.5)]">{children}</div>}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <Toast msg={toast.msg} type={toast.type} />

            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">University Hub</h2>
                    <p className="text-gray-500 text-xs mt-0.5">University → Degree Type → Semester → Subject → Chapter</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={async () => {
                        try {
                            const r = await api.get('/admin/fix-subjects');
                            showToast(r.data.message || 'Database Healed successfully!');
                            load();
                        } catch (e) { showToast(e.response?.data?.error || e.message, 'error'); }
                    }} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-500 hover:text-white transition-all">
                        Fix Database Sync
                    </button>
                    <button onClick={load} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><RefreshCw size={16} /></button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
                <div className="flex divide-x divide-gray-800">
                    <Col title="State" tableType="states" color="text-blue-400" items={states} selId={selState?.id}
                        onSel={(s) => { setSelState(s); setSelUni(null); setSelDegree(null); setSelSemester(null); setSelSubject(null); }}
                    >
                        <AddBtn label="Add State" onClick={async () => { const n = prompt('State Name:'); if (n) { await api.post('/admin/states', { name: n }); load(); } }} />
                    </Col>

                    <Col title="University" tableType="universities" color="text-violet-400" items={filtUnis} selId={selUni?.id}
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

                    <Col title="Degree Type" tableType="degree_types" color="text-pink-400" items={selUni ? degreeTypes : []} selId={selDegree?.id}
                        onSel={(d) => { setSelDegree(d); setSelSemester(null); setSelSubject(null); autoFetchSemesters(selUni, d); }}
                    />

                    <Col title="Semester" tableType="semesters" color="text-yellow-400" items={selDegree ? semesters.filter(s => s.university_id == selUni?.id) : []} selId={selSemester?.id}
                        onSel={(s) => { setSelSemester(s); setSelSubject(null); }}
                    >
                        <AIFetchBtn label="AI Fetch" onClick={aiFetchSemesters} loading={fetchingKey === 'semesters'} />
                    </Col>

                    <Col title="Subject" tableType="subjects" color="text-green-400" items={filtSubjects} selId={selSubject?.id} onSel={setSelSubject}>
                        {selUni && selDegree && (
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    disabled={fetchingKey === 'subjects'}
                                    onClick={() => aiFetchSubjects(false)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase"
                                >
                                    <Globe size={10} className={fetchingKey === 'subjects' ? 'animate-spin' : ''} />
                                    AI Fetch
                                </button>
                                <button
                                    title="Force fetch even if backend thinks subjects exist"
                                    disabled={fetchingKey === 'subjects'}
                                    onClick={() => aiFetchSubjects(true)}
                                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-pink-600/20 border border-pink-500/30 text-pink-400 rounded hover:bg-pink-600 hover:text-white transition-all text-[10px] font-black uppercase"
                                >
                                    <RefreshCw size={10} className={fetchingKey === 'subjects' ? 'animate-spin' : ''} />
                                    Force
                                </button>
                            </div>
                        )}
                        <AddBtn label="Add Manual" onClick={async () => {
                            if (!selDegree) return showToast('Select a degree type', 'error');
                            const n = prompt('Subject Name:'); if (!n) return;
                            await api.post('/admin/subjects', { name: n, category_id: catId, university_id: selUni.id, degree_type_id: selDegree.id, semester_id: selSemester?.id || null });
                            load(); showToast('Subject added');
                        }} />
                    </Col>

                    <Col title="Chapter" tableType="chapters" color="text-orange-400" items={filtChapters} selId={null} onSel={() => { }}>
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

            {/* Bulk Actions Floating Bar */}
            {Object.values(checkedItems).some(set => set.size > 0) && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-4 z-50 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-400" size={20} />
                        <span className="text-white font-bold text-sm">{Object.values(checkedItems).reduce((sum, set) => sum + set.size, 0)} items selected</span>
                    </div>
                    <button onClick={handleBulkApprove} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Save size={16} /> Save & Enable Selected
                    </button>
                    <button onClick={() => setCheckedItems({})} className="text-gray-400 hover:text-white px-3 text-sm">Cancel</button>
                </div>
            )}

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
   GLOBAL CATEGORIES (Root Level)
   Add, Edit, Enable/Disable Top-Level System Categories natively here
────────────────────────────────────────────────────────────────────────── */
export function GlobalCategories() {
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [categories, setCategories] = useState([]);
    const [catModalOpen, setCatModalOpen] = useState(false);
    const [catForm, setCatForm] = useState({ id: null, name: '', image_url: '', description: '', is_active: true, sort_order: 0 });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    };

    const load = useCallback(async () => {
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data);
        } catch (e) { showToast('Load error', 'error'); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSaveCategory = async () => {
        if (!catForm.name) return showToast('Name is required', 'error');
        try {
            if (catForm.id) {
                await api.put(`/admin/categories/${catForm.id}`, catForm);
            } else {
                await api.post('/admin/categories', catForm);
            }
            showToast(catForm.id ? 'Category updated' : 'Category added');
            setCatModalOpen(false);
            load();
        } catch (e) {
            showToast(e.response?.data?.error || e.message, 'error');
        }
    };

    const toggleStatus = async (cat) => {
        try {
            await api.put(`/admin/categories/${cat.id}`, { ...cat, is_active: !cat.is_active });
            load();
            showToast(`Category ${!cat.is_active ? 'enabled' : 'disabled'}`);
        } catch (e) { showToast(e.response?.data?.error || e.message, 'error'); }
    }

    const delCat = async (id) => {
        if (!window.confirm('Delete this category entirely? This might orphan related papers.')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            load();
            showToast('Category Deleted');
        }
        catch (e) { showToast(e.response?.data?.error || e.message, 'error'); }
    };

    return (
        <div className="p-6 space-y-6">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Global Categories</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Manage root-level categories (School, University, UPSC, etc.) shown on Home Page</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={load} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><RefreshCw size={16} /></button>
                    <AddBtn label="Add Top Category" onClick={() => {
                        setCatForm({ id: null, name: '', image_url: '', description: '', is_active: true, sort_order: 99 });
                        setCatModalOpen(true);
                    }} />
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Category Name</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Sort Level</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {categories.sort((a, b) => a.sort_order - b.sort_order).map(c => (
                            <tr key={c.id} className="hover:bg-gray-800/30 text-gray-300">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {c.image_url ? <img src={c.image_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-600 font-bold">IMG</span>}
                                        </div>
                                        <span className="text-sm font-bold text-white">{c.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-xs max-w-xs truncate">{c.description || <span className="text-gray-600 italic">No description</span>}</td>
                                <td className="px-4 py-4">
                                    <StatusBadge active={c.is_active} onClick={() => toggleStatus(c)} />
                                </td>
                                <td className="px-4 py-4 text-xs font-mono text-gray-400">{c.sort_order}</td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => { setCatForm({ ...c }); setCatModalOpen(true); }} className="text-gray-500 hover:text-yellow-400 p-1.5 transition-colors"><Edit size={14} /></button>
                                        <button onClick={() => delCat(c.id)} className="text-gray-500 hover:text-red-400 p-1.5 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {catModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl w-full max-w-md">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4">
                            {catForm.id ? 'Edit Category' : 'Add Category'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Name</label>
                                <input type="text" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white" placeholder="e.g. UPSC" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Image URL</label>
                                <input type="text" value={catForm.image_url} onChange={e => setCatForm({ ...catForm, image_url: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Description</label>
                                <textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm" rows="3" placeholder="Brief info about category..."></textarea>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Sort Level</label>
                                    <input type="number" value={catForm.sort_order} onChange={e => setCatForm({ ...catForm, sort_order: parseInt(e.target.value) || 0 })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 border-b border-transparent">Status</label>
                                    <button
                                        onClick={() => setCatForm({ ...catForm, is_active: !catForm.is_active })}
                                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${catForm.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                                    >
                                        {catForm.is_active ? 'Enabled' : 'Disabled'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button onClick={() => setCatModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 text-xs font-bold uppercase tracking-wider transition-all">Cancel</button>
                            <button onClick={handleSaveCategory} className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider transition-all">Save</button>
                        </div>
                    </div>
                </div>
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
    const [checkedItems, setCheckedItems] = useState({}); // { tableType: Set<id> }

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

    const aiFetchSubjects = async (force = false) => {
        if (!selCat || !selPaper) return showToast('Select Category & Paper', 'error');

        // Quota save
        const existing = subjects.filter(s =>
            Number(s.category_id) === Number(selCat.id) &&
            Number(s.paper_stage_id) === Number(selPaper.id)
        );

        if (!force && existing.length > 0) {
            return showToast(`Already has ${existing.length} subjects. Use Force to refresh.`, 'info');
        }

        setFetchingKey('subjects');
        try {
            const r = await api.post('/ai-fetch/subjects', {
                category_id: selCat.id,
                paper_stage_id: selPaper.id,
                context_name: `${selCat.name} - ${selPaper.name}`,
                force: force === true
            });
            if (r.data.updatedData) setSubjects(r.data.updatedData);
            showToast(r.data.message);
        } catch (e) {
            console.error('[AI-FETCH-SUBJECTS-ERROR]', e.response?.data || e.message);
            showToast(e.response?.data?.message || e.message, 'error');
        }
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

    const handleBulkApprove = async () => {
        if (Object.values(checkedItems).every(set => set.size === 0)) {
            return showToast('No items selected for bulk action.', 'error');
        }

        try {
            const payloadPromises = [];
            for (const [tableType, idsSet] of Object.entries(checkedItems)) {
                const ids = Array.from(idsSet);
                if (ids.length > 0) {
                    // Fix: Use correct backend endpoint and method
                    payloadPromises.push(api.put('/admin/bulk-approve', { type: tableType, ids }));
                }
            }
            if (payloadPromises.length > 0) {
                await Promise.all(payloadPromises);
                showToast('Selected items enabled successfully!');
                setCheckedItems({});
                load();
            }
        } catch (e) {
            showToast(e.response?.data?.message || e.message, 'error');
        }
    };

    const filtPapers = selCat ? papers.filter(p => p.category_id == selCat.id) : [];
    const filtSubjects = selCat && selPaper
        ? subjects.filter(s => s.category_id == selCat.id && s.paper_stage_id == selPaper.id)
        : [];
    const filtChapters = selSubject ? chapters.filter(c => c.subject_id == selSubject.id) : [];

    const Col = ({ title, tableType, color, items, selId, onSel, children }) => {
        const isTableValid = !!tableType && !['states', 'classes', 'streams', 'degree_types', 'semesters'].includes(tableType);
        const handleCheck = (e, id) => {
            e.stopPropagation();
            setCheckedItems(prev => {
                const map = { ...prev };
                if (!map[tableType]) map[tableType] = new Set();
                const set = new Set(map[tableType]);
                if (set.has(id)) set.delete(id); else set.add(id);
                return { ...map, [tableType]: set };
            });
        };
        const handleCheckAll = () => {
            const allInactive = items.filter(i => !i.is_active).map(i => i.id);
            if (allInactive.length === 0) return;
            setCheckedItems(prev => {
                const map = { ...prev };
                const set = new Set(map[tableType] || []);
                const allSelected = allInactive.every(id => set.has(id));
                if (allSelected) {
                    allInactive.forEach(id => set.delete(id));
                } else {
                    allInactive.forEach(id => set.add(id));
                }
                return { ...map, [tableType]: set };
            });
        };

        const hasInactive = items.some(i => !i.is_active);
        const allInactive = items.filter(i => !i.is_active);
        const mapSet = checkedItems[tableType] || new Set();
        const isAllSelected = allInactive.length > 0 && allInactive.every(i => mapSet.has(i.id));

        return (
            <div className="flex flex-col min-w-[160px] max-w-[200px] flex-shrink-0 relative">
                <div className={`px-3 py-2 border-b border-gray-800 flex items-center justify-between gap-1`}>
                    <div className={`flex items-center gap-2 ${color}`}>
                        <span className="text-[11px] font-black uppercase tracking-wider">{title}</span>
                    </div>
                    {isTableValid && hasInactive && (
                        <button onClick={handleCheckAll} className="text-[10px] bg-gray-800 text-gray-300 font-bold px-1.5 py-0.5 rounded hover:bg-gray-700 transition-all">
                            {isAllSelected ? '- ALL' : '+ ALL'}
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto max-h-64 space-y-0.5 p-2" style={{ paddingBottom: '3rem' }}>
                    {items.length === 0
                        ? <p className="text-[10px] text-gray-600 italic p-2">None yet</p>
                        : items.map(item => (
                            <div key={item.id} className="flex flex-col mb-1 border-b border-gray-800/50 pb-1">
                                <button
                                    onClick={() => onSel(item)}
                                    title={item.name}
                                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-between group ${selId == item.id ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} ${!item.is_active ? 'opacity-50 line-through decoration-red-500/50' : ''}`}
                                >
                                    <span className="truncate">{item.name}</span>
                                    <ChevronRight size={11} className={`flex-shrink-0 ${selId == item.id ? 'opacity-60' : 'opacity-0 group-hover:opacity-60'}`} />
                                </button>
                                {isTableValid && (
                                    <div className="flex items-center justify-between px-2 pt-1">
                                        <div className="flex items-center gap-1.5" onClick={(e) => handleCheck(e, item.id)}>
                                            <input type="checkbox" checked={mapSet.has(item.id)} onChange={() => { }} className="w-3 h-3 text-indigo-600 rounded border-gray-600 focus:ring-0 cursor-pointer" />
                                            <span className="text-[9px] text-gray-500 font-bold uppercase cursor-pointer">{item.is_active ? 'LIVE' : 'HIDDEN'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>
                {children && <div className="p-2 border-t border-gray-800 z-10 space-y-1 bg-gray-900 absolute bottom-0 w-full shadow-[0_-10px_20px_rgb(0,0,0,0.5)]">{children}</div>}
            </div>
        );
    };

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
                        <div key={cat.id} className="relative group">
                            <button
                                onClick={() => { setSelCat(cat); setSelPaper(null); setSelSubject(null); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border transition-all ${selCat?.id == cat.id
                                    ? 'bg-yellow-500 text-black border-yellow-400'
                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-yellow-500/50 hover:text-yellow-400'} ${!cat.is_active ? 'opacity-50 line-through' : ''}`}
                            >
                                {cat.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hierarchy columns */}
            {selCat && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
                    <div className="flex divide-x divide-gray-800">
                        <Col title="Paper / Stage" tableType="papers_stages" color="text-yellow-400" items={filtPapers} selId={selPaper?.id}
                            onSel={(p) => { setSelPaper(p); setSelSubject(null); }}
                        >
                            <AIFetchBtn label="AI Fetch" onClick={aiFetchPapers} loading={fetchingKey === 'papers'} />
                            <AddBtn label="Add Manual" onClick={async () => {
                                const n = prompt('Paper/Stage Name:'); if (!n) return;
                                await api.post('/admin/papers-stages', { name: n, category_id: selCat.id });
                                load(); showToast('Added');
                            }} />
                        </Col>

                        <Col title="Subject" tableType="subjects" color="text-green-400" items={filtSubjects} selId={selSubject?.id} onSel={setSelSubject}>
                            {selCat && selPaper && (
                                <div className="grid grid-cols-2 gap-1">
                                    <button
                                        disabled={fetchingKey === 'subjects'}
                                        onClick={() => aiFetchSubjects(false)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase"
                                    >
                                        <Globe size={10} className={fetchingKey === 'subjects' ? 'animate-spin' : ''} />
                                        AI Fetch
                                    </button>
                                    <button
                                        title="Force fetch even if backend thinks subjects exist"
                                        disabled={fetchingKey === 'subjects'}
                                        onClick={() => aiFetchSubjects(true)}
                                        className="flex items-center justify-center gap-1.5 px-2 py-2 bg-pink-600/20 border border-pink-500/30 text-pink-400 rounded hover:bg-pink-600 hover:text-white transition-all text-[10px] font-black uppercase"
                                    >
                                        <RefreshCw size={10} className={fetchingKey === 'subjects' ? 'animate-spin' : ''} />
                                        Force
                                    </button>
                                </div>
                            )}
                            <AddBtn label="Add Manual" onClick={async () => {
                                if (!selPaper) return showToast('Select a paper first', 'error');
                                const n = prompt('Subject Name:'); if (!n) return;
                                await api.post('/admin/subjects', { name: n, category_id: selCat.id, paper_stage_id: selPaper.id });
                                load(); showToast('Subject added');
                            }} />
                        </Col>

                        <Col title="Chapter" tableType="chapters" color="text-orange-400" items={filtChapters} selId={null} onSel={() => { }}>
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

            {/* Bulk Actions Floating Bar */}
            {Object.values(checkedItems).some(set => set.size > 0) && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-4 z-50 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-400" size={20} />
                        <span className="text-white font-bold text-sm">{Object.values(checkedItems).reduce((sum, set) => sum + set.size, 0)} items selected</span>
                    </div>
                    <button onClick={handleBulkApprove} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Save size={16} /> Save & Enable Selected
                    </button>
                    <button onClick={() => setCheckedItems({})} className="text-gray-400 hover:text-white px-3 text-sm">Cancel</button>
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
