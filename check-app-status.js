// Quick diagnostic script to check app status
const fs = require('fs');
const path = require('path');

console.log('🔍 StretchApp Diagnostic Check\n');
console.log('='.repeat(50));

// Check critical files
const criticalFiles = [
  'App.tsx',
  'package.json',
  'app.json',
  'babel.config.js',
  'tsconfig.json',
  'src/navigation/AppNavigator.tsx',
  'src/context/AppContext.tsx',
  'src/context/LanguageContext.tsx',
  'src/utils/theme.ts',
  'src/utils/logger.ts',
  'src/utils/validation.ts',
  'src/utils/i18n.ts',
  'src/utils/storage.ts',
  'src/components/ErrorBoundary.tsx',
  'src/screens/MainScreen.tsx',
  'src/screens/LanguageSelectionScreen.tsx',
  'src/screens/SettingsScreen.tsx',
  'src/screens/WorkoutSessionScreen.tsx',
  'src/components/DaySelector.tsx',
];

console.log('\n📁 Checking Critical Files:');
let missingFiles = [];
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  if (exists) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

// Check node_modules
console.log('\n📦 Checking Dependencies:');
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log(`  ${nodeModulesExists ? '✅' : '❌'} node_modules ${nodeModulesExists ? 'exists' : 'MISSING - Run: npm install'}`);

// Check package.json
console.log('\n📋 Package.json Check:');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log(`  ✅ Package name: ${pkg.name}`);
  console.log(`  ✅ Version: ${pkg.version}`);
  console.log(`  ✅ Main entry: ${pkg.main}`);
  console.log(`  ✅ Dependencies count: ${Object.keys(pkg.dependencies || {}).length}`);
} catch (e) {
  console.log(`  ❌ Error reading package.json: ${e.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
if (missingFiles.length === 0 && nodeModulesExists) {
  console.log('✅ All critical files present!');
  console.log('✅ Dependencies installed!');
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npm start');
  console.log('   2. Press "i" for iOS or "a" for Android');
  console.log('   3. Or scan QR code with Expo Go app');
} else {
  console.log('⚠️  Issues found:');
  if (missingFiles.length > 0) {
    console.log(`   - ${missingFiles.length} missing file(s)`);
  }
  if (!nodeModulesExists) {
    console.log('   - Dependencies not installed');
    console.log('   - Run: npm install');
  }
}

console.log('\n');
