import { Variants, Transition } from 'framer-motion';

// Page Transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageTransitionConfig: Transition = {
  duration: 0.3,
  ease: 'easeInOut'
};

// Stagger Animations
export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// Press Animations
export const scalePress = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.1 }
};

export const scalePressSubtle = {
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 }
};

// Pulse Animation
export const pulseAnimation: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Slide Animations
export const slideIn = {
  left: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 }
  },
  right: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 }
  },
  up: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3 }
  },
  down: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3 }
  }
};

// Fade Animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Scale Animations
export const scaleIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Hover Effects
export const hoverScale = {
  whileHover: { scale: 1.02 },
  transition: { duration: 0.2 }
};

export const hoverLift = {
  whileHover: { y: -4 },
  transition: { duration: 0.2 }
};

// Spring Transitions
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 20
};

// Card Animations with Press States
export const cardPress = {
  whileTap: { 
    scale: 0.97,
    transition: { duration: 0.1 }
  },
  transition: { type: 'spring', stiffness: 400, damping: 30 }
};

export const cardHover = {
  whileHover: { 
    y: -4,
    transition: { duration: 0.2 }
  }
};

// Accordion Animation
export const accordionAnimation: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: 'easeOut' },
      opacity: { duration: 0.2, delay: 0.1 }
    }
  }
};

// Smooth Progress Animation
export const progressAnimation = {
  initial: { scaleX: 0, originX: 0 },
  animate: (value: number) => ({
    scaleX: value / 100,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      duration: 0.6
    }
  })
};

// Shared Element Transition
export const sharedElementTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8
};

// List Item Stagger
export const listStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 400,
      damping: 30
    }
  }
};

// Performance: Will-Change Helper
export const optimizeForAnimation = (properties: string[] = ['transform', 'opacity']) => ({
  willChange: properties.join(', ')
});

// Respect Reduced Motion
export const shouldReduceMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const respectMotionPreference = (animation: Variants): Variants => {
  if (shouldReduceMotion()) {
    return {
      initial: {},
      animate: {},
      exit: {}
    };
  }
  return animation;
};

// Apply reduced motion to transition
export const respectMotionTransition = (transition: Transition): Transition => {
  if (shouldReduceMotion()) {
    return { duration: 0 };
  }
  return transition;
};
