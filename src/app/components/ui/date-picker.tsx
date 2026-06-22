"use client";

import * as React from "react";
import { CalendarIcon, XIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";

import { cn } from "./utils";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type DatePickerProps = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "default";
  min?: string;
  max?: string;
  clearable?: boolean;
  id?: string;
  name?: string;
  "aria-invalid"?: boolean;
};

const ISO = "yyyy-MM-dd";
const DISPLAY = "MMM d, yyyy";

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = parse(value, ISO, new Date());
  return isValid(d) ? d : undefined;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  size = "default",
  min,
  max,
  clearable = true,
  id,
  name,
  ...rest
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = toDate(value);
  const minDate = toDate(min);
  const maxDate = toDate(max);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date ? format(date, ISO) : undefined);
    if (date) setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          aria-invalid={rest["aria-invalid"]}
          data-slot="date-picker-trigger"
          data-size={size}
          data-placeholder={selected ? undefined : ""}
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate text-left">
            <CalendarIcon className="opacity-70" />
            {selected ? format(selected, DISPLAY) : placeholder}
          </span>
          {clearable && selected && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              onPointerDown={(e) => e.stopPropagation()}
              className="pointer-events-auto rounded-sm opacity-60 hover:opacity-100"
              aria-label="Clear date"
            >
              <XIcon className="size-4" />
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected ?? minDate ?? new Date()}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
