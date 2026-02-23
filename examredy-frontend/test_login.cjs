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

    const loginRes1 = await request(url + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@examredy.in', password: 'admin123' });

    const loginRes2 = await request(url + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@examredy.in', password: 'Admin@123' });

    console.log('Result for admin123:', loginRes1.status, loginRes1.data.message || 'SUCCESS');
    console.log('Result for Admin@123:', loginRes2.status, loginRes2.data.message || 'SUCCESS');
})();
