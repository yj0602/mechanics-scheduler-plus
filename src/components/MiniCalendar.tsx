"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/app/utils/supabase";

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  refreshKey: number;
}

export default function MiniCalendar({
  selectedDate,
  onSelectDate,
  refreshKey,
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservedDates, setReservedDates] = useState<Set<string>>(new Set());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  useEffect(() => {
    const fetchMonthlyReservations = async () => {
      const startStr = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const endStr = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("reservations")
        .select("date")
        .gte("date", startStr)
        .lte("date", endStr);

      if (!error && data) {
        const dates = new Set(data.map((item) => item.date));
        setReservedDates(dates);
      }
    };

    fetchMonthlyReservations();
  }, [currentMonth, refreshKey]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="bg-[#252525] p-4 rounded-xl border border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-200 pl-1">
          {format(currentMonth, "yyyy년 M월")}
        </span>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-700 rounded text-gray-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-700 rounded text-gray-400"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="text-[10px] text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 gap-x-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const hasEvent = reservedDates.has(dateStr);

          return (
            <button
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`
                h-8 w-8 rounded-full flex items-center justify-center transition relative
                ${!isCurrentMonth ? "text-gray-700" : "text-gray-300"}
                ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold shadow-md"
                    : "hover:bg-gray-700"
                }
                ${isToday && !isSelected ? "text-blue-400 font-bold" : ""}
              `}
            >
              {/* [NEW] 점 표시: 숫자 위쪽(top-1)에 빨간색으로, 선택 여부 상관없이 표시 */}
              {hasEvent && (
                <div className="absolute top-[4px] w-1 h-1 bg-green-500 rounded-full"></div>
              )}

              {/* 숫자를 살짝 아래로 내림 (pt-1) */}
              <span className="text-xs z-10 pt-1">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
