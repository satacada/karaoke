import fs from 'node:fs';
import path from 'node:path';

// 1. Configuración de AndroidManifest.xml
const manifestPath = path.resolve(process.cwd(), 'android/app/src/main/AndroidManifest.xml');

if (fs.existsSync(manifestPath)) {
  let content = fs.readFileSync(manifestPath, 'utf8');

  const tvFeatures = `
    <!-- Configuración para Android TV (Leanback UI) y Celular Móvil -->
    <uses-feature android:name="android.software.leanback" android:required="false" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
`;

  if (!content.includes('android.software.leanback')) {
    content = content.replace('<application', `${tvFeatures}\n    <application`);
  }

  // Agregar categoría LEANBACK_LAUNCHER para que aparezca en el menú de apps de Android TV
  if (!content.includes('android.intent.category.LEANBACK_LAUNCHER')) {
    content = content.replace(
      '<category android:name="android.intent.category.LAUNCHER" />',
      '<category android:name="android.intent.category.LAUNCHER" />\n                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />'
    );
  }

  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log('✅ AndroidManifest.xml configurado para Android TV.');
}

// 2. Configuración de MainActivity.java para detección nativa de Android TV
const activityPath = path.resolve(process.cwd(), 'android/app/src/main/java/com/karaoke/party/MainActivity.java');

if (fs.existsSync(activityPath)) {
  const javaCode = `package com.karaoke.party;

import android.app.UiModeManager;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            UiModeManager uiModeManager = (UiModeManager) getSystemService(UI_MODE_SERVICE);
            boolean isTv = (uiModeManager != null && uiModeManager.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION)
                || getPackageManager().hasSystemFeature(PackageManager.FEATURE_LEANBACK)
                || getPackageManager().hasSystemFeature("android.hardware.type.television")
                || getPackageManager().hasSystemFeature("android.software.leanback");

            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebSettings settings = this.bridge.getWebView().getSettings();
                String ua = settings.getUserAgentString();
                if (isTv) {
                    settings.setUserAgentString(ua + " AndroidTV SmartTV Leanback");
                }
            }
        } catch (Exception ignored) {}
    }
}
`;
  fs.writeFileSync(activityPath, javaCode, 'utf8');
  console.log('✅ MainActivity.java configurado para detección nativa de Android TV.');
}

// 3. Inyección de Íconos Oficiales (Rockola Jukebox) y Banner Android TV
const resDir = path.resolve(process.cwd(), 'android/app/src/main/res');
const assetsDir = path.resolve(process.cwd(), 'scripts/assets');

if (fs.existsSync(resDir) && fs.existsSync(assetsDir)) {
  const mipmaps = [
    { dir: 'mipmap-mdpi', size: '48' }, { dir: 'mipmap-hdpi', size: '72' },
    { dir: 'mipmap-xhdpi', size: '96' }, { dir: 'mipmap-xxhdpi', size: '144' }, { dir: 'mipmap-xxxhdpi', size: '192' },
  ];

  mipmaps.forEach(({ dir, size }) => {
    const targetFolder = path.join(resDir, dir);
    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });
    const srcIcon = path.join(assetsDir, `icon-${size}.png`);
    if (fs.existsSync(srcIcon)) {
      fs.copyFileSync(srcIcon, path.join(targetFolder, 'ic_launcher.png'));
      fs.copyFileSync(srcIcon, path.join(targetFolder, 'ic_launcher_round.png'));
    }
  });

  const bannerSrc = path.join(assetsDir, 'banner.png');
  if (fs.existsSync(bannerSrc)) {
    ['drawable', 'drawable-xhdpi'].forEach((d) => {
      const p = path.join(resDir, d);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
      fs.copyFileSync(bannerSrc, path.join(p, 'banner.png'));
    });
  }

  const anyDpiDir = path.join(resDir, 'mipmap-anydpi-v26');
  if (fs.existsSync(anyDpiDir)) {
    ['ic_launcher.xml', 'ic_launcher_round.xml'].forEach((f) => {
      const p = path.join(anyDpiDir, f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  }

  if (fs.existsSync(manifestPath)) {
    let manifestContent = fs.readFileSync(manifestPath, 'utf8');
    if (!manifestContent.includes('android:banner=')) {
      manifestContent = manifestContent.replace('<application', '<application android:banner="@drawable/banner"');
      fs.writeFileSync(manifestPath, manifestContent, 'utf8');
    }
  }
  console.log('✅ Íconos oficiales de Rockola y banner de Android TV inyectados.');
}
