const path = require('path');
console.log('1. start');
try {
  const mod = require(path.join(__dirname, '..', 'src', 'generated', 'prisma'));
  console.log('2. imported, keys:', Object.keys(mod).slice(0, 5));
} catch (e) {
  console.log('ERR:', e.message);
}
