const fs = require('fs');
const path = require('path');

// Create react-native-worklets folder
const workletsDir = path.join(__dirname, 'node_modules', 'react-native-worklets');
fs.mkdirSync(workletsDir, { recursive: true });

// Create proper package.json
fs.writeFileSync(
  path.join(workletsDir, 'package.json'),
  JSON.stringify({
    name: 'react-native-worklets',
    version: '1.0.0',
    main: '../react-native-worklets-core/lib/commonjs/index.js',
    types: '../react-native-worklets-core/src/index.ts'
  }, null, 2)
);

console.log('✅ Created react-native-worklets alias');  