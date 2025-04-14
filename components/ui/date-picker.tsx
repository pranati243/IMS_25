"use client";

import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomDatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
}

export function CustomDatePicker({ date, setDate }: CustomDatePickerProps) {
  const CustomInput = React.forwardRef(({ value, onClick }: any, ref: any) => (
    <Button
      variant={"outline"}
      className={cn(
        "w-full justify-start text-left font-normal",
        !value && "text-muted-foreground"
      )}
      onClick={onClick}
      ref={ref}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value || <span>Pick a date</span>}
    </Button>
  ));

  return (
    <DatePicker
      selected={date}
      onChange={(date: Date | null) => setDate(date || undefined)}
      customInput={<CustomInput />}
      dateFormat="MMMM d, yyyy"
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      yearDropdownItemNumber={75}
      scrollableYearDropdown
      maxDate={new Date()}
      minDate={new Date("1950-01-01")}
      className="w-full rounded-md border border-input bg-background"
      calendarClassName="shadow-lg rounded-md border border-input bg-background"
      popperClassName="react-datepicker-popper"
      wrapperClassName="w-full"
      showPopperArrow={false}
      popperPlacement="bottom-start"
      popperModifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 8],
          },
          fn: (state) => ({
            ...state,
            x: state.x,
            y: state.y + 8
          })
        },
      ]}
    />
  );
}

// Add custom CSS to improve the look and feel
const styles = `
  .react-datepicker {
    font-family: inherit;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }
  .react-datepicker__header {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    padding-top: 0.5rem;
  }
  .react-datepicker__month {
    margin: 0.4rem;
  }
  .react-datepicker__day-name {
    color: #64748b;
    font-weight: 500;
  }
  .react-datepicker__day--selected {
    background-color: #0f172a !important;
    color: white !important;
  }
  .react-datepicker__day--keyboard-selected {
    background-color: #e2e8f0;
    color: #0f172a;
  }
  .react-datepicker__day:hover {
    background-color: #f1f5f9;
  }
  .react-datepicker__day--today {
    font-weight: bold;
    color: #0f172a;
  }
  .react-datepicker__year-dropdown,
  .react-datepicker__month-dropdown {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
  .react-datepicker__year-option:hover,
  .react-datepicker__month-option:hover {
    background-color: #f1f5f9;
  }
  .react-datepicker__triangle {
    display: none;
  }
`;

// Add the styles to the document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 