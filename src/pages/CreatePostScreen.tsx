import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  X, 
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { compressImage, formatFileSize } from '@/utils/imageCompression';
import { generateThumbnail } from '@/utils/thumbnailGenerator';

const DNA_CATEGORIES = [
  { id: 'values', icon: '⚖️', label: 'Values & Beliefs' },
  { id: 'interests', icon: '🎨', label: 'Interests & Hobbies' },
  { id: 'personality', icon: '🧠', label: 'Personality' },
  { id: 'lifestyle', icon: '🏡', label: 'Lifestyle' },
  { id: 'goals', icon: '🎯', label: 'Goals & Ambitions' },
];

interface MediaItem {
  file: File;
  preview: string;
  thumbnail?: string;
  type: 'image' | 'video';
  isLoading?: boolean;
}

export default function CreatePostScreen() {
  const navigate = useNavigate();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (media.length + files.length > 5) {
      toast.error('Maximum 5 media items allowed');
      return;
    }

    for (const file of files) {
      // Handle videos
      if (file.type.startsWith('video/')) {
        if (file.size > 50 * 1024 * 1024) {
          toast.error('Video size must be less than 50MB');
          continue;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setMedia(prev => [...prev, {
            file,
            preview: reader.result as string,
            type: 'video'
          }]);
        };
        reader.readAsDataURL(file);
        continue;
      }

      // Generate instant thumbnail for images
      try {
        const thumbnail = await generateThumbnail(file, {
          width: 100,
          quality: 0.6,
          blur: 10
        });

        // Add with thumbnail first (instant feedback)
        const tempId = Date.now();
        setMedia(prev => [...prev, {
          file,
          preview: thumbnail,
          thumbnail,
          type: 'image',
          isLoading: true
        }]);

        // Compress full image in background
        const originalSize = file.size;
        const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          maxSizeMB: 5
        });

        const savedBytes = originalSize - compressedFile.size;
        const savedPercentage = Math.round((savedBytes / originalSize) * 100);
        
        if (savedPercentage > 10) {
          toast.success(`Image optimized (${savedPercentage}% smaller)`);
        }

        // Update with full resolution image
        const reader = new FileReader();
        reader.onloadend = () => {
          setMedia(prev => prev.map(item => 
            item.isLoading && item.thumbnail === thumbnail
              ? {
                  file: compressedFile,
                  preview: reader.result as string,
                  thumbnail,
                  type: 'image',
                  isLoading: false
                }
              : item
          ));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        toast.error('Failed to process image');
        console.error('Image processing error:', error);
      }
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      if (prev.length >= 2) {
        toast.error('Maximum 2 categories allowed');
        return prev;
      }
      return [...prev, categoryId];
    });
  };

  const handlePost = async () => {
    // Validate required fields with helpful messages
    if (media.length === 0) {
      toast.error('Please add at least one photo or video to share');
      fileInputRef.current?.click(); // Open file picker to help user
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Please select at least one DNA category to continue');
      return;
    }

    // Validate caption length
    if (caption.length > 500) {
      toast.error('Caption must be less than 500 characters');
      return;
    }

    setIsPosting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Post shared successfully!');
      navigate('/post-success');
    } catch (error) {
      toast.error('Failed to share post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    if (media.length > 0 || caption.length > 0 || selectedCategories.length > 0) {
      if (window.confirm('Discard this post?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const isValid = media.length > 0 && selectedCategories.length > 0;

  return (
    <div className="min-h-screen bg-muted">
      {/* Custom TopBar */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <h1 className="text-base font-semibold">Share Something</h1>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handlePost}
            disabled={isPosting}
            className="text-primary disabled:text-muted-foreground"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>

      <ScreenContainer hasTopBar={false} hasBottomNav={false} padding={false}>
        {/* Media Section */}
        <div 
          className={cn(
            "relative bg-neutral-100 flex items-center justify-center cursor-pointer",
            media.length === 0 ? "min-h-[200px]" : "min-h-[300px] max-h-[400px]"
          )}
          onClick={() => media.length === 0 && fileInputRef.current?.click()}
        >
          {media.length === 0 ? (
            <div className="text-center p-8">
              <Camera className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Add a photo or video</h3>
              <p className="text-sm text-muted-foreground">Help others know you better</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img 
                src={media[0].preview} 
                alt="Post media"
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  media[0].isLoading && "blur-sm scale-105"
                )}
              />
              
              {/* Loading overlay */}
              {media[0].isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                </div>
              )}
              
              {/* Edit/Remove Overlay */}
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 rounded-full p-0 bg-background/90 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 rounded-full p-0 bg-destructive/90 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(0);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Media Count */}
              {media.length > 1 && (
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-background/90 backdrop-blur-sm">
                    {media.length} items
                  </Badge>
                </div>
              )}

              {/* Media Type Badge */}
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-background/90 backdrop-blur-sm">
                  {media[0].type === 'video' ? <Video className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                  {media[0].type}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Caption Section */}
        <div className="bg-background p-5">
          <Textarea
            placeholder="Share something about yourself..."
            value={caption}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setCaption(e.target.value);
              }
            }}
            className="min-h-[100px] max-h-[200px] resize-none text-base border-0 p-0 focus-visible:ring-0"
          />
          <div className="flex justify-end mt-2">
            <span className={cn(
              "text-xs",
              caption.length > 450 ? "text-destructive" : "text-muted-foreground"
            )}>
              {caption.length}/500
            </span>
          </div>
        </div>

        <Separator />

        {/* DNA Category Selection */}
        <div className="bg-background p-5">
          <div className="mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-1">
              Add to Your DNA
              <span className="text-destructive">*</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              This helps refine your profile • Select up to 2
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
            {DNA_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-full border-2 whitespace-nowrap transition-all min-h-[44px]",
                  selectedCategories.includes(category.id)
                    ? "border-primary bg-gradient-to-r from-primary/10 to-primary/20"
                    : "border-border bg-background hover:border-primary/50"
                )}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-24" />
      </ScreenContainer>

      {/* Sticky Post Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-5 safe-area-bottom z-30">
        <Button
          onClick={handlePost}
          disabled={isPosting}
          className="w-full h-12"
          size="lg"
        >
          {isPosting ? (
            <span>Posting...</span>
          ) : !isValid ? (
            media.length === 0 ? (
              <span>Add photo to continue</span>
            ) : (
              <span>Select DNA category to continue</span>
            )
          ) : (
            <span>Share Post</span>
          )}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        multiple
        onChange={handleMediaSelect}
        className="hidden"
      />
    </div>
  );
}