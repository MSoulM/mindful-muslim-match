# Native Mobile App Setup Guide

This guide covers setting up MuslimSoulmate.ai as a native mobile app using Capacitor.

## 🎯 Overview

The native mobile implementation includes:
- ✅ **Push Notifications** - Batch completion alerts
- ✅ **Offline Mode** - Review insights without internet
- ✅ **Progressive Upload** - Chunked uploads with retry logic
- ✅ **Low-Bandwidth Mode** - Optimized for emerging markets
- ✅ **WhatsApp Integration** - Share status updates

## 📦 Prerequisites

### iOS Development
- macOS with Xcode 14+ installed
- CocoaPods installed: `sudo gem install cocoapods`
- Apple Developer Account (for device testing)

### Android Development
- Android Studio installed
- Android SDK 33+
- Java Development Kit (JDK) 11+

## 🚀 Setup Instructions

### 1. Export Project to GitHub
1. Click the GitHub button in Lovable (top right)
2. Export/transfer your project to your GitHub account
3. Clone the repository locally

### 2. Install Dependencies
```bash
cd your-project-directory
npm install
```

### 3. Add iOS Platform (macOS only)
```bash
npx cap add ios
npx cap update ios
```

### 4. Add Android Platform
```bash
npx cap add android
npx cap update android
```

### 5. Build Web Assets
```bash
npm run build
```

### 6. Sync Native Projects
```bash
npx cap sync
```
This copies the built web assets to native projects and updates native dependencies.

### 7. Run on iOS (macOS only)
```bash
npx cap run ios
```
Or open in Xcode:
```bash
npx cap open ios
```

### 8. Run on Android
```bash
npx cap run android
```
Or open in Android Studio:
```bash
npx cap open android
```

## 🔧 Configuration

### capacitor.config.ts
Already configured with:
```typescript
{
  appId: 'app.lovable.d234b80414ea42d3addefa33ff893b5e',
  appName: 'mindful-muslim-match',
  webDir: 'dist',
  server: {
    url: 'https://d234b804-14ea-42d3-adde-fa33ff893b5e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
}
```

### Hot Reload During Development
The `server.url` setting enables hot-reload from the Lovable sandbox during development. For production builds, remove this configuration.

## 📱 Mobile Features Usage

### Push Notifications
```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

const { isRegistered, registerForPushNotifications } = usePushNotifications();

// Enable push notifications
await registerForPushNotifications();
```

### Offline Insights
```typescript
import { useOfflineInsights } from '@/hooks/useOfflineInsights';

const { 
  insights, 
  isOffline, 
  approveInsight, 
  syncWhenOnline 
} = useOfflineInsights();

// Approve insight offline
approveInsight(insightId);

// Sync when back online
await syncWhenOnline();
```

### Progressive Upload
```typescript
import { useProgressiveUpload } from '@/hooks/useProgressiveUpload';

const { uploadFile, uploads } = useProgressiveUpload();

// Upload with retry logic
await uploadFile(file, { category: 'values' });
```

### Low-Bandwidth Mode
```typescript
import { useLowBandwidthMode } from '@/hooks/useLowBandwidthMode';

const { 
  isLowBandwidth, 
  imageQuality, 
  enableDataSaver 
} = useLowBandwidthMode();

// Enable data saver manually
enableDataSaver();
```

### WhatsApp Integration
```typescript
import { whatsappIntegration } from '@/utils/whatsappIntegration';

// Share batch status
await whatsappIntegration.sendBatchStatusUpdate({
  type: 'complete',
  insightCount: 8
});

// Enable auto-notifications
whatsappIntegration.setWhatsAppNotifications(true);
```

## 🔐 iOS Push Notifications Setup

### 1. Enable Push Notifications Capability
In Xcode:
1. Open `ios/App/App.xcworkspace`
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and enable "Remote notifications"

### 2. Register with APNs
Create/update `ios/App/App/AppDelegate.swift`:
```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        return true
    }
}

extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }
}
```

## 🤖 Android Push Notifications Setup

### 1. Configure Firebase Cloud Messaging (FCM)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Add Android app with package name: `app.lovable.d234b80414ea42d3addefa33ff893b5e`
4. Download `google-services.json`
5. Place in `android/app/google-services.json`

### 2. Update build.gradle
Already configured in the project.

## 📊 Testing Mobile Features

### Test in Browser (Limited)
Some features work in browser with polyfills:
```bash
npm run dev
```
Navigate to `/optimization-demo` and click the "Mobile" tab.

### Test on Physical Device (Recommended)
For full feature testing:
1. iOS: Connect iPhone via USB, select device in Xcode, press Run
2. Android: Enable USB debugging, connect device, run `npx cap run android`

## 🔄 Development Workflow

### After Making Changes
```bash
# 1. Build web assets
npm run build

# 2. Sync to native projects
npx cap sync

# 3. Run on device
npx cap run ios
# or
npx cap run android
```

### Hot Reload (Development Only)
The app connects to the Lovable sandbox for hot reload during development. Changes in Lovable appear instantly on the device.

**Important:** Remove `server.url` from `capacitor.config.ts` before production build.

## 🚢 Production Build

### iOS Production
1. Remove `server` configuration from `capacitor.config.ts`
2. Build: `npm run build`
3. Sync: `npx cap sync ios`
4. Open in Xcode: `npx cap open ios`
5. Archive and upload to App Store Connect

### Android Production
1. Remove `server` configuration from `capacitor.config.ts`
2. Build: `npm run build`
3. Sync: `npx cap sync android`
4. Open in Android Studio: `npx cap open android`
5. Generate signed APK/Bundle
6. Upload to Google Play Console

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
- [Network Plugin](https://capacitorjs.com/docs/apis/network)
- [Share Plugin](https://capacitorjs.com/docs/apis/share)
- [iOS App Store Submission](https://developer.apple.com/app-store/submissions/)
- [Google Play Console](https://play.google.com/console)

## 🐛 Troubleshooting

### iOS Build Fails
- Ensure Xcode 14+ is installed
- Run `pod install` in `ios/App` directory
- Clean build folder in Xcode (Cmd+Shift+K)

### Android Build Fails
- Check Java version: `java -version` (should be 11+)
- Sync Gradle in Android Studio
- Invalidate caches and restart Android Studio

### Push Notifications Not Working
- iOS: Verify Push Notifications capability is enabled
- Android: Ensure `google-services.json` is present
- Check device has internet connection
- Verify permissions are granted

### Hot Reload Not Working
- Ensure device and computer are on same network
- Check `server.url` in `capacitor.config.ts` is correct
- Restart the app

## ⚠️ Important Notes

1. **Battery Usage**: Background sync and network monitoring can impact battery. Implement proper lifecycle management.

2. **Data Costs**: Progressive upload and low-bandwidth mode help, but warn users about data usage.

3. **Privacy**: Push tokens and WhatsApp integration require user consent. Implement proper permission flows.

4. **Testing**: Always test on real devices, especially for offline and network features.

5. **App Store Guidelines**: Ensure compliance with Apple and Google guidelines for notifications and data handling.

---

**Need Help?** Check the [Lovable Discord community](https://discord.com/channels/1119885301872070706/1280461670979993613) or refer to Capacitor docs.
