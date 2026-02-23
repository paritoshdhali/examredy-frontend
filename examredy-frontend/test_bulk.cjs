const https = require('https');

function request(url, options, body = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    const url = 'https://examredy-backend1-production.up.railway.app';
    // 1. Login
    const loginRes = await request(url + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@examredy.in', password: 'admin123' });

    const token = loginRes.data.token || (await request(url + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@examredy.in', password: 'Admin@123' })).data.token;

    if (!token) return console.log('Login failed');

    console.log('Testing streams payload with undefined/NaN strings...');
    const approveStreamsStr = await request(url + '/api/admin/bulk-approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }, { type: 'streams', ids: ["1", "2", "NaN", null] });
    console.log('Approve Streams String result:', approveStreamsStr.status, approveStreamsStr.data);

    console.log('Testing chapters payload with valid ids...');
    const adminCh = await request(url + '/api/admin/chapters', {
        method: 'GET', headers: { 'Authorization': 'Bearer ' + token }
    });
    if (adminCh.data.length > 0) {
        const ids = adminCh.data.slice(0, 5).map(c => c.id);
        ids.push(undefined); // Append undefined
        console.log('Testing bulk approve chapters:', ids);
        const approveRes = await request(url + '/api/admin/bulk-approve', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        }, { type: 'chapters', ids: ids });
        console.log('Approve Chapters UNDEFINED result:', approveRes.status, approveRes.data);
    } else {
        console.log('No chapters found');
    }
})();
