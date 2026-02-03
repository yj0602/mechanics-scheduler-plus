"use client";

import React, { useState } from "react";
import { X, Trash2, Calendar, Clock, User, FileText } from "lucide-react";
import { supabase } from "@/app/utils/supabase";
import { Reservation } from "@/types";

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation; // 보여줄 예약 정보
  onDeleteSuccess: () => void;
}

export default function ReservationDetailModal({
  isOpen,
  onClose,
  reservation,
  onDeleteSuccess,
}: ReservationDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm(`'${reservation.user_name}'님의 예약을 삭제하시겠습니까?`)
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservation.id);

      if (error) throw error;

      alert("예약이 취소되었습니다.");
      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1E1E1E] w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#252525] px-5 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-lg font-bold text-gray-100">예약 상세</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> 날짜
            </p>
            <p className="text-gray-200">{reservation.date}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 시간
            </p>
            <p className="text-gray-200 font-mono text-lg font-bold">
              {reservation.start_time.slice(0, 5)} ~{" "}
              {reservation.end_time.slice(0, 5)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" /> 예약자
              </p>
              <p className="text-blue-400 font-bold">{reservation.user_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <FileText className="w-3 h-3" /> 예약 목적
              </p>
              <p className="text-gray-300 text-sm">{reservation.purpose}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#252525] flex gap-3 border-t border-gray-700">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              "삭제 중..."
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> 예약 취소
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
