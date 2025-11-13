/**
 * PostEditor Component
 * Rich text editor for post captions with auto-resize
 */

import { useState, useRef, useEffect } from 'react';
import { Smile, AtSign, Hash } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showToolbar?: boolean;
  className?: string;
}

export const PostEditor = ({
  value,
  onChange,
  placeholder = 'Share your thoughts...',
  maxLength = 500,
  showToolbar = true,
  className,
}: PostEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);

    onChange(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars < 50;

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative rounded-lg border transition-colors',
          isFocused ? 'border-primary' : 'border-border'
        )}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="min-h-[100px] resize-none border-0 focus-visible:ring-0"
        />

        {showToolbar && (
          <div className="flex items-center justify-between px-3 py-2 border-t">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertText('😊')}
                className="h-8 w-8 p-0"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertText('@')}
                className="h-8 w-8 p-0"
              >
                <AtSign className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertText('#')}
                className="h-8 w-8 p-0"
              >
                <Hash className="h-4 w-4" />
              </Button>
            </div>

            <span
              className={cn(
                'text-xs',
                isNearLimit ? 'text-orange-600 font-medium' : 'text-muted-foreground'
              )}
            >
              {remainingChars}
            </span>
          </div>
        )}
      </div>

      {isNearLimit && (
        <p className="text-xs text-orange-600">
          {remainingChars === 0
            ? 'Character limit reached'
            : `${remainingChars} characters remaining`}
        </p>
      )}
    </div>
  );
};
