const https = require('https');

const body = JSON.stringify({ email: 'admin@examredy.in', password: 'Admin@123' });

const options = {
    hostname: 'examredy-backend1-production.up.railway.app',
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Content-Length': Buffer.byteLength(body)
    }
};

const req = https.request(options, res => {
    let responseBody = '';
    res.on('data', d => responseBody += d);
    res.on('end', () => {
        console.log('=== CORS TEST RESULT ===');
        console.log('HTTP STATUS:', res.statusCode);
        console.log('CORS Header:', res.headers['access-control-allow-origin'] || '❌ MISSING - CORS BLOCKED');
        console.log('Response:', responseBody.substring(0, 150));
        if (res.headers['access-control-allow-origin']) {
            console.log('\n✅ CORS WORKING! Login will work from browser.');
        } else {
            console.log('\n❌ CORS still blocked. Railway may not have redeployed yet. Wait 2 more minutes.');
        }
    });
});

req.on('error', e => console.error('Network Error:', e.message));
req.write(body);
req.end();
