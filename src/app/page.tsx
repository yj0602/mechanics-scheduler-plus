"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Plus, Calendar, List } from "lucide-react"; // 아이콘 추가
import WeeklyTimetable from "@/components/WeeklyTimetable";
import MiniCalendar from "@/components/MiniCalendar";
import UpcomingReservations from "@/components/UpcomingReservations";
import ReservationDetailModal from "@/components/ReservationDetailModal";
import ReservationModal from "@/components/ReservationModal";
import ReservationListView from "@/components/ReservationListView"; // 신규 컴포넌트 import
import { Reservation } from "@/types";

export default function Home() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFabModalOpen, setIsFabModalOpen] = useState(false);

  // [NEW] 뷰 모드 상태 (timetable | list)
  const [viewMode, setViewMode] = useState<"timetable" | "list">("timetable");

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // [NEW] 모바일 메뉴 열림/닫힘 시 바디 스크롤 잠금/해제
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // 컴포넌트가 사라질 때(언마운트) 안전하게 스크롤 복구
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleReservationClick = (res: Reservation) => {
    setSelectedReservation(res);
    setIsDetailModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  if (!currentDate) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#121212] text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-[#121212] text-gray-200">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-2 md:px-6 md:py-4 bg-[#1a1a1a] border-b border-gray-800 flex-shrink-0 relative z-40">
        <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span className="md:hidden">📅 예약 시스템</span>
          <span className="hidden md:inline">📅 동아리방 예약 시스템</span>
        </h1>
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* 모바일 오버레이 */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/80 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* 사이드바 (고정) */}
        <aside
          className={`
            w-80 border-r border-gray-800 bg-[#1a1a1a] flex flex-col p-5 gap-6 z-50
            fixed md:relative inset-y-0 left-0 transition-transform duration-300 ease-in-out
            ${
              isMobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }
            md:flex 
          `}
        >
          {/* <div className="md:hidden flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div> */}
          <div className="mt-2">
            <MiniCalendar
              selectedDate={currentDate}
              onSelectDate={(date) => {
                setCurrentDate(date);
                setIsMobileMenuOpen(false);
                setViewMode("timetable"); // 날짜 누르면 시간표로 이동
              }}
            />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <UpcomingReservations onItemClick={handleReservationClick} />
          </div>
        </aside>

        {/* 메인 섹션 */}
        <section className="flex-1 flex flex-col overflow-hidden bg-[#121212] w-full relative">
          {/* [수정] 탭 스위처: 정렬과 크기 개선 */}
          {/* 1. md:justify-start 제거 -> 항상 중앙 정렬(justify-center) 유지 */}
          <div className="flex-shrink-0 px-4 pt-2 pb-2 flex justify-center">
            <div className="bg-[#252525] p-1 rounded-lg flex items-center border border-gray-800">
              <button
                onClick={() => setViewMode("timetable")}
                className={`
                  flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all
                  /* 2. PC(md)에서는 좌우 패딩을 2배(px-8)로 늘려서 넓게 표현 */
                  px-4 py-1.5 md:px-8 md:py-2
                  ${
                    viewMode === "timetable"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-400 hover:text-gray-200"
                  }
                `}
              >
                <Calendar className="w-4 h-4" />
                <span>시간표</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`
                  flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all
                  /* 2. PC(md)에서는 좌우 패딩을 2배(px-8)로 늘려서 넓게 표현 */
                  px-4 py-1.5 md:px-8 md:py-2
                  ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-400 hover:text-gray-200"
                  }
                `}
              >
                <List className="w-4 h-4" />
                <span>목록</span>
              </button>
            </div>
          </div>

          {/* 뷰 모드에 따른 컨텐츠 렌더링 */}
          <div className="flex-1 overflow-hidden px-3 md:px-6 pb-3 md:pb-6">
            {viewMode === "timetable" ? (
              <WeeklyTimetable
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onReservationClick={handleReservationClick}
              />
            ) : (
              <ReservationListView onItemClick={handleReservationClick} />
            )}
          </div>

          {/* 플로팅 버튼 (항상 표시) */}
          <button
            onClick={() => setIsFabModalOpen(true)}
            className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
            aria-label="예약 추가"
          >
            <Plus className="w-8 h-8" />
          </button>
        </section>
      </main>

      {/* 상세 모달 */}
      {selectedReservation && (
        <ReservationDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          reservation={selectedReservation}
          onDeleteSuccess={() => setIsDetailModalOpen(false)}
        />
      )}

      {/* 예약 생성 모달 */}
      <ReservationModal
        isOpen={isFabModalOpen}
        onClose={() => setIsFabModalOpen(false)}
        selectedDate={new Date()}
        startTime="09:00"
        onSuccess={() => setIsFabModalOpen(false)}
      />
    </div>
  );
}
