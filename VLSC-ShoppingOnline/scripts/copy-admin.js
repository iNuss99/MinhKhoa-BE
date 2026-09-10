const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const adminBuild = path.join(rootDir, 'client-admin', 'build');
const destAdmin = path.join(rootDir, 'client-customer', 'build', 'admin');

if (fs.existsSync(adminBuild)) {
  fs.mkdirSync(destAdmin, { recursive: true });
  fs.cpSync(adminBuild, destAdmin, { recursive: true });
  console.log('[Build] Successfully merged client-admin build into client-customer/build/admin');
} else {
  console.error('[Build Error] client-admin/build not found. Run admin build first.');
  process.exit(1);
}
