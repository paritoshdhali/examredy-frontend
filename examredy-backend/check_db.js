const { query } = require('./db');

async function checkAdmin() {
    try {
        const result = await query("SELECT id, username, email, password, role FROM users WHERE role = 'admin'");
        console.log('Admin Users:', JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error('Error checking admin:', error);
    } finally {
        process.exit();
    }
}

checkAdmin();
