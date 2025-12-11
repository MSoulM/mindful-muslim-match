import { useState, useRef, useEffect } from 'react';
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
  Video,
  Share2,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { compressImage, formatFileSize } from '@/utils/imageCompression';
import { generateThumbnail } from '@/utils/thumbnailGenerator';
import { generateVideoThumbnail } from '@/utils/videoThumbnail';
import { DepthIndicator } from '@/components/profile/DepthIndicator';
import { DepthCoachingPrompts } from '@/components/profile/DepthCoachingPrompts';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

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
  const { userId } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSharedContent, setIsSharedContent] = useState(false);
  const [depthLevel, setDepthLevel] = useState<1 | 2 | 3 | 4>(1);
  const [showDepthCoaching, setShowDepthCoaching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debouncedCaption = useDebounce(caption, 500);

  // Check for shared content on mount
  useEffect(() => {
    const sharedCaption = sessionStorage.getItem('shared_caption');
    const shareSource = sessionStorage.getItem('share_source');
    
    if (sharedCaption || shareSource) {
      if (sharedCaption) {
        setCaption(sharedCaption);
        setIsSharedContent(true);
        toast.success('Shared content loaded!');
      }
      
      // Clean up sessionStorage
      sessionStorage.removeItem('shared_caption');
      sessionStorage.removeItem('share_source');
    }
  }, []);

  // Analyze caption depth when user stops typing
  useEffect(() => {
    if (debouncedCaption.length > 10) {
      analyzeDepth(debouncedCaption);
    }
  }, [debouncedCaption]);

  const analyzeDepth = async (text: string) => {
    setIsAnalyzing(true);
    
    try {
      // Client-side depth analysis based on text characteristics
      const depth = calculateDepth(text);
      setDepthLevel(depth);
    } catch (error) {
      console.error('Depth analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateDepth = (text: string): 1 | 2 | 3 | 4 => {
    const wordCount = text.split(/\s+/).length;
    
    // Emotional indicators
    const emotionalWords = /\b(feel|felt|feeling|love|fear|hope|dream|heart|soul|passion|anxious|excited|nervous|grateful|blessed|overwhelmed)\b/gi;
    const emotionalMatches = (text.match(emotionalWords) || []).length;
    
    // Transformational indicators
    const transformationalWords = /\b(changed|grew|learned|realized|discovered|transformed|became|journey|growth|evolution|before|after|now|understand)\b/gi;
    const transformationalMatches = (text.match(transformationalWords) || []).length;
    
    // Context indicators
    const contextWords = /\b(because|since|therefore|reason|why|means|important|matters|helps|allows)\b/gi;
    const contextMatches = (text.match(contextWords) || []).length;
    
    // Scoring system
    if (transformationalMatches >= 3 && emotionalMatches >= 2 && wordCount > 80) {
      return 4; // Transformational
    } else if (emotionalMatches >= 2 && wordCount > 50) {
      return 3; // Emotional
    } else if (contextMatches >= 2 && wordCount > 30) {
      return 2; // Context
    } else {
      return 1; // Surface
    }
  };

  const getMultiplier = (level: number): 1 | 2 | 3 | 5 => {
    switch(level) {
      case 1: return 1;
      case 2: return 2;
      case 3: return 3;
      case 4: return 5;
      default: return 1;
    }
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Reset validation state when user adds media
    if (attemptedSubmit) {
      setAttemptedSubmit(false);
    }
    
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
        
        // Generate video thumbnail
        try {
          const thumbnail = await generateVideoThumbnail(file, {
            width: 400,
            quality: 0.8,
            timeOffset: 1
          });
          
          setMedia(prev => [...prev, {
            file,
            preview: thumbnail,
            thumbnail,
            type: 'video'
          }]);
        } catch (error) {
          console.error('Failed to generate video thumbnail:', error);
          // Fallback: use a placeholder or video icon
          setMedia(prev => [...prev, {
            file,
            preview: '',
            type: 'video'
          }]);
        }
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
    // Reset validation state when user selects a category
    if (attemptedSubmit) {
      setAttemptedSubmit(false);
    }
    
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
    // Mark that user has attempted to submit
    setAttemptedSubmit(true);

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

    if (!userId || !supabase) {
      toast.error('You must be logged in to create a post');
      return;
    }

    setIsPosting(true);
    
    try {
      // Upload media files to Supabase storage
      const mediaUrls: string[] = [];
      
      for (const mediaItem of media) {
        const fileExt = mediaItem.file.name.split('.').pop()?.toLowerCase() || 
          (mediaItem.type === 'video' ? 'mp4' : 'jpg');
        const fileName = `post_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${userId}/posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('users')
          .upload(filePath, mediaItem.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Failed to upload ${mediaItem.type}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('users')
          .getPublicUrl(filePath);

        mediaUrls.push(publicUrl);
      }

      // Store post in Supabase
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          clerk_user_id: userId,
          caption: caption.trim() || null,
          media_urls: mediaUrls,
          categories: selectedCategories,
          depth_level: depthLevel,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (postError) {
        // If posts table doesn't exist, log error but continue (for development)
        console.error('Failed to save post to database:', postError);
        // Still show success if upload worked
        if (postError.code === '42P01') {
          console.warn('Posts table does not exist. Please create it in Supabase.');
        } else {
          throw postError;
        }
      }
      
      toast.success('Post shared successfully!');
      
      // Navigate with depth data
      navigate('/post-success', {
        state: {
          depthLevel,
          multiplier: getMultiplier(depthLevel),
          selectedCategories
        }
      });
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to share post. Please try again.');
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
            "relative bg-neutral-100 flex items-center justify-center cursor-pointer transition-all",
            media.length === 0 ? "min-h-[200px]" : "h-[300px]",
            attemptedSubmit && media.length === 0 && "border-4 border-destructive"
          )}
          onClick={() => media.length === 0 && fileInputRef.current?.click()}
        >
          {media.length === 0 ? (
            <div className="text-center p-8">
              <Camera 
                className={cn(
                  "w-12 h-12 mx-auto mb-3",
                  attemptedSubmit ? "text-destructive" : "text-neutral-400"
                )} 
              />
              <h3 className={cn(
                "font-semibold mb-1",
                attemptedSubmit ? "text-destructive" : "text-foreground"
              )}>
                {attemptedSubmit ? "⚠️ Photo or video required" : "Add a photo or video"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {attemptedSubmit ? "Tap here to add media" : "Help others know you better"}
              </p>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-neutral-900">
              {media[0].type === 'video' ? (
                media[0].preview ? (
                  <img 
                    src={media[0].preview} 
                    alt="Video thumbnail"
                    className={cn(
                      "max-w-full max-h-full object-contain transition-all duration-500",
                      media[0].isLoading && "blur-sm scale-105"
                    )}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white">
                    <Video className="w-16 h-16 mb-2" />
                    <p className="text-sm">Video preview</p>
                  </div>
                )
              ) : (
                <img 
                  src={media[0].preview} 
                  alt="Post media"
                  className={cn(
                    "max-w-full max-h-full object-contain transition-all duration-500",
                    media[0].isLoading && "blur-sm scale-105"
                  )}
                />
              )}
              
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
        <div className="bg-background p-5 space-y-4">
          {/* Shared Content Indicator */}
          {isSharedContent && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <Share2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">
                Shared from external app
              </span>
            </div>
          )}

          {/* Depth System Info - Show on first visit */}
          {caption.length === 0 && !sessionStorage.getItem('depth_info_shown') && (
            <div className="flex gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-foreground">✨ Quality matters more than quantity</p>
                <p className="text-muted-foreground">
                  Deeper, more authentic sharing earns up to 5x DNA points. We'll show you your depth level as you type!
                </p>
                <button
                  onClick={() => {
                    sessionStorage.setItem('depth_info_shown', 'true');
                    navigate('/depth-demo');
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Learn more →
                </button>
              </div>
            </div>
          )}
          
          <div>
            <Textarea
              placeholder="Share something meaningful about yourself..."
              value={caption}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setCaption(e.target.value);
                  if (isSharedContent) setIsSharedContent(false); // Remove indicator once user edits
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

          {/* Depth Indicator - Show when user has typed something */}
          {debouncedCaption.length > 10 && (
            <div className="space-y-3 animate-in fade-in-50 duration-500">
              <DepthIndicator
                text={debouncedCaption}
                depthLevel={depthLevel}
                multiplier={getMultiplier(depthLevel)}
              />

              {/* DNA Points Impact */}
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-sm">
                  <span className="text-muted-foreground">This post will earn you </span>
                  <span className="font-bold text-primary">{getMultiplier(depthLevel)}x</span>
                  <span className="text-muted-foreground"> DNA points</span>
                </div>
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
                    Analyzing...
                  </div>
                )}
              </div>

              {/* Coaching Prompts Toggle */}
              {depthLevel < 4 && caption.length > 20 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowDepthCoaching(!showDepthCoaching)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {showDepthCoaching ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide coaching prompts
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Get tips to deepen your share
                      </>
                    )}
                  </button>

                  {showDepthCoaching && (
                    <DepthCoachingPrompts
                      currentDepth={depthLevel}
                      topic={selectedCategories.length > 0 
                        ? DNA_CATEGORIES.find(c => c.id === selectedCategories[0])?.label || 'this topic'
                        : 'this topic'
                      }
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* DNA Category Selection */}
        <div className={cn(
          "bg-background p-5 transition-all",
          attemptedSubmit && selectedCategories.length === 0 && "border-4 border-destructive"
        )}>
          <div className="mb-3">
            <h3 className={cn(
              "font-semibold text-sm flex items-center gap-1",
              attemptedSubmit && selectedCategories.length === 0 && "text-destructive"
            )}>
              {attemptedSubmit && selectedCategories.length === 0 && "⚠️ "}
              Add to Your DNA
              <span className="text-destructive">*</span>
            </h3>
            <p className={cn(
              "text-xs mt-0.5",
              attemptedSubmit && selectedCategories.length === 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {attemptedSubmit && selectedCategories.length === 0 
                ? "Please select at least one category to continue" 
                : "This helps refine your profile • Select up to 2"
              }
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