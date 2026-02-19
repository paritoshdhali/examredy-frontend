const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function test() {
    console.log('--- Final Production Check ---');
    const pass = 'Admin@123';
    const hash = await bcrypt.hash(pass, 10);
    console.log('Bcrypt Hash Length:', hash.length);
    const match = await bcrypt.compare(pass, hash);
    console.log('Bcrypt Match:', match === true ? '✅' : '❌');

    const token = jwt.sign({ id: 1, role: 'admin', email: 'admin@examredy.in' }, 'secret', { expiresIn: '7d' });
    const decoded = jwt.verify(token, 'secret');
    console.log('JWT Email included:', decoded.email === 'admin@examredy.in' ? '✅' : '❌');
    console.log('JWT Expiry exists:', !!decoded.exp ? '✅' : '❌');
}

test().catch(console.error);
