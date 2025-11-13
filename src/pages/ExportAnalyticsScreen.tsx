/**
 * Export Analytics Screen
 * Analytics data export and report generation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import { FileDown, Mail, Save, Calendar, Check } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { analyticsService } from '@/services/AnalyticsService';
import { useToast } from '@/hooks/use-toast';

type ExportFormat = 'pdf' | 'csv' | 'json';

export const ExportAnalyticsScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'keyMetrics',
    'growth',
    'dna',
    'posts',
    'audience',
  ]);
  const [isExporting, setIsExporting] = useState(false);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => navigate('/analytics/engagement'),
    trackMouse: true,
    trackTouch: true,
  });

  const exportFormats = [
    { value: 'pdf' as const, label: 'PDF Report', description: 'Formatted report with charts' },
    { value: 'csv' as const, label: 'CSV Data', description: 'Spreadsheet-compatible data' },
    { value: 'json' as const, label: 'JSON Raw Data', description: 'Developer-friendly format' },
  ];

  const sections = [
    { id: 'keyMetrics', label: 'Key Metrics', description: 'Views, DNA score, match rate' },
    { id: 'growth', label: 'Growth Charts', description: 'Timeline of your progress' },
    { id: 'dna', label: 'DNA Evolution', description: 'Category breakdown and trends' },
    { id: 'posts', label: 'Post Performance', description: 'Top performing content' },
    { id: 'audience', label: 'Audience Insights', description: 'Demographics and behavior' },
  ];

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: 'No sections selected',
        description: 'Please select at least one section to export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      const blob = await analyticsService.exportData(selectedFormat, selectedSections);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `Your ${selectedFormat.toUpperCase()} report has been downloaded`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScreenContainer className="bg-background" hasBottomNav={false}>
      <TopBar variant="back" title="Export Analytics" onBackClick={() => window.history.back()} />

      {/* Screen Indicator Dots */}
      <div className="flex justify-center gap-2 py-3 bg-background border-b border-border">
        <div className="w-2 h-2 rounded-full bg-muted" />
        <div className="w-2 h-2 rounded-full bg-muted" />
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>

      <motion.div 
        {...swipeHandlers} 
        className="flex-1 overflow-y-auto"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Export Format */}
        <div className="px-4 py-4">
          <h3 className="text-lg font-semibold mb-3">Export Format</h3>
          <div className="space-y-2">
            {exportFormats.map((format) => (
              <Card
                key={format.value}
                className={`p-4 cursor-pointer transition-all ${
                  selectedFormat === format.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedFormat(format.value)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedFormat === format.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {selectedFormat === format.value && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{format.label}</p>
                    <p className="text-sm text-muted-foreground">{format.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Select Sections */}
        <div className="px-4 pb-4">
          <h3 className="text-lg font-semibold mb-3">Include Sections</h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <Card key={section.id} className="p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{section.label}</p>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </label>
              </Card>
            ))}
          </div>
        </div>

        {/* Delivery Options */}
        <div className="px-4 pb-4">
          <h3 className="text-lg font-semibold mb-3">Delivery Method</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex-col h-auto py-4"
              onClick={handleExport}
              disabled={isExporting}
            >
              <FileDown className="h-6 w-6 mb-2" />
              <span className="text-xs">Download</span>
            </Button>
            <Button variant="outline" className="flex-col h-auto py-4" disabled>
              <Mail className="h-6 w-6 mb-2" />
              <span className="text-xs">Email</span>
            </Button>
            <Button variant="outline" className="flex-col h-auto py-4" disabled>
              <Save className="h-6 w-6 mb-2" />
              <span className="text-xs">Save</span>
            </Button>
          </div>
        </div>

        {/* Schedule Reports */}
        <div className="px-4 pb-6">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">Schedule Reports</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get automated analytics reports delivered to your email
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Export Button */}
        <div className="px-4 pb-6">
          <Button
            size="lg"
            className="w-full"
            onClick={handleExport}
            disabled={isExporting || selectedSections.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export Analytics'}
          </Button>
        </div>
      </motion.div>
    </ScreenContainer>
  );
};
