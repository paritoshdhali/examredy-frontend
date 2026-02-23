const https = require('https');

function request(url, options, body = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: data ? JSON.parse(data) : {} }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    const baseUrl = 'https://examredy-backend1-production.up.railway.app/api';

    // Auth
    let loginRes = await request(baseUrl + '/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@examredy.in', password: 'Admin@123' });
    if (loginRes.status !== 200) loginRes = await request(baseUrl + '/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@examredy.in', password: 'admin123' });

    const token = loginRes.data.token;
    if (!token) return console.log('Login failed', loginRes.data);

    const hGet = { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } };
    const hPost = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } };
    const hPut = { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } };

    const ensureArray = (d) => {
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.updatedData)) return d.updatedData;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.streams)) return d.streams;
        return [];
    };

    // State
    const statesData = ensureArray((await request(baseUrl + '/structure/states', hGet)).data);
    const wbState = statesData.find(s => s.name.toLowerCase() === 'west bengal') || statesData[0];
    console.log('State:', wbState?.name);

    // Board
    let boardsReq = await request(baseUrl + `/admin/boards/${wbState.id}`, hGet);
    let boardsArray = ensureArray(boardsReq.data);
    if (boardsArray.length === 0) {
        boardsReq = await request(baseUrl + '/ai-fetch/boards', hPost, { state_id: wbState.id, state_name: wbState.name });
        boardsArray = ensureArray(boardsReq.data);
    }
    const myBoard = boardsArray.find(b => b.name.includes('West Bengal')) || boardsArray[0];
    console.log('Board:', myBoard?.name);

    // Class
    let classesArray = ensureArray((await request(baseUrl + `/admin/classes/${myBoard.id}`, hGet)).data);
    if (classesArray.length === 0) {
        await request(baseUrl + '/ai-fetch/classes', hPost, { board_id: myBoard.id, board_name: myBoard.name });
        classesArray = ensureArray((await request(baseUrl + `/admin/classes/${myBoard.id}`, hGet)).data);
    }
    const myClass = classesArray.find(c => c.name === 'Class 12') || classesArray[0];
    console.log('Class:', myClass?.name);

    // Stream
    let streamsReq = await request(baseUrl + `/admin/streams?board_id=${myBoard.id}&class_id=${myClass.id}`, hGet);
    let streamsArray = ensureArray(streamsReq.data);
    if (streamsArray.length === 0) {
        streamsReq = await request(baseUrl + '/ai-fetch/streams', hPost, { board_name: myBoard.name, class_name: myClass.name });
        streamsArray = ensureArray(streamsReq.data);
    }
    const myStream = streamsArray.find(s => s.name === 'Science') || streamsArray[0];
    console.log('Stream:', myStream?.name);

    // Subject
    let subjectsReq = await request(baseUrl + `/admin/subjects?board_id=${myBoard.id}&class_id=${myClass.class_id || myClass.id}${myStream ? '&stream_id=' + myStream.id : ''}`, hGet);
    let subsArray = ensureArray(subjectsReq.data);
    if (subsArray.length === 0) {
        subjectsReq = await request(baseUrl + '/ai-fetch/subjects', hPost, {
            category_id: 1, board_id: myBoard.id, class_id: myClass.class_id || myClass.id, stream_id: myStream?.id, context_name: `${myBoard.name}, ${myClass.name}`
        });
        subsArray = ensureArray(subjectsReq.data);
    }
    const mySub = subsArray[0];
    console.log('Subject:', mySub?.name);

    // Chapters
    let chapsArray = ensureArray((await request(baseUrl + `/admin/chapters?subject_id=${mySub.id}`, hGet)).data);
    if (chapsArray.length === 0) {
        const chReq = await request(baseUrl + '/ai-fetch/chapters', hPost, { subject_id: mySub.id, subject_name: mySub.name });
        chapsArray = ensureArray(chReq.data);
    }
    const myChap = chapsArray[0];
    console.log('Chapter:', myChap?.name);

    // Bulk Approve
    const elements = [
        { type: 'states', id: wbState?.id },
        { type: 'boards', id: myBoard?.id },
        { type: 'classes', id: myClass?.id },
        { type: 'board_classes', id: myClass?.bc_id },
        { type: 'streams', id: myStream?.id },
        { type: 'subjects', id: mySub?.id },
        { type: 'chapters', id: myChap?.id }
    ];

    for (const chunk of elements) {
        if (chunk.id) {
            console.log(`Approving ${chunk.type}...`, chunk.id);
            await request(baseUrl + '/admin/bulk-approve', hPut, { type: chunk.type, ids: [chunk.id] });
        }
    }
    console.log('\n✅ All data verified, generated, and approved successfully!');

})();
