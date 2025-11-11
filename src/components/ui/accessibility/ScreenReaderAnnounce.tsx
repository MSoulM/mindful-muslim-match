interface ScreenReaderAnnounceProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

export const ScreenReaderAnnounce = ({ 
  message, 
  priority = 'polite',
  atomic = true 
}: ScreenReaderAnnounceProps) => {
  if (!message) return null;
  
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {message}
    </div>
  );
};
