import React, { useState, useEffect, useRef } from 'react';
import { X, Type, Image, Video, Mic, AlertCircle, CheckCircle, Sparkles, Upload, XCircle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ContentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCategory?: string;
}

type ContentType = 'text' | 'photo' | 'video' | 'voice';
type QualityState = 'TOO_SHORT' | 'GOOD' | 'EXCELLENT';

interface TabConfig {
  type: ContentType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const tabs: TabConfig[] = [
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'photo', icon: Image, label: 'Photo' },
  { type: 'video', icon: Video, label: 'Video' },
  { type: 'voice', icon: Mic, label: 'Voice' },
];

const HELPFUL_PROMPTS = [
  "Your daily prayer routine and what it means to you",
  "A hobby you're passionate about",
  "What you're looking for in a life partner",
  "Your relationship with family",
  "Your career goals and aspirations",
  "A recent experience that taught you something",
  "Your favorite way to spend free time",
  "What faith means in your daily life",
];

const MAX_CHARACTERS = 1000;
const MIN_CHARACTERS_SUBMIT = 20;


export const ContentUploadModal: React.FC<ContentUploadModalProps> = ({
  isOpen,
  onClose,
  preSelectedCategory,
}) => {
  const [activeTab, setActiveTab] = useState<ContentType>('text');
  
  // Text post state
  const [textContent, setTextContent] = useState('');
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  
  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string[] | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate metrics
  const charCount = textContent.length;
  const wordCount = Math.ceil(charCount / 5);
  
  // Determine quality state
  const getQualityState = (): QualityState | null => {
    if (charCount < 20) return null;
    if (charCount < 50) return 'TOO_SHORT';
    if (charCount < 200) return 'GOOD';
    return 'EXCELLENT';
  };
  
  const qualityState = getQualityState();
  
  // Get character counter color
  const getCharCountColor = () => {
    if (charCount <= 800) return 'text-muted-foreground';
    if (charCount <= 950) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get 3 random prompts
  useEffect(() => {
    const shuffled = [...HELPFUL_PROMPTS].sort(() => Math.random() - 0.5);
    setSelectedPrompts(shuffled.slice(0, 3));
  }, []);
  
  // Auto-save draft
  useEffect(() => {
    if (textContent.length > 0) {
      const timer = setTimeout(() => {
        localStorage.setItem('matchme_text_draft', textContent);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [textContent]);
  
  // Restore draft on mount
  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem('matchme_text_draft');
      if (draft && draft.length > 0) {
        setTextContent(draft);
        toast.success('Draft restored');
      }
    }
  }, [isOpen]);
  
  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setTextContent(value);
    }
  };
  
  // Insert prompt into textarea
  const handlePromptClick = (prompt: string) => {
    setTextContent((prev) => {
      if (prev.length === 0) {
        return prompt;
      }
      return prev + ' ' + prompt;
    });
  };
  
  // Photo upload handlers
  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WEBP image');
      return false;
    }
    
    if (file.size > maxSize) {
      toast.error('Photo is too large. Please choose a file under 10MB');
      return false;
    }
    
    return true;
  };
  
  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      setPhotoFile(file);
      
      // Mock AI analysis after 2 seconds
      setIsAnalyzing(true);
      setAiAnalysis(null);
      setTimeout(() => {
        setAiAnalysis([
          'Setting: Outdoor environment, natural lighting',
          'Activity: Social gathering or event',
          'Mood: Friendly and approachable',
          'Islamic modesty: Appropriate ✓',
        ]);
        setIsAnalyzing(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };
  
  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview('');
    setPhotoCaption('');
    setAiAnalysis(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleReplacePhoto = () => {
    handleRemovePhoto();
    fileInputRef.current?.click();
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const handleClose = () => {
    // Cleanup photo preview URL
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    onClose();
    // Reset to text tab on close
    setTimeout(() => setActiveTab('text'), 300);
  };
  
  // Cleanup photo preview on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl w-full h-full md:h-auto md:max-h-[90vh] p-0 gap-0"
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        <DialogHeader className="px-6 py-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Share Your Story
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Help us understand you better
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Content Type Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.type;

            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-2 py-4 px-2 transition-all duration-200',
                  'border-b-2 hover:bg-accent/50',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                )}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.type}-panel`}
                tabIndex={isActive ? 0 : -1}
              >
                <IconComponent className="h-6 w-6" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 bg-muted/30 min-h-[400px] overflow-y-auto">
          {activeTab === 'text' && (
            <div
              id="text-panel"
              role="tabpanel"
              aria-labelledby="text-tab"
              className="space-y-4"
            >
              {/* Main Textarea */}
              <textarea
                value={textContent}
                onChange={handleTextChange}
                placeholder="What's on your mind? Share your thoughts about your values, interests, goals, lifestyle, or family..."
                className="w-full h-48 max-h-96 p-4 rounded-lg border-2 border-border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary leading-relaxed"
                aria-label="Text content"
              />
              
              {/* Counters Row */}
              <div className="flex justify-between items-center text-sm">
                {/* Word Counter (Left) */}
                <span className="text-muted-foreground">
                  ~{wordCount} words
                </span>
                
                {/* Character Counter (Right) */}
                <span className={getCharCountColor()}>
                  {charCount} / {MAX_CHARACTERS} characters
                </span>
              </div>
              
              {/* Validation Error */}
              {charCount > 0 && charCount < MIN_CHARACTERS_SUBMIT && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Minimum {MIN_CHARACTERS_SUBMIT} characters required</span>
                </div>
              )}
              
              {/* Content Quality Indicator */}
              <AnimatePresence>
                {qualityState && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-md text-sm border',
                      qualityState === 'TOO_SHORT' && 'bg-orange-50 border-orange-200 text-orange-800',
                      qualityState === 'GOOD' && 'bg-green-50 border-green-200 text-green-800',
                      qualityState === 'EXCELLENT' && 'bg-blue-50 border-blue-200 text-blue-800'
                    )}
                  >
                    {qualityState === 'TOO_SHORT' && (
                      <>
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>Add more detail for better AI analysis</span>
                      </>
                    )}
                    {qualityState === 'GOOD' && (
                      <>
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <span>Good detail level ✓</span>
                      </>
                    )}
                    {qualityState === 'EXCELLENT' && (
                      <>
                        <Sparkles className="h-5 w-5 flex-shrink-0" />
                        <span>Excellent detail! This will greatly improve your profile ✨</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Helpful Prompts */}
              {charCount === 0 && selectedPrompts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Need inspiration? Try writing about:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptClick(prompt)}
                        className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs text-foreground transition-colors cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photo' && (
            <div
              id="photo-panel"
              role="tabpanel"
              aria-labelledby="photo-tab"
              className="space-y-4"
            >
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {/* Upload Area or Preview */}
              {!photoPreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'h-75 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
                    'flex flex-col items-center justify-center',
                    isDragging
                      ? 'border-primary bg-green-50'
                      : 'border-border bg-muted hover:border-primary/50 hover:bg-green-50/50'
                  )}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg text-foreground font-medium">
                    Drop your photo here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG, WEBP up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative h-75 rounded-lg overflow-hidden group">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  
                  {/* Hover Overlay with Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
                    <button
                      onClick={handleReplacePhoto}
                      className="p-3 bg-background rounded-full hover:bg-background/90 transition-colors"
                      aria-label="Replace photo"
                    >
                      <RefreshCw className="h-6 w-6 text-foreground" />
                    </button>
                    <button
                      onClick={handleRemovePhoto}
                      className="p-3 bg-background rounded-full hover:bg-background/90 transition-colors"
                      aria-label="Remove photo"
                    >
                      <XCircle className="h-6 w-6 text-foreground" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Image Info */}
              {photoFile && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate max-w-[200px]">
                    {photoFile.name}
                  </span>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{formatFileSize(photoFile.size)}</span>
                  </div>
                </div>
              )}
              
              {/* Caption Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Add a caption (optional but recommended)
                </label>
                <textarea
                  value={photoCaption}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setPhotoCaption(e.target.value);
                    }
                  }}
                  placeholder="Describe this photo... Where was it taken? What were you doing? What does it represent about you?"
                  className="w-full h-25 max-h-50 p-3 rounded-lg border-2 border-border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  aria-label="Photo caption"
                />
                <div className="flex justify-end text-xs text-muted-foreground">
                  {photoCaption.length} / 500 characters
                </div>
              </div>
              
              {/* AI Vision Analysis */}
              {photoPreview && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-semibold text-foreground">
                      AI Vision Analysis
                    </span>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      <span>Analyzing image...</span>
                    </div>
                  ) : aiAnalysis ? (
                    <ul className="space-y-1 text-sm text-foreground">
                      {aiAnalysis.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
              
              {/* Content Suggestions */}
              {photoPreview && aiAnalysis && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    💡 This photo could show:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 border border-purple-300 rounded-full text-xs text-purple-800">
                      Your interests
                    </span>
                    <span className="px-2 py-1 bg-blue-100 border border-blue-300 rounded-full text-xs text-blue-800">
                      Your personality
                    </span>
                    <span className="px-2 py-1 bg-green-100 border border-green-300 rounded-full text-xs text-green-800">
                      Your lifestyle
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'video' && (
            <div
              id="video-panel"
              role="tabpanel"
              aria-labelledby="video-tab"
              className="space-y-4"
            >
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-background hover:border-primary/50 transition-colors cursor-pointer">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Upload a video that represents you
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  Maximum duration: 60 seconds
                </p>
              </div>
              <textarea
                placeholder="Add a caption to your video..."
                className="w-full min-h-[100px] p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Video caption"
              />
            </div>
          )}

          {activeTab === 'voice' && (
            <div
              id="voice-panel"
              role="tabpanel"
              aria-labelledby="voice-tab"
              className="space-y-6"
            >
              <div className="flex flex-col items-center justify-center py-12 bg-background rounded-lg border border-border">
                <button
                  className="h-24 w-24 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Record voice note"
                >
                  <Mic className="h-10 w-10" />
                </button>
                <p className="text-muted-foreground mt-6">
                  Tap to start recording
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Duration: 30-120 seconds
                </p>
              </div>
              <textarea
                placeholder="Add a brief description of what you'll share in your voice note..."
                className="w-full min-h-[100px] p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Voice note description"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
