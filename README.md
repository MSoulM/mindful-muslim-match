# MuslimSoulmate.ai - Mindful Matchmaking App

A mobile-first, AI-powered matchmaking application built with React and TypeScript.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📱 Features

### Core Features
- **MySoul DNA**: Comprehensive personality profiling across 5 categories
- **ChaiChat**: AI-mediated compatibility conversations
- **MMAgent**: Personal AI matchmaking assistant
- **Smart Matching**: Algorithm-based compatibility scoring
- **Real-time Messaging**: Connect with compatible matches

### User Experience
- Mobile-first responsive design
- Smooth animations and transitions
- Pull-to-refresh functionality
- Swipe gestures for quick actions
- Haptic feedback
- Dark mode support

## 🏗 Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **State Management**: Context API with localStorage persistence
- **Routing**: React Router v6
- **Build Tool**: Vite
- **UI Components**: Shadcn/ui + Custom components

### Project Structure
```
src/
├── components/
│   ├── ui/              # Base UI components
│   │   ├── Cards/       # Card variants
│   │   ├── animated/    # Animated components
│   │   ├── accessibility/ # A11y components
│   │   └── states/      # Loading/Error/Empty states
│   ├── dna/             # DNA-specific components
│   ├── chat/            # Chat components
│   ├── match/           # Match card components
│   ├── layout/          # Layout components
│   └── dev/             # Development tools
├── pages/               # Screen components
├── context/             # Context providers
│   ├── UserContext.tsx  # User state
│   ├── MatchesContext.tsx # Matches state
│   ├── DNAContext.tsx   # DNA profile state
│   └── AppContext.tsx   # App-wide state
├── hooks/               # Custom hooks
├── utils/               # Utility functions
└── data/               # Mock data
```

## 🎨 Design System

### Colors
- **Primary (Forest)**: `hsl(154 60% 16%)` - #0A3A2E
- **Gold**: `hsl(34 49% 64%)` - #D4A574
- **Pink**: `hsl(335 89% 85%)` - #F8B4D9
- **Success**: `hsl(142 71% 45%)` - #22C55E
- **Error**: `hsl(0 84% 60%)` - #EF4444
- **Warning**: `hsl(38 92% 50%)` - #F59E0B

### Typography
- **Font Stack**: System fonts (San Francisco, Roboto, Helvetica)
- **Sizes**: 12px to 56px (Tailwind scale)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- **Scale**: 4px base unit
- **Common**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

### Components
All components follow atomic design principles:
- **Atoms**: Buttons, inputs, badges
- **Molecules**: Cards, form groups
- **Organisms**: Navigation, match cards
- **Templates**: Screen layouts

## 📱 Mobile-First Design

### Specifications
- **Minimum touch target**: 44×44px (Apple HIG)
- **Base viewport**: 320px (iPhone SE)
- **Breakpoints**: 
  - xs: 320px
  - sm: 375px
  - md: 768px
  - lg: 1024px
- **Safe areas**: Automatic insets for notched devices

### Touch Interactions
- Tap feedback with scale animation
- Swipe gestures for actions
- Pull-to-refresh on lists
- Long press for contextual menus
- Haptic feedback on key actions

## ♿ Accessibility

### Compliance
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader compatible (ARIA labels)
- Focus indicators on all interactive elements
- Reduced motion support

### Features
- Skip links for main content
- Semantic HTML structure
- Alt text for all images
- Form labels and error messages
- Color contrast ratios >4.5:1

## 🧪 Testing

### Development Tools
Access testing tools in development mode:
- `/dev/testing` - Interactive testing checklist
- `/dev/preview` - Device preview tool
- Performance monitor (available throughout app)

### Testing Checklist
1. Core Navigation (4 tests)
2. Touch Interactions (4 tests)
3. Loading States (4 tests)
4. Responsive Design (4 tests)
5. Performance (4 tests)
6. Accessibility (4 tests)

### Manual Testing
Test on real devices:
- iPhone SE (smallest)
- iPhone 14 (standard)
- iPhone 14 Pro Max (largest)
- iPad (tablet)

## 🚀 Performance

### Target Metrics
- **FPS**: 60 (smooth animations)
- **Initial Load**: <3s
- **Time to Interactive**: <4s
- **Lighthouse Score**: >90
- **Bundle Size**: <500KB gzipped

### Optimizations
- Lazy loading for images
- Code splitting by route
- Optimistic UI updates
- Debounced scroll handlers
- GPU-accelerated animations

## 📝 Development

### Adding New Screens
1. Create page component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation if needed
4. Add to testing checklist
5. Update documentation

### Component Guidelines
- **Always mobile-first**: Start with 320px
- **Include states**: Loading, error, empty
- **Error handling**: Try-catch with fallbacks
- **TypeScript**: Proper types for all props
- **Accessibility**: ARIA labels, semantic HTML
- **Animation**: Use Framer Motion variants
- **Testing**: Manual test on devices

### State Management
- User state: `useUser()` hook
- Matches: `useMatches()` hook
- DNA: `useDNA()` hook
- App: `useApp()` hook

All context persists to localStorage automatically.

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Production build
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 📦 Key Dependencies

- `react` ^18.3.1 - UI framework
- `react-router-dom` ^6.30.1 - Routing
- `framer-motion` ^12.23.24 - Animations
- `tailwindcss` ^3.x - Styling
- `lucide-react` ^0.462.0 - Icons
- `react-swipeable` - Swipe gestures

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow existing patterns and conventions
3. Test on multiple devices
4. Update documentation
5. Submit PR with screenshots

### Code Style
- Use TypeScript for all components
- Follow ESLint configuration
- Use functional components with hooks
- Prefer named exports
- Document complex logic

## 📄 License

Private and confidential. All rights reserved.

## 🎉 Completion Status

### ✅ Implemented Features
- [x] Design system with semantic tokens
- [x] 15+ polished screens
- [x] Comprehensive component library
- [x] State management with Context API
- [x] Loading/Error/Empty states
- [x] Animations and micro-interactions
- [x] Pull-to-refresh and swipe gestures
- [x] Accessibility features
- [x] Testing tools
- [x] Complete documentation

### 🚧 Future Enhancements
- [ ] Real API integration
- [ ] User authentication
- [ ] Push notifications
- [ ] Advanced filters
- [ ] Video chat
- [ ] In-app payments

---

**Built with ❤️ for mindful matchmaking**
