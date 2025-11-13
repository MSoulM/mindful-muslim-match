# Web Share Target Implementation

## Overview
MuslimSoulmate.ai now supports receiving shared content from external apps via the Web Share Target API. Users can share URLs, text, images, and videos directly from other mobile apps (browsers, news apps, social media) to the "Share Something" screen.

## Architecture

### Phase 1: Manifest Configuration
**File:** `public/manifest.json`
- Configured `share_target` to accept POST requests
- Accepts `multipart/form-data` encoding
- Supports: text, URLs, images, and videos
- Share action endpoint: `/share`

### Phase 2: Share Receiver Route
**File:** `src/pages/ShareReceiverScreen.tsx`
- Acts as landing page for shared content
- Extracts shared data from URL parameters
- Stores shared content in `sessionStorage`
- Redirects to `CreatePostScreen` with pre-populated data

### Phase 3: CreatePostScreen Integration
**File:** `src/pages/CreatePostScreen.tsx`
- Checks `sessionStorage` on mount for shared content
- Pre-populates caption field with shared text/URLs
- Displays visual indicator ("Shared from external app" badge)
- Clears `sessionStorage` after loading shared content

### Phase 4: App Routing
**File:** `src/App.tsx`
- Added `/share` route for ShareReceiverScreen
- Configured with page transitions

### Phase 5: PWA Manifest Setup
**File:** `index.html`
- Added manifest link (`<link rel="manifest" href="/manifest.json" />`)
- Updated theme color and app name
- Added PWA meta tags for iOS support

## Usage Flow

1. **User shares content from external app** (e.g., shares a news article from browser)
2. **OS/Browser detects MuslimSoulmate.ai as share target** (via manifest)
3. **Content is POSTed to `/share` route** with form data
4. **ShareReceiverScreen processes the data:**
   - Extracts title, text, url parameters
   - Combines into caption format
   - Stores in sessionStorage
5. **Redirects to CreatePostScreen** (`/create-post`)
6. **CreatePostScreen loads shared content:**
   - Reads from sessionStorage
   - Pre-fills caption textarea
   - Shows "Shared from external app" badge
   - Clears sessionStorage
7. **User completes post:**
   - Adds media (optional)
   - Selects DNA categories (required)
   - Posts or discards

## Supported Share Types

### Text/URL Shares
- **News articles:** Title + URL
- **Web links:** URL with optional description
- **Plain text:** Any text content

### Media Shares (Coming Soon)
- **Images:** JPEG, PNG, WebP
- **Videos:** MP4, WebM (max 30s)

**Note:** Full media file handling requires service worker implementation for production. Current version handles text/URL shares.

## Testing

### Testing on Local Development
1. Serve app over HTTPS (required for PWA features)
2. Install PWA to home screen
3. Test sharing from supported apps

### Testing on Production
1. Deploy app with manifest.json
2. Visit site on mobile device
3. Install PWA via browser menu
4. Open any app with share functionality
5. Look for "MuslimSoulmate.ai" in share sheet
6. Share content and verify it appears in CreatePostScreen

## Browser Support

| Feature | Chrome/Edge | Safari iOS | Firefox |
|---------|------------|-----------|---------|
| Web Share Target API | ✅ Yes | ✅ Yes (iOS 15+) | ⚠️ Limited |
| Text/URL sharing | ✅ Yes | ✅ Yes | ⚠️ Limited |
| File sharing | ✅ Yes | ✅ Yes | ❌ No |

## Future Enhancements

1. **Service Worker for File Handling**
   - Process shared images/videos
   - Auto-compress shared media
   - Generate thumbnails

2. **Share History**
   - Track shared content sources
   - Analytics on share usage

3. **Rich Share Previews**
   - Extract Open Graph metadata
   - Generate link preview cards

4. **Batch Sharing**
   - Support multiple files in one share
   - Carousel view for shared media

## Troubleshooting

### Share target not appearing in share sheet
- Ensure manifest.json is properly served
- Verify HTTPS connection
- Re-install PWA after manifest changes
- Check browser compatibility

### Shared content not pre-filling
- Verify sessionStorage is accessible
- Check browser console for errors
- Ensure proper URL encoding

### Files not being received
- Confirm file MIME types match manifest
- Verify multipart/form-data encoding
- Check file size limits (50MB max for videos)

## Related Files
- `public/manifest.json` - PWA manifest with share_target
- `src/pages/ShareReceiverScreen.tsx` - Share handler
- `src/pages/CreatePostScreen.tsx` - Post creation with share support
- `src/App.tsx` - Route configuration
- `index.html` - Manifest link and PWA meta tags
