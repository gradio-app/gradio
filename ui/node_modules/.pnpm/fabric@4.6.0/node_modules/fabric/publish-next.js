var cp = require('child_process');

console.log('npm version prerelease --preid=rc');

cp.execSync('npm version prerelease --preid=rc');

console.log('npm run build');

cp.execSync('npm run build');

console.log('npm publish --tag next');

cp.execSync('npm publish --tag next');

console.log('pre release package is published');
