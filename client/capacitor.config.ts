import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.karaoke.party',
  appName: 'Rockola Karaoke',
  webDir: 'dist',
  server: {
    url: 'https://karaoke-tc-c9fb.vercel.app',
    cleartext: true
  }
};

export default config;
