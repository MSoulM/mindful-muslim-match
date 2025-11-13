import { useState } from 'react';
import { useKeyboardShortcuts, APP_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

  type ShortcutWithCategory = {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    description: string;
    category: string;
  };

  const shortcuts: ShortcutWithCategory[] = [
    { ...APP_SHORTCUTS.DISCOVER, category: 'Navigation' },
    { ...APP_SHORTCUTS.DNA, category: 'Navigation' },
    { ...APP_SHORTCUTS.MESSAGES, category: 'Navigation' },
    { ...APP_SHORTCUTS.CHAICHAT, category: 'Navigation' },
    { ...APP_SHORTCUTS.AGENT, category: 'Navigation' },
    { ...APP_SHORTCUTS.SEARCH, category: 'Actions' },
    { ...APP_SHORTCUTS.SETTINGS, category: 'Actions' },
    { ...APP_SHORTCUTS.HELP, category: 'Help' },
  ];

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutWithCategory[]>);

  const formatKey = (key: string) => {
    if (key === ' ') return 'Space';
    if (key.length === 1) return key.toUpperCase();
    return key;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Keyboard className="w-6 h-6 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate the app faster with keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.ctrl && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {isMac ? '⌘' : 'Ctrl'}
                        </Badge>
                      )}
                      {shortcut.alt && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {isMac ? '⌥' : 'Alt'}
                        </Badge>
                      )}
                      {shortcut.shift && (
                        <Badge variant="outline" className="font-mono text-xs">
                          ⇧
                        </Badge>
                      )}
                      <Badge variant="default" className="font-mono text-xs">
                        {formatKey(shortcut.key)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              General Navigation
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Navigate between elements</span>
                <Badge variant="outline" className="font-mono text-xs">Tab</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Navigate backwards</span>
                <div className="flex gap-1">
                  <Badge variant="outline" className="font-mono text-xs">⇧</Badge>
                  <Badge variant="outline" className="font-mono text-xs">Tab</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Close modal / Go back</span>
                <Badge variant="outline" className="font-mono text-xs">Esc</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Activate button / link</span>
                <Badge variant="outline" className="font-mono text-xs">Enter</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to trigger keyboard shortcuts modal
 */
export function useKeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);

  useKeyboardShortcuts([
    {
      ...APP_SHORTCUTS.HELP,
      handler: () => setOpen(true),
    },
  ]);

  return { open, setOpen };
}
