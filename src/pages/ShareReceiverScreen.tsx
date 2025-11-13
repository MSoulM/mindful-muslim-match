import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * ShareReceiverScreen handles incoming shares from external apps via Web Share Target API
 * This component processes shared content and redirects to CreatePostScreen with pre-populated data
 */
export default function ShareReceiverScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleShare = async () => {
      try {
        // Get form data from POST request (Web Share Target API)
        const url = new URL(window.location.href);
        const params = new URLSearchParams(window.location.search);
        
        // Extract shared data
        const sharedTitle = params.get('title') || '';
        const sharedText = params.get('text') || '';
        const sharedUrl = params.get('url') || '';

        // Combine shared content into caption
        let caption = '';
        if (sharedTitle) caption += sharedTitle + '\n\n';
        if (sharedText) caption += sharedText + '\n\n';
        if (sharedUrl) caption += sharedUrl;
        caption = caption.trim();

        // Store shared data in sessionStorage for CreatePostScreen to pick up
        if (caption) {
          sessionStorage.setItem('shared_caption', caption);
        }

        // Handle shared files (images/videos)
        // Note: File handling requires service worker for full support
        // For now, we'll redirect and let user add media manually
        sessionStorage.setItem('share_source', 'external');

        // Redirect to CreatePostScreen
        navigate('/create-post', { replace: true });
      } catch (error) {
        console.error('Error handling share:', error);
        // Fallback: redirect to create post
        navigate('/create-post', { replace: true });
      }
    };

    handleShare();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Processing shared content...</p>
      </div>
    </div>
  );
}
