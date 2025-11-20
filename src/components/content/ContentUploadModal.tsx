import React, { useState, useEffect } from 'react';
import { X, Type, Image, Video, Mic, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
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
  
  const handleClose = () => {
    onClose();
    // Reset to text tab on close
    setTimeout(() => setActiveTab('text'), 300);
  };

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
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-background hover:border-primary/50 transition-colors cursor-pointer">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Upload a photo that represents you
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click to browse or drag and drop
                </p>
              </div>
              <textarea
                placeholder="Add a caption to your photo..."
                className="w-full min-h-[100px] p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Photo caption"
              />
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
