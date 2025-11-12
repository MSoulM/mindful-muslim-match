import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Camera, 
  X, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DNA_CATEGORIES = [
  { id: 'values', icon: '⚖️', label: 'Values & Beliefs' },
  { id: 'interests', icon: '🎨', label: 'Interests & Hobbies' },
  { id: 'personality', icon: '🧠', label: 'Personality' },
  { id: 'lifestyle', icon: '🏡', label: 'Lifestyle' },
  { id: 'goals', icon: '🎯', label: 'Goals & Ambitions' },
];

interface MediaItem {
  file?: File;
  preview: string;
  type: 'image' | 'video';
}

export default function EditPostScreen() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState('everyone');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enableComments, setEnableComments] = useState(true);
  const [addLocation, setAddLocation] = useState(false);
  const [schedulePost, setSchedulePost] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing post data
  useEffect(() => {
    // Simulate loading post data
    setCaption('This is my existing post caption that I want to edit. It shows what I was thinking when I created this post.');
    setMedia([{
      preview: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
      type: 'image'
    }]);
    setSelectedCategories(['values', 'lifestyle']);
    setPrivacy('everyone');
    setEnableComments(true);
    setAddLocation(true);
  }, [postId]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (media.length + files.length > 5) {
      toast.error('Maximum 5 media items allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(prev => [...prev, {
          file,
          preview: reader.result as string,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        }]);
      };
      reader.readAsDataURL(file);
    });
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

  const handleUpdate = async () => {
    if (media.length === 0) {
      toast.error('Please add at least one photo or video');
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one DNA category');
      return;
    }

    setIsUpdating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUpdating(false);
    toast.success('Post updated successfully!');
    navigate('/profile');
  };

  const handleDelete = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Post deleted successfully');
    navigate('/profile');
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes?')) {
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
          <h1 className="text-base font-semibold">Edit Post</h1>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleUpdate}
            disabled={!isValid || isUpdating}
            className="text-primary disabled:text-muted-foreground"
          >
            {isUpdating ? 'Updating...' : 'Update'}
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
                className="w-full h-full object-cover"
              />
              
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

              {/* Edited Badge */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-background/90 backdrop-blur-sm">
                  Edited
                </Badge>
              </div>

              {/* Media Count */}
              {media.length > 1 && (
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-background/90 backdrop-blur-sm">
                    {media.length} items
                  </Badge>
                </div>
              )}
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

        <Separator />

        {/* Privacy Settings */}
        <div className="bg-background p-5">
          <h3 className="font-semibold text-sm mb-3">Who can see this?</h3>
          
          <RadioGroup value={privacy} onValueChange={setPrivacy} className="space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="everyone" id="everyone" />
              <Label htmlFor="everyone" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium text-sm">Everyone</p>
                  <p className="text-xs text-muted-foreground">Public to all users</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="matches" id="matches" />
              <Label htmlFor="matches" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium text-sm">Matches Only</p>
                  <p className="text-xs text-muted-foreground">Only your matches can see</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="premium" id="premium" />
              <Label htmlFor="premium" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium text-sm">Premium Members</p>
                  <p className="text-xs text-muted-foreground">Only premium users</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium text-sm">Private</p>
                  <p className="text-xs text-muted-foreground">Only you can see</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Advanced Options */}
        <div className="bg-background">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
          >
            <h3 className="font-semibold text-sm">Advanced Options</h3>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Enable Comments</p>
                        <p className="text-xs text-muted-foreground">Allow others to comment</p>
                      </div>
                    </div>
                    <Switch checked={enableComments} onCheckedChange={setEnableComments} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Add Location</p>
                        <p className="text-xs text-muted-foreground">Shows city only</p>
                      </div>
                    </div>
                    <Switch checked={addLocation} onCheckedChange={setAddLocation} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Schedule Post</p>
                        <p className="text-xs text-muted-foreground">Post at a later time</p>
                      </div>
                    </div>
                    <Switch checked={schedulePost} onCheckedChange={setSchedulePost} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Delete Post Section */}
        <div className="bg-background p-5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your post and remove it from your profile.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Bottom Spacing */}
        <div className="h-24" />
      </ScreenContainer>

      {/* Sticky Update Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-5 safe-area-bottom z-30">
        <Button
          onClick={handleUpdate}
          disabled={!isValid || isUpdating}
          className="w-full h-12"
          size="lg"
        >
          {isUpdating ? (
            <span>Updating...</span>
          ) : !isValid ? (
            <span>Add photo and category</span>
          ) : (
            <span>Update Post</span>
          )}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleMediaSelect}
        className="hidden"
      />
    </div>
  );
}