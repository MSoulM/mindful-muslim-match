# Progressive Image Loading

This app implements progressive image loading with blur-up placeholders for optimal perceived performance.

## How It Works

1. **Thumbnail Generation**: When users upload images, a small blurred thumbnail is generated instantly (100px wide, 10px blur, 60% quality)
2. **Immediate Display**: The thumbnail displays immediately while the full image compresses
3. **Smooth Transition**: Full-resolution image fades in with a 500ms blur-to-sharp transition
4. **Compression**: Full images are compressed to reduce file size (max 1920px, 85% quality, <5MB)

## Components

### ProgressiveImage
Reusable component for any image that needs progressive loading.

```tsx
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';

<ProgressiveImage
  src="/path/to/full-image.jpg"
  thumbnailSrc="/path/to/thumbnail.jpg" // optional
  alt="Description"
  className="w-full h-64"
  aspectRatio="16/9" // optional
/>
```

### AvatarProgressive
Avatar variant with progressive loading for profile pictures.

```tsx
import { 
  AvatarProgressive, 
  AvatarProgressiveImage, 
  AvatarProgressiveFallback 
} from '@/components/ui/avatar-progressive';

<AvatarProgressive>
  <AvatarProgressiveImage 
    src="/path/to/avatar.jpg"
    thumbnailSrc="/path/to/thumb.jpg" // optional
  />
  <AvatarProgressiveFallback>JD</AvatarProgressiveFallback>
</AvatarProgressive>
```

### useProgressiveImage Hook
Custom hook for manual control over progressive loading.

```tsx
import { useProgressiveImage } from '@/hooks/useProgressiveImage';

const { src, isLoading, hasError } = useProgressiveImage(
  fullImageSrc,
  {
    thumbnailSrc: thumbnailImageSrc, // optional
    onLoad: () => console.log('loaded'),
    onError: () => console.log('error')
  }
);
```

## Utilities

### Image Compression
```tsx
import { compressImage, compressImages } from '@/utils/imageCompression';

// Single image
const compressed = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeMB: 5
});

// Multiple images
const compressedFiles = await compressImages(files, options);
```

### Thumbnail Generation
```tsx
import { generateThumbnail, generateThumbnails } from '@/utils/thumbnailGenerator';

// Single thumbnail
const thumbBase64 = await generateThumbnail(file, {
  width: 100,
  quality: 0.6,
  blur: 10
});

// Multiple thumbnails
const thumbnails = await generateThumbnails(files, options);
```

## Where It's Used

- **Match Cards**: Profile photos with progressive loading
- **Post Creation**: Upload flow with instant thumbnail preview
- **Agent Messages**: Avatar images with blur-up effect
- **Video Tutorials**: Thumbnail previews
- **Chat Avatars**: Progressive loading for profile pictures

## Performance Benefits

- **Perceived Performance**: Images appear instantly with blur effect
- **Reduced Data**: Compressed images save 20-40% on file size
- **Better UX**: No blank spaces or loading spinners
- **Smooth Transitions**: 500ms fade prevents jarring changes

## Best Practices

1. Always provide `alt` text for accessibility
2. Use `thumbnailSrc` for images >500KB
3. Set `aspectRatio` to prevent layout shift
4. Handle `onError` for failed loads
5. Compress images before storage/upload
