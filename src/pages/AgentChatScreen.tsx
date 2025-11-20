import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Settings, AlertCircle } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { UserStateIndicator } from '@/components/chat/UserStateIndicator';
import { useTextChat } from '@/hooks/useTextChat';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function AgentChatScreen() {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  } = useTextChat();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = () => {
    if (textInput.trim()) {
      sendMessage(textInput);
      setTextInput('');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-muted/20">
      <TopBar 
        variant="back" 
        title="MMAgent Chat"
        onBackClick={() => navigate(-1)}
      />
      
      {/* User State Indicator */}
      <div className="fixed top-14 left-0 right-0 z-10 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-border">
        <UserStateIndicator
          userState={{
            profileCompletion: 75,
            lastMatchDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            engagementLevel: 'active'
          }}
          variant="compact"
        />
      </div>

      <ScreenContainer hasBottomNav={false} className="pt-24 pb-32">
        <div className="max-w-3xl mx-auto space-y-4 px-4">
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome Message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AgentMessage
                avatar="🤖"
                title="MMAgent"
                message="Hi! I'm your personal AI assistant. I can help you with matching advice, profile guidance, and understanding your compatibility DNA. Type your message below to get started!"
                variant="welcome"
              />
            </motion.div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' ? (
                  <AgentMessage
                    avatar="🤖"
                    title="MMAgent"
                    message={message.content}
                    variant="default"
                    className="max-w-[85%]"
                  />
                ) : (
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <p className="text-sm">{message.content}</p>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-4 py-3"
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted-foreground">MMAgent is thinking...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScreenContainer>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 pb-safe">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="flex-shrink-0"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Text Input */}
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendText()}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />

          {/* Send Button */}
          <Button
            onClick={handleSendText}
            disabled={!textInput.trim() || isLoading}
            size="icon"
            className="flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-0 right-0 bg-card p-4 mx-4 rounded-xl shadow-lg border border-border z-50 max-w-3xl mx-auto"
          >
            <h3 className="font-semibold mb-3">Quick Settings</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setShowSettings(false);
                  navigate('/dev/tone-adjustment-test');
                }}
              >
                Adjust Agent Tone
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setShowSettings(false);
                  navigate('/dev/personality-card-test');
                }}
              >
                Change Agent Personality
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => {
                  clearMessages();
                  setShowSettings(false);
                }}
              >
                Clear Chat
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

