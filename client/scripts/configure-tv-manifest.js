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
