import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d234b80414ea42d3addefa33ff893b5e',
  appName: 'mindful-muslim-match',
  webDir: 'dist',
  server: {
    url: 'https://d234b804-14ea-42d3-adde-fa33ff893b5e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
