import { useState } from 'react';
import { AnimatedProgress } from '@/components/ui/animated/AnimatedProgress';

const testingChecklist = [
  { category: 'Core Navigation', tests: [
    'Bottom navigation switches screens',
    'Back button navigation works',
    'Deep linking functional',
    'Tab badges update correctly'
  ]},
  { category: 'Touch Interactions', tests: [
    'All buttons have 44px minimum touch target',
    'Swipe gestures work smoothly',
    'Pull-to-refresh functions',
    'Long press shows options'
  ]},
  { category: 'Loading States', tests: [
    'Skeleton screens show during load',
    'No layout shift on content load',
    'Error states display correctly',
    'Empty states show when appropriate'
  ]},
  { category: 'Responsive Design', tests: [
    'Works on iPhone SE (320px)',
    'No horizontal scroll',
    'Text remains readable',
    'Images scale properly'
  ]},
  { category: 'Performance', tests: [
    'Scroll at 60fps',
    'Animations smooth',
    'Images lazy load',
    'No memory leaks'
  ]},
  { category: 'Accessibility', tests: [
    'Keyboard navigation works',
    'Screen reader compatible',
    'Focus indicators visible',
    'Color contrast sufficient'
  ]}
];

export const TestingChecklist = () => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  
  const toggleItem = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };
  
  const totalTests = testingChecklist.reduce((sum, cat) => sum + cat.tests.length, 0);
  const progress = (checkedItems.length / totalTests) * 100;
  
  const handleGenerateReport = () => {
    const report = testingChecklist.map(cat => ({
      category: cat.category,
      tested: cat.tests.filter(t => checkedItems.includes(t)),
      untested: cat.tests.filter(t => !checkedItems.includes(t)),
      completion: `${cat.tests.filter(t => checkedItems.includes(t)).length}/${cat.tests.length}`
    }));
    console.log('Testing Report:', report);
    console.log(`Overall Completion: ${checkedItems.length}/${totalTests} (${Math.round(progress)}%)`);
    alert('Testing report logged to console. Open DevTools to view.');
  };
  
  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen bg-background">
      <h1 className="text-2xl font-bold mb-2 text-foreground">MatchMe Testing Checklist</h1>
      <p className="text-sm text-muted-foreground mb-6">Complete all tests before production deployment</p>
      
      <div className="mb-8 p-4 bg-card rounded-xl border border-border">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Testing Progress</span>
          <span className="font-bold text-primary">{checkedItems.length}/{totalTests} ({Math.round(progress)}%)</span>
        </div>
        <AnimatedProgress value={progress} />
      </div>
      
      {testingChecklist.map(category => (
        <div key={category.category} className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-foreground">{category.category}</h2>
          <div className="space-y-2">
            {category.tests.map(test => (
              <label 
                key={test} 
                className="flex items-center gap-3 p-3 bg-card rounded-lg cursor-pointer hover:bg-muted border border-border transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checkedItems.includes(test)}
                  onChange={() => toggleItem(test)}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                />
                <span className={`flex-1 ${checkedItems.includes(test) ? 'line-through opacity-60' : ''}`}>
                  {test}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
      
      <button
        onClick={handleGenerateReport}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
      >
        Generate Testing Report
      </button>
      
      <div className="mt-6 p-4 bg-muted rounded-xl text-sm text-muted-foreground">
        <p className="font-medium mb-2">Testing Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Test on real devices, not just emulators</li>
          <li>Check both light and dark mode</li>
          <li>Test with slow network connections</li>
          <li>Verify with screen reader enabled</li>
          <li>Test keyboard navigation thoroughly</li>
        </ul>
      </div>
    </div>
  );
};

export default TestingChecklist;
