
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.jjv.tecnicoya',
  appName: 'Tecnico Ya',
  webDir: 'dist/browser',
  plugins: {
    CapacitorHttp: { enabled: true }
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowMixedContent: true
  }
};

export default config;
