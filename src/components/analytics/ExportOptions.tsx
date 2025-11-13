/**
 * ExportOptions Component
 * Export format selector with preview
 */

import { useState } from 'react';
import { FileDown, FileType, FileJson, Mail, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export type ExportFormat = 'pdf' | 'csv' | 'json';

interface ExportSection {
  id: string;
  label: string;
  description: string;
}

interface ExportOptionsProps {
  sections: ExportSection[];
  selectedSections: string[];
  onSectionsChange: (sections: string[]) => void;
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onExport: () => void;
  isExporting?: boolean;
  className?: string;
}

const formatOptions = [
  {
    value: 'pdf' as const,
    label: 'PDF Report',
    description: 'Formatted document with charts',
    icon: FileDown,
  },
  {
    value: 'csv' as const,
    label: 'CSV Data',
    description: 'Spreadsheet-compatible data',
    icon: FileType,
  },
  {
    value: 'json' as const,
    label: 'JSON',
    description: 'Raw data for developers',
    icon: FileJson,
  },
];

export const ExportOptions = ({
  sections,
  selectedSections,
  onSectionsChange,
  format,
  onFormatChange,
  onExport,
  isExporting = false,
  className,
}: ExportOptionsProps) => {
  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      onSectionsChange(selectedSections.filter((id) => id !== sectionId));
    } else {
      onSectionsChange([...selectedSections, sectionId]);
    }
  };

  const selectAll = () => {
    onSectionsChange(sections.map((s) => s.id));
  };

  const deselectAll = () => {
    onSectionsChange([]);
  };

  const allSelected = selectedSections.length === sections.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Format Selection */}
      <div>
        <h3 className="text-sm font-medium mb-3">Export Format</h3>
        <div className="grid grid-cols-1 gap-2">
          {formatOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = format === option.value;

            return (
              <Card
                key={option.value}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected && 'border-primary bg-primary/5'
                )}
                onClick={() => onFormatChange(option.value)}
              >
                <div className="p-3 flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-primary text-white' : 'bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Include Sections</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              disabled={allSelected}
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              disabled={selectedSections.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {sections.map((section) => {
            const isSelected = selectedSections.includes(section.id);

            return (
              <Card key={section.id} className="p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{section.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </label>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Export Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={onExport}
        disabled={isExporting || selectedSections.length === 0}
      >
        {isExporting ? (
          <>Exporting...</>
        ) : (
          <>
            <FileDown className="h-5 w-5 mr-2" />
            Export {format.toUpperCase()}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        {selectedSections.length} {selectedSections.length === 1 ? 'section' : 'sections'} selected
      </p>
    </div>
  );
};
