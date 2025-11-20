import React, { useState, useEffect, useRef } from 'react';
import { X, Type, Image, Video, Mic, AlertCircle, CheckCircle, Sparkles, Upload, XCircle, RefreshCw, Square, Info, Loader, TrendingUp, Lightbulb, Heart, BookOpen, Target, Home, Users } from 'lucide-react';
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
  
  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [videoCaption, setVideoCaption] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoResolution, setVideoResolution] = useState<{ width: number; height: number } | null>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Category prediction state
  const [isAnalyzingCategory, setIsAnalyzingCategory] = useState(false);
  const [predictedCategory, setPredictedCategory] = useState<{
    primary: { name: string; confidence: number; icon: string };
    secondary?: { name: string; confidence: number };
  } | null>(null);
  const [showCategoryOverride, setShowCategoryOverride] = useState(false);
  
  // Define category configuration
  const categoryConfig = {
    'Values & Beliefs': { icon: Heart, color: 'teal', colorCode: '#0D7377' },
    'Interests & Hobbies': { icon: BookOpen, color: 'red', colorCode: '#FF6B6B' },
    'Relationship Goals': { icon: Target, color: 'gold', colorCode: '#FDB813' },
    'Lifestyle & Personality': { icon: Home, color: 'blue', colorCode: '#0066CC' },
    'Family & Cultural': { icon: Users, color: 'purple', colorCode: '#8B7AB8' },
  };
  
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
  
  // Video upload handlers
  const validateVideoFile = (file: File): boolean => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an MP4, MOV, or WEBM video');
      return false;
    }
    
    if (file.size > maxSize) {
      toast.error('Video is too large. Please choose a file under 50MB');
      return false;
    }
    
    return true;
  };
  
  const handleVideoSelect = (file: File) => {
    if (!validateVideoFile(file)) return;
    
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    setVideoFile(file);
  };
  
  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVideoSelect(file);
  };
  
  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(true);
  };
  
  const handleVideoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
  };
  
  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleVideoSelect(file);
  };
  
  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview('');
    setVideoCaption('');
    setVideoDuration(0);
    setVideoResolution(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };
  
  const handleReplaceVideo = () => {
    handleRemoveVideo();
    videoInputRef.current?.click();
  };
  
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      
      setVideoDuration(duration);
      setVideoResolution({ width, height });
    }
  };
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Voice recording handlers (MOCK for MVP)
  // TODO: Implement actual MediaRecorder API
  // TODO: Handle browser permissions for microphone
  // TODO: Encode audio to MP3/WAV for upload
  
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 120) {
          stopRecording();
          return 120;
        }
        return prev + 1;
      });
    }, 1000);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    // Mock audio blob creation
    const mockBlob = new Blob(['mock audio data'], { type: 'audio/webm' });
    setAudioBlob(mockBlob);
    setAudioUrl(URL.createObjectURL(mockBlob));
  };
  
  const handleRecordButtonClick = () => {
    if (isRecording) {
      if (recordingTime < 30) {
        toast.warning('Please record at least 30 seconds');
        return;
      }
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const handleReRecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl('');
    setHasRecorded(false);
    setRecordingTime(0);
    setVoiceDescription('');
  };
  
  const handleDeleteVoice = () => {
    handleReRecord();
  };
  
  // Category prediction logic
  const predictCategory = (content: string, type: 'text' | 'photo' | 'video' | 'voice') => {
    setIsAnalyzingCategory(true);
    setPredictedCategory(null);
    
    setTimeout(() => {
      let prediction: { primary: { name: string; confidence: number; icon: string }; secondary?: { name: string; confidence: number } };
      
      if (type === 'text') {
        const lowerContent = content.toLowerCase();
        
        if (lowerContent.match(/pray|prayer|salah|faith|allah|islam|quran|mosque/)) {
          prediction = {
            primary: { name: 'Values & Beliefs', confidence: 85, icon: 'Heart' },
          };
        } else if (lowerContent.match(/family|parents|siblings|relatives|mother|father/)) {
          prediction = {
            primary: { name: 'Family & Cultural', confidence: 80, icon: 'Users' },
          };
        } else if (lowerContent.match(/cooking|sports|reading|hobby|music|travel|photography/)) {
          prediction = {
            primary: { name: 'Interests & Hobbies', confidence: 80, icon: 'BookOpen' },
            secondary: { name: 'Lifestyle & Personality', confidence: 45 },
          };
        } else if (lowerContent.match(/marriage|children|future|partner|spouse|relationship/)) {
          prediction = {
            primary: { name: 'Relationship Goals', confidence: 85, icon: 'Target' },
          };
        } else if (lowerContent.match(/work|routine|lifestyle|daily|habits|exercise/)) {
          prediction = {
            primary: { name: 'Lifestyle & Personality', confidence: 75, icon: 'Home' },
          };
        } else {
          prediction = {
            primary: { name: 'Lifestyle & Personality', confidence: 60, icon: 'Home' },
          };
        }
      } else if (type === 'photo') {
        prediction = {
          primary: { name: 'Interests & Hobbies', confidence: 75, icon: 'BookOpen' },
          secondary: { name: 'Lifestyle & Personality', confidence: 50 },
        };
      } else if (type === 'video') {
        prediction = {
          primary: { name: 'Interests & Hobbies', confidence: 80, icon: 'BookOpen' },
        };
      } else {
        prediction = {
          primary: { name: 'Values & Beliefs', confidence: 70, icon: 'Heart' },
        };
      }
      
      setPredictedCategory(prediction);
      setIsAnalyzingCategory(false);
    }, 2000);
  };
  
  // Trigger category prediction based on content type
  useEffect(() => {
    if (activeTab === 'text' && textContent.length >= 50) {
      predictCategory(textContent, 'text');
    }
  }, [textContent, activeTab]);
  
  useEffect(() => {
    if (activeTab === 'photo' && photoFile) {
      predictCategory('', 'photo');
    }
  }, [photoFile, activeTab]);
  
  useEffect(() => {
    if (activeTab === 'video' && videoFile) {
      predictCategory('', 'video');
    }
  }, [videoFile, activeTab]);
  
  useEffect(() => {
    if (activeTab === 'voice' && hasRecorded) {
      predictCategory('', 'voice');
    }
  }, [hasRecorded, activeTab]);
  
  const handleClose = () => {
    // Cleanup photo preview URL
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    // Cleanup video preview URL
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    // Cleanup audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    // Clear recording interval
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    onClose();
    // Reset to text tab on close
    setTimeout(() => setActiveTab('text'), 300);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [photoPreview, videoPreview, audioUrl]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };
  
  // Render category prediction section (shared across all tabs)
  const renderCategoryPrediction = () => {
    const shouldShow = 
      (activeTab === 'text' && textContent.length >= 50) ||
      (activeTab === 'photo' && photoFile) ||
      (activeTab === 'video' && videoFile) ||
      (activeTab === 'voice' && hasRecorded);
    
    if (!shouldShow) return null;
    
    return (
      <div className="mt-6 pt-6 border-t-2 border-border bg-gradient-to-b from-background to-muted/30 -mx-6 px-6 pb-6">
        {isAnalyzingCategory ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader className="h-8 w-8 text-primary animate-spin mb-3" />
            <p className="text-base font-semibold text-foreground">
              Analyzing your content...
            </p>
          </div>
        ) : predictedCategory ? (
          <div className="space-y-4">
            {/* Category Assignment */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                This content will be added to:
              </p>
              
              {/* Primary Category */}
              <div className="flex items-center gap-3 p-4 bg-opacity-20 border-2 rounded-lg"
                style={{
                  backgroundColor: `${categoryConfig[predictedCategory.primary.name as keyof typeof categoryConfig].colorCode}33`,
                  borderColor: categoryConfig[predictedCategory.primary.name as keyof typeof categoryConfig].colorCode,
                }}
              >
                {React.createElement(
                  categoryConfig[predictedCategory.primary.name as keyof typeof categoryConfig].icon,
                  { className: 'h-6 w-6 flex-shrink-0', style: { color: categoryConfig[predictedCategory.primary.name as keyof typeof categoryConfig].colorCode } }
                )}
                <span className="flex-1 text-base font-semibold text-foreground">
                  {predictedCategory.primary.name}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {predictedCategory.primary.confidence}% confidence
                </span>
              </div>
              
              {/* Secondary Category */}
              {predictedCategory.secondary && (
                <div className="mt-2 flex items-center gap-2 p-3 bg-opacity-10 border rounded-md"
                  style={{
                    backgroundColor: `${categoryConfig[predictedCategory.secondary.name as keyof typeof categoryConfig].colorCode}1A`,
                    borderColor: `${categoryConfig[predictedCategory.secondary.name as keyof typeof categoryConfig].colorCode}4D`,
                  }}
                >
                  <span className="text-sm text-foreground">
                    Also contributes to: <span className="font-medium">{predictedCategory.secondary.name}</span> ({predictedCategory.secondary.confidence}%)
                  </span>
                </div>
              )}
              
              {/* Category Override Button */}
              <button
                onClick={() => setShowCategoryOverride(!showCategoryOverride)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Wrong category?
              </button>
            </div>
            
            {/* Impact Preview Card */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-foreground">
                  Impact on Your Profile
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Content items: 5 → 6 (+1)</span>
                </div>
                {activeTab === 'text' && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Total words: 280 → {280 + wordCount} (+{wordCount})</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span className="ml-6">Topic coverage: 3/4 → 4/4 ✓</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Category completion: 68% → 72% (+4%) ⬆️</span>
                </div>
              </div>
            </div>
            
            {/* Smart Suggestion */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  💡 Tip: Mention Islamic knowledge to cover your 4th topic and boost completion by 8%
                </p>
              </div>
            </div>
            
            {/* Category Override Dropdown */}
            <AnimatePresence>
              {showCategoryOverride && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-background border border-border rounded-lg shadow-lg z-50"
                >
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Select the correct category:
                  </p>
                  <div className="space-y-2">
                    {Object.entries(categoryConfig).map(([name, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <button
                          key={name}
                          onClick={() => {
                            setPredictedCategory({
                              primary: { name, confidence: 100, icon: config.icon.name },
                            });
                            setShowCategoryOverride(false);
                            toast.success(`Category changed to ${name}`);
                          }}
                          className="w-full flex items-center gap-3 p-3 bg-muted hover:bg-accent rounded-md transition-colors text-left"
                        >
                          <IconComponent className="h-5 w-5" style={{ color: config.colorCode }} />
                          <span className="text-sm font-medium text-foreground">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    );
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
              
              {/* Category Prediction Section */}
              {renderCategoryPrediction()}
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
              
              {/* Category Prediction Section */}
              {renderCategoryPrediction()}
            </div>
          )}

          {activeTab === 'video' && (
            <div
              id="video-panel"
              role="tabpanel"
              aria-labelledby="video-tab"
              className="space-y-4"
            >
              {/* Hidden Video Input */}
              <input
                ref={videoInputRef}
                type="file"
                accept=".mp4,.mov,.webm"
                onChange={handleVideoInputChange}
                className="hidden"
              />
              
              {/* Upload Area or Preview */}
              {!videoPreview ? (
                <div
                  onDragOver={handleVideoDragOver}
                  onDragLeave={handleVideoDragLeave}
                  onDrop={handleVideoDrop}
                  onClick={() => videoInputRef.current?.click()}
                  className={cn(
                    'h-75 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
                    'flex flex-col items-center justify-center',
                    isDraggingVideo
                      ? 'border-primary bg-green-50'
                      : 'border-border bg-muted hover:border-primary/50 hover:bg-green-50/50'
                  )}
                >
                  <Video className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg text-foreground font-medium">
                    Drop your video here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    MP4, MOV, WEBM up to 50MB • Max 60 seconds
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      src={videoPreview}
                      controls
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      className="w-full max-h-75 object-contain"
                    />
                  </div>
                  
                  {/* Video Info */}
                  {videoFile && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {videoDuration > 0 && (
                        <span>Duration: {formatDuration(videoDuration)}</span>
                      )}
                      <span>Size: {formatFileSize(videoFile.size)}</span>
                      <span>Format: {videoFile.type.split('/')[1].toUpperCase()}</span>
                      {videoResolution && (
                        <span>Resolution: {videoResolution.width}x{videoResolution.height}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Duration Validation */}
                  {videoDuration > 0 && (
                    <div>
                      {videoDuration > 60 ? (
                        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md text-sm text-orange-800">
                          <AlertCircle className="h-5 w-5 flex-shrink-0" />
                          <span>Video is too long. Please upload a video under 60 seconds</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                          <CheckCircle className="h-5 w-5 flex-shrink-0" />
                          <span>Duration: Perfect! ✓</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleReplaceVideo}
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent text-foreground text-sm font-medium transition-colors"
                    >
                      Replace Video
                    </button>
                    <button
                      onClick={handleRemoveVideo}
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent text-foreground text-sm font-medium transition-colors"
                    >
                      Remove Video
                    </button>
                  </div>
                </div>
              )}
              
              {/* Caption Input */}
              {videoPreview && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Describe your video
                  </label>
                  <textarea
                    value={videoCaption}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setVideoCaption(e.target.value);
                      }
                    }}
                    placeholder="What's happening in this video? What does it say about you?"
                    className="w-full h-25 max-h-50 p-3 rounded-lg border-2 border-border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    aria-label="Video caption"
                  />
                  <div className="flex justify-end text-xs text-muted-foreground">
                    {videoCaption.length} / 500 characters
                  </div>
                </div>
              )}
              
              {/* Category Prediction Section */}
              {renderCategoryPrediction()}
            </div>
          )}

          {activeTab === 'voice' && (
            <div
              id="voice-panel"
              role="tabpanel"
              aria-labelledby="voice-tab"
              className="space-y-6"
            >
              {!hasRecorded ? (
                <>
                  {/* Recording Interface */}
                  <div className="flex flex-col items-center justify-center py-12 bg-background rounded-lg border border-border">
                    <button
                      onClick={handleRecordButtonClick}
                      className={cn(
                        'h-24 w-24 rounded-full flex items-center justify-center shadow-xl transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2',
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500 animate-pulse'
                          : 'bg-primary hover:bg-primary/90 focus:ring-primary hover:scale-105 active:scale-95'
                      )}
                      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                      {isRecording ? (
                        <Square className="h-10 w-10 text-white" />
                      ) : (
                        <Mic className="h-10 w-10 text-primary-foreground" />
                      )}
                    </button>
                    
                    <p className="text-sm text-muted-foreground mt-6">
                      {isRecording ? `Recording... ${formatDuration(recordingTime)}` : 'Tap to start recording'}
                    </p>
                    
                    {!isRecording && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Duration: 30-120 seconds
                      </p>
                    )}
                    
                    {isRecording && (
                      <p className={cn(
                        'text-xs mt-1',
                        recordingTime < 30 ? 'text-orange-600' : recordingTime > 110 ? 'text-red-600' : 'text-muted-foreground'
                      )}>
                        {recordingTime < 30 && 'Minimum 30 seconds'}
                        {recordingTime >= 30 && recordingTime <= 110 && `${formatDuration(recordingTime)} / 2:00`}
                        {recordingTime > 110 && 'Reaching maximum duration!'}
                      </p>
                    )}
                  </div>
                  
                  {/* Mock Waveform Visualization */}
                  {isRecording && (
                    <div className="flex items-end justify-center gap-0.5 h-25 bg-muted rounded-lg p-4">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-primary rounded-full"
                          animate={{
                            height: [
                              `${Math.random() * 40 + 20}px`,
                              `${Math.random() * 60 + 20}px`,
                              `${Math.random() * 40 + 20}px`,
                            ],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Playback Interface */}
                  <div className="space-y-4">
                    {/* Audio Player (Mock) */}
                    <div className="p-6 bg-background rounded-lg border border-border">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                            <Mic className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Voice Note
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {formatDuration(recordingTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Static Waveform */}
                      <div className="flex items-end justify-center gap-0.5 h-16 bg-muted rounded p-2 mb-4">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-primary/60 rounded-full"
                            style={{ height: `${Math.random() * 80 + 20}%` }}
                          />
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        ~2.1 MB
                      </div>
                    </div>
                    
                    {/* Audio Quality Indicator */}
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                      <Info className="h-5 w-5 flex-shrink-0" />
                      <span>Clear audio ✓</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleReRecord}
                        className="flex-1 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent text-foreground text-sm font-medium transition-colors"
                      >
                        Re-record
                      </button>
                      <button
                        onClick={handleDeleteVoice}
                        className="flex-1 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent text-foreground text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    
                    {/* Text Description Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        What did you talk about? (optional)
                      </label>
                      <textarea
                        value={voiceDescription}
                        onChange={(e) => {
                          if (e.target.value.length <= 300) {
                            setVoiceDescription(e.target.value);
                          }
                        }}
                        placeholder="Briefly describe what you shared in this voice note..."
                        className="w-full h-50 p-3 rounded-lg border-2 border-border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        aria-label="Voice note description"
                      />
                      <div className="flex justify-end text-xs text-muted-foreground">
                        {voiceDescription.length} / 300 characters
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Category Prediction Section */}
              {renderCategoryPrediction()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
