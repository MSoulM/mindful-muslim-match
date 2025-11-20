import React, { useState } from 'react';
import { X, Type, Image, Video, Mic } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ContentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCategory?: string;
}

type ContentType = 'text' | 'photo' | 'video' | 'voice';

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

export const ContentUploadModal: React.FC<ContentUploadModalProps> = ({
  isOpen,
  onClose,
  preSelectedCategory,
}) => {
  const [activeTab, setActiveTab] = useState<ContentType>('text');

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
              <textarea
                placeholder="What's on your mind? Share your thoughts, values, interests, or goals..."
                className="w-full min-h-[300px] p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Text content"
              />
              <div className="flex justify-end text-sm text-muted-foreground">
                <span>0 / 500 characters</span>
              </div>
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
