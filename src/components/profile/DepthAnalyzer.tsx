import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { DepthIndicator } from './DepthIndicator';
import { Textarea } from '@/components/ui/textarea';

interface DepthAnalyzerProps {
  onDepthChange: (depth: number) => void;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const DepthAnalyzer: React.FC<DepthAnalyzerProps> = ({ 
  onDepthChange,
  value: externalValue,
  onChange: externalOnChange,
  placeholder = "Share something meaningful about yourself..."
}) => {
  const [inputText, setInputText] = useState(externalValue || '');
  const [analyzedDepth, setAnalyzedDepth] = useState<1 | 2 | 3 | 4>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const debouncedText = useDebounce(inputText, 500);
  
  useEffect(() => {
    if (externalValue !== undefined) {
      setInputText(externalValue);
    }
  }, [externalValue]);
  
  useEffect(() => {
    if (debouncedText.length > 10) {
      analyzeDepth(debouncedText);
    }
  }, [debouncedText]);
  
  const analyzeDepth = async (text: string) => {
    setIsAnalyzing(true);
    
    try {
      // Client-side depth analysis based on text characteristics
      const depth = calculateDepth(text);
      setAnalyzedDepth(depth);
      onDepthChange(depth);
    } catch (error) {
      console.error('Depth analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const calculateDepth = (text: string): 1 | 2 | 3 | 4 => {
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length;
    
    // Emotional indicators
    const emotionalWords = /\b(feel|felt|feeling|love|fear|hope|dream|heart|soul|passion|anxious|excited|nervous|grateful|blessed|overwhelmed)\b/gi;
    const emotionalMatches = (text.match(emotionalWords) || []).length;
    
    // Transformational indicators
    const transformationalWords = /\b(changed|grew|learned|realized|discovered|transformed|became|journey|growth|evolution|before|after|now|understand)\b/gi;
    const transformationalMatches = (text.match(transformationalWords) || []).length;
    
    // Context indicators
    const contextWords = /\b(because|since|therefore|reason|why|means|important|matters|helps|allows)\b/gi;
    const contextMatches = (text.match(contextWords) || []).length;
    
    // Scoring system
    if (transformationalMatches >= 3 && emotionalMatches >= 2 && wordCount > 80) {
      return 4; // Transformational
    } else if (emotionalMatches >= 2 && wordCount > 50) {
      return 3; // Emotional
    } else if (contextMatches >= 2 && wordCount > 30) {
      return 2; // Context
    } else {
      return 1; // Surface
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputText(newValue);
    if (externalOnChange) {
      externalOnChange(newValue);
    }
  };
  
  const getMultiplier = (depthLevel: number): 1 | 2 | 3 | 5 => {
    switch(depthLevel) {
      case 1: return 1;
      case 2: return 2;
      case 3: return 3;
      case 4: return 5;
      default: return 1;
    }
  };
  
  return (
    <div className="space-y-4">
      <Textarea
        value={inputText}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="min-h-[120px] resize-none"
      />
      
      {debouncedText.length > 10 && (
        <DepthIndicator 
          text={debouncedText}
          depthLevel={analyzedDepth}
          multiplier={getMultiplier(analyzedDepth)}
        />
      )}
      
      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Analyzing depth...</span>
        </div>
      )}
    </div>
  );
};
