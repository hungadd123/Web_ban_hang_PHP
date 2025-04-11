// src/components/ui/date-range-picker.jsx
"use client"; // Chỉ cần nếu dùng Next.js App Router

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils"; // Import tiện ích classNames của bạn
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateRangePicker({
  className,
  date, // state dạng { from: Date | undefined, to: Date | undefined }
  onDateChange, // hàm để cập nhật state ở component cha
}) {

  // Xử lý việc chọn ngày trong Calendar
  const handleSelect = (selectedRange) => {
    if (onDateChange) {
      onDateChange(selectedRange); // Gọi hàm callback của cha
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[270px] justify-start text-left font-normal", // Tăng chiều rộng một chút
              !date?.from && "text-muted-foreground" // Hiển thị màu mờ khi chưa chọn
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range" // Chế độ chọn khoảng ngày
            defaultMonth={date?.from}
            selected={date} // Truyền state date vào
            onSelect={handleSelect} // Sử dụng handler đã tạo
            numberOfMonths={2} // Hiển thị 2 tháng cùng lúc
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}