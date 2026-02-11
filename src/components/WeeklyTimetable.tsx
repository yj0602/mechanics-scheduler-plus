"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  addDays,
  addWeeks,
  subWeeks,
  isSameWeek,
  eachDayOfInterval,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  X,
} from "lucide-react";
import { Reservation } from "@/types";
import { useReservations } from "@/hooks/useReservations";
import { getKSTStartOfWeek, formatToDbDate, timeToMinutes } from "@/utils/date";
import { getReservationColor } from "@/utils/colors";

interface WeeklyTimetableProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onReservationClick: (res: Reservation) => void;
}

export default function WeeklyTimetable({
  currentDate,
  onDateChange,
  onReservationClick,
}: WeeklyTimetableProps) {
  // 기존 상태(현재 코드에서 안쓰는 것 같지만 남겨둠)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    time: string;
  } | null>(null);

  // ✅ 겹침 목록 모달용 상태
  const [overlapList, setOverlapList] = useState<Reservation[] | null>(null);

  const { startDay, endDay, weekDays } = useMemo(() => {
    const start = getKSTStartOfWeek(currentDate);
    const end = addDays(start, 6);
    const days = eachDayOfInterval({ start, end });
    return { startDay: start, endDay: end, weekDays: days };
  }, [currentDate]);

  const { data: reservations = [], isLoading } = useReservations(
    startDay,
    endDay
  );

  const timeSlots = Array.from({ length: 15 }, (_, i) => i + 9); // 09:00 ~ 23:00

  const handlePrevWeek = () => onDateChange(subWeeks(currentDate, 1));
  const handleNextWeek = () => onDateChange(addWeeks(currentDate, 1));
  const handleToday = () => onDateChange(new Date());

  // ✅ 겹치는 모든 일정
  const getOverlappingReservations = (
    targetDate: Date,
    hour: number,
    minute: number
  ) => {
    const dateStr = formatToDbDate(targetDate);
    const currentSlotMinutes = hour * 60 + minute;

    return reservations.filter((r) => {
      if (r.date !== dateStr) return false;
      const startMinutes = timeToMinutes(r.start_time);
      const endMinutes = timeToMinutes(r.end_time);
      return currentSlotMinutes >= startMinutes && currentSlotMinutes < endMinutes;
    });
  };

  // ✅ 셀 클릭 행동: 1개면 바로 상세 / 여러개면 목록 모달
  const handleSlotClick = (list: Reservation[]) => {
    if (list.length === 1) onReservationClick(list[0]);
    else setOverlapList(list);
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-gray-200 rounded-xl shadow-lg border border-gray-800 overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* ✅ 겹침 목록 모달 */}
      {overlapList && (
        <div className="absolute inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-[#1b1b1b] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#222]">
              <div className="font-bold text-sm text-gray-200">
                겹치는 일정 {overlapList.length}개
              </div>
              <button
                onClick={() => setOverlapList(null)}
                className="p-1 rounded-md hover:bg-white/10 text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {overlapList.map((res) => {
                const colors = getReservationColor(res.id);
                return (
                  <button
                    key={res.id}
                    onClick={() => {
                      setOverlapList(null);
                      onReservationClick(res);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-800 last:border-b-0 hover:bg-white/5 transition`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`font-bold text-sm truncate ${colors.title}`}>
                          {res.purpose}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {res.start_time} ~ {res.end_time}
                        </div>
                        {res.kind === "personal" && res.name && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <User className="w-3 h-3" />
                            <span className="truncate">{res.name}</span>
                          </div>
                        )}
                      </div>

                      <span
                        className={`shrink-0 text-[10px] px-2 py-1 rounded-full border border-white/10 ${colors.bg}`}
                      >
                        {res.kind === "personal"
                          ? "개인"
                          : res.kind === "ensemble"
                          ? "합주"
                          : res.kind === "concert"
                          ? "공연"
                          : "기타"}                      
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 헤더 (네비게이션) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#252525] flex-shrink-0 z-30 relative">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-base md:text-lg">
            {format(startDay, "M월")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevWeek}
            className="p-1 hover:bg-gray-700 rounded-md transition text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className={`text-xs px-3 py-1 rounded-md transition font-medium ${
              isSameWeek(currentDate, new Date())
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            이번 주
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1 hover:bg-gray-700 rounded-md transition text-gray-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-none custom-scrollbar relative">
        {/* 요일 헤더 */}
        <div className="sticky top-0 z-20 grid grid-cols-8 border-b border-gray-800 bg-[#252525] shadow-sm">
          <div className="p-2 md:p-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 border-r border-gray-800 flex items-center justify-center">
            시간
          </div>
          {weekDays.map((day) => {
            const isToday = formatToDbDate(day) === formatToDbDate(new Date());
            return (
              <div
                key={day.toString()}
                className={`p-2 md:p-3 text-center border-r border-gray-800 last:border-r-0 ${
                  isToday ? "bg-blue-900/20" : ""
                }`}
              >
                <div
                  className={`text-[10px] md:text-xs font-bold ${
                    isToday ? "text-blue-400" : "text-gray-400"
                  }`}
                >
                  {format(day, "E", { locale: ko })}
                </div>
                <div
                  className={`text-xs md:text-sm mt-0.5 md:mt-1 ${
                    isToday ? "font-bold text-blue-400" : "text-gray-200"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* 그리드 바디 */}
        <div className="grid grid-cols-8">
          {/* 시간축 */}
          <div className="flex flex-col border-r border-gray-800 bg-[#252525]">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-14 md:h-20 flex items-start justify-center pt-1 md:pt-2 text-[10px] md:text-xs text-gray-500 border-b border-gray-800"
              >
                <span>{time}:00</span>
              </div>
            ))}
          </div>

          {/* 각 요일별 시간표 */}
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              className="flex flex-col border-r border-gray-800 last:border-r-0"
            >
              {timeSlots.map((time) => {
                return [0, 30].map((minute) => {
                  const overlappingRes = getOverlappingReservations(day, time, minute);

                  // 빈 슬롯
                  if (overlappingRes.length === 0) {
                    return (
                      <div
                        key={`${time}-${minute}`}
                        className="h-7 md:h-10 border-b border-gray-800 border-dashed border-gray-800/50 flex"
                      >
                        <button className="w-full h-full" />
                      </div>
                    );
                  }

                  // ✅ 요약 표시: 첫 일정 + 배지(+N)
                  const topRes = overlappingRes[0];
                  const extraCount = overlappingRes.length - 1;

                  const colors = getReservationColor(topRes.id);
                  const currentSlotMinutes = time * 60 + minute;
                  const startMinutes = timeToMinutes(topRes.start_time);
                  const isStartSlot = currentSlotMinutes === startMinutes;

                  return (
                    <div
                      key={`${time}-${minute}`}
                      className="h-7 md:h-10 border-b border-gray-800 border-dashed border-gray-800/50"
                    >
                      <button
                        onClick={() => handleSlotClick(overlappingRes)}
                        className={`w-full h-full relative text-left overflow-hidden rounded-md
                          ${colors.bg}
                          ${extraCount > 0 ? "ring-1 ring-white/10" : ""}
                        `}
                      >
                        {/* 좌측 강조선(시작 슬롯만 진하게) */}
                        <span
                          className={`absolute left-0 top-0 h-full w-[3px] md:w-1 ${
                            isStartSlot ? colors.border : "border-transparent"
                          }`}
                        />

                        {/* 텍스트는 시작 슬롯에서만 */}
                        {isStartSlot && (
                          <div className="px-1 md:px-1.5 py-0.5">
                            <div
                              className={`font-bold text-[10px] md:text-[11px] leading-tight truncate ${colors.title}`}
                            >
                              {topRes.purpose}
                            </div>
                            {topRes.kind === "personal" && topRes.name && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <User className="w-2 h-2 md:w-2.5 md:h-2.5 text-gray-400" />
                                <span className="text-[8px] md:text-[9px] text-gray-400 truncate">
                                  {topRes.name}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* +N 배지 */}
                        {extraCount > 0 && (
                          <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1
                            text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full
                            bg-black/40 text-white border border-white/10 backdrop-blur"
                          >
                            +{extraCount}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                });
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
