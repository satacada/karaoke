import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve(process.cwd(), 'android/app/src/main/AndroidManifest.xml');

if (!fs.existsSync(manifestPath)) {
  console.log('AndroidManifest.xml no encontrado en:', manifestPath);
  process.exit(0);
}

let content = fs.readFileSync(manifestPath, 'utf8');

const tvFeatures = `
    <!-- Configuración para Android TV (Leanback UI) y Celular Móvil -->
    <uses-feature android:name="android.software.leanback" android:required="false" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
`;

if (!content.includes('android.software.leanback')) {
  content = content.replace('<application', `${tvFeatures}\n    <application`);
  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log('✅ AndroidManifest.xml configurado exitosamente para Android TV.');
} else {
  console.log('ℹ️ AndroidManifest.xml ya contaba con la configuración de Android TV.');
}
