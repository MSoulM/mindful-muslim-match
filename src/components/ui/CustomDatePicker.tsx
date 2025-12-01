import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, setYear, setMonth, startOfMonth } from 'date-fns';
import { Calendar } from 'lucide-react';

export interface CustomDatePickerProps {
  value?: Date | undefined | null;
  onChange: (date?: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, minDate, maxDate, className }) => {
  const [selected, setSelected] = useState<Date | undefined | null>(value ?? null);
  // Track the displayed month separately to control calendar navigation
  const [displayedMonth, setDisplayedMonth] = useState<Date>(() => {
    return value ? startOfMonth(value) : startOfMonth(new Date());
  });

  useEffect(() => {
    setSelected(value ?? null);
    if (value) {
      setDisplayedMonth(startOfMonth(value));
    }
  }, [value]);

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    const newDate = selected ? setYear(selected as Date, year) : new Date(year, 0, 1);
    setSelected(newDate);
    onChange(newDate);
    // Update displayed month to show the new year
    setDisplayedMonth(startOfMonth(newDate));
  };

  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr, 10);
    const currentYear = selected ? (selected as Date).getFullYear() : new Date().getFullYear();
    const newDate = selected ? setMonth(selected as Date, month) : new Date(currentYear, month, 1);
    setSelected(newDate);
    onChange(newDate);
    // Update displayed month to show the new month
    setDisplayedMonth(startOfMonth(newDate));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`w-full h-12 rounded-xl border border-neutral-300 flex items-center px-3 text-left ${className ?? ''}`}
        >
          <Calendar className="mr-2 w-5 h-5 text-neutral-600" />
          {selected ? (
            <span className="flex items-center justify-between w-full">
              <span>{format(selected as Date, 'dd/MM/yyyy')}</span>
            </span>
          ) : (
            <span className="text-neutral-400">Select date</span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3 bg-white">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select
              value={selected ? (selected as Date).getFullYear().toString() : ''}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-24 h-10">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Array.from({ length: 85 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selected ? String((selected as Date).getMonth()) : ''}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="flex-1 h-10">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <CalendarComponent
            mode="single"
            selected={selected as Date | undefined}
            month={displayedMonth}
            onMonthChange={(month) => setDisplayedMonth(startOfMonth(month))}
            onSelect={(date) => {
              setSelected(date);
              onChange(date);
              if (date) {
                setDisplayedMonth(startOfMonth(date));
              }
            }}
            disabled={(date) => (maxDate ? date > maxDate : false) || (minDate ? date < minDate : false)}
            initialFocus
            className="p-0"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomDatePicker;
