const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

(async () => {
    try {
        const html = await get('https://examredy-frontend.vercel.app/admin/login');
        const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (scriptMatch) {
            const js = await get('https://examredy-frontend.vercel.app' + scriptMatch[1]);
            const apiUrlMatch = js.match(/https:\/\/examredy-backend\d*-production\.up\.railway\.app\/api/);
            console.log('Vercel API URL:', apiUrlMatch ? apiUrlMatch[0] : 'NOT FOUND');
        } else {
            console.log('Script not found in HTML');
        }
    } catch (e) {
        console.error(e);
    }
})();
