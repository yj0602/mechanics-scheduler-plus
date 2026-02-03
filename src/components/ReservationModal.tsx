"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format, addMinutes, parse } from "date-fns";
import { X, Clock, Calendar, User, FileText } from "lucide-react";
import { supabase } from "@/app/utils/supabase";
import { Reservation } from "@/types";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  startTime: string;
  existingReservations: Reservation[];
  onSuccess: () => void;
}

// [NEW] 시간을 분으로 변환하는 헬퍼 함수
// DB에서 "14:30:00"이 오든, "14:30"이 오든 정확히 처리
const toMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

export default function ReservationModal({
  isOpen,
  onClose,
  selectedDate,
  startTime,
  existingReservations,
  onSuccess,
}: ReservationModalProps) {
  const [userName, setUserName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_NAME_LENGTH = 8;
  const MAX_PURPOSE_LENGTH = 16;

  useEffect(() => {
    if (isOpen) {
      setUserName("");
      setPurpose("");
      setEndTime("");
    }
  }, [isOpen, startTime]);

  // [수정] 분 단위 숫자 비교로 변경 (가장 확실함)
  const availableEndTimes = useMemo(() => {
    if (!startTime) return [];

    const times: string[] = [];
    let current = parse(startTime, "HH:mm", new Date());
    const startMin = toMinutes(startTime);

    while (true) {
      current = addMinutes(current, 30);
      const timeStr = format(current, "HH:mm");
      const displayTimeStr = timeStr === "00:00" ? "24:00" : timeStr;

      const endMin =
        displayTimeStr === "24:00" ? 1440 : toMinutes(displayTimeStr);

      // 겹침 검사 (숫자 비교)
      const isOverlapping = existingReservations.some((r) => {
        const rStart = toMinutes(r.start_time);
        const rEnd = toMinutes(r.end_time);

        // (내시작 < 남종료) AND (내종료 > 남시작)
        // 14:30 < 14:30 은 False이므로 겹치지 않음 -> 정상 동작
        return startMin < rEnd && endMin > rStart;
      });

      if (isOverlapping) break;

      times.push(displayTimeStr);

      if (displayTimeStr === "24:00") break;
      if (times.length > 48) break;
    }
    return times;
  }, [startTime, existingReservations]);

  useEffect(() => {
    if (isOpen && availableEndTimes.length > 0 && !endTime) {
      setEndTime(availableEndTimes[0]);
    }
  }, [isOpen, availableEndTimes, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !purpose || !endTime) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase.from("reservations").insert({
        user_name: userName,
        purpose: purpose,
        date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startTime,
        end_time: endTime === "24:00" ? "23:59:59" : endTime,
      });

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("예약 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1E1E1E] w-full max-w-md rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#252525] px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            예약하기
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 상단 정보 */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                날짜
              </label>
              <div className="bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm">
                {format(selectedDate, "yyyy-MM-dd (eee)")}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                시작 시간
              </label>
              <div className="bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                {startTime}
              </div>
            </div>
          </div>

          {/* 종료 시간 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">
              종료 시간
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500 transition"
            >
              {availableEndTimes.length === 0 ? (
                <option disabled>예약 가능 시간 없음</option>
              ) : (
                availableEndTimes.map((t) => (
                  <option key={t} value={t}>
                    {t} 까지
                  </option>
                ))
              )}
            </select>
            <p className="text-[10px] text-gray-500">
              * 다음 예약이 있는 시간 전까지만 선택 가능합니다.
            </p>
          </div>

          {/* 이름 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400">
                예약자 이름
              </label>
              <span
                className={`text-[10px] ${
                  userName.length >= MAX_NAME_LENGTH
                    ? "text-red-400"
                    : "text-gray-500"
                }`}
              >
                {userName.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                maxLength={MAX_NAME_LENGTH}
                placeholder="홍길동"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* 목적 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400">
                사용 목적
              </label>
              <span
                className={`text-[10px] ${
                  purpose.length >= MAX_PURPOSE_LENGTH
                    ? "text-red-400"
                    : "text-gray-500"
                }`}
              >
                {purpose.length}/{MAX_PURPOSE_LENGTH}
              </span>
            </div>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                maxLength={MAX_PURPOSE_LENGTH}
                placeholder="예: 정기공연합주"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableEndTimes.length === 0}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-blue-400 text-white rounded-lg font-bold transition flex justify-center items-center"
            >
              {isSubmitting ? "저장 중..." : "예약 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
