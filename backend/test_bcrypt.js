const bcrypt = require('bcryptjs');
async function test() {
    try {
        const salt = await bcrypt.genSalt(10);
        console.log('Salt:', salt);
        const hash = await bcrypt.hash('password', salt);
        console.log('Hash:', hash);
        const match = await bcrypt.compare('password', hash);
        console.log('Match:', match);
    } catch (e) {
        console.error('Bcrypt test failed:', e);
    }
}
test();
