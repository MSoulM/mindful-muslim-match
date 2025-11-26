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
import { format, setYear, setMonth } from 'date-fns';
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

  useEffect(() => {
    setSelected(value ?? null);
  }, [value]);

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    const newDate = selected ? setYear(selected as Date, year) : new Date(year, 0, 1);
    setSelected(newDate);
    onChange(newDate);
  };

  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr, 10);
    const newDate = selected ? setMonth(selected as Date, month) : new Date(new Date().getFullYear(), month, 1);
    setSelected(newDate);
    onChange(newDate);
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
            onSelect={(date) => {
              setSelected(date);
              onChange(date);
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
