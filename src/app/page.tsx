"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // 햄버거 메뉴 아이콘
import WeeklyTimetable from "@/components/WeeklyTimetable";
import MiniCalendar from "@/components/MiniCalendar";
import UpcomingReservations from "@/components/UpcomingReservations";
import ReservationDetailModal from "@/components/ReservationDetailModal";
import { Reservation } from "@/types";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  // 모바일 메뉴 상태
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 상세 모달 상태 (부모로 이동됨)
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 데이터 변경 트리거
  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // 대여 아이템 클릭 시 (타임테이블 or 목록에서)
  const handleReservationClick = (res: Reservation) => {
    setSelectedReservation(res);
    setIsDetailModalOpen(true);
    // 모바일 메뉴가 열려있다면 닫아줌 (UX)
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-gray-200">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-gray-800 flex-shrink-0 relative z-40">
        <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          📅 동아리방 예약 시스템
        </h1>
        {/* 모바일 햄버거 버튼 (md 이상에서는 숨김) */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* 좌측 사이드바 (PC: 항상 보임 / Mobile: 조건부 렌더링) */}
        {/* 모바일 오버레이 배경 */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/80 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* 사이드바 컨텐츠 */}
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
          {/* 모바일에서 닫기 버튼 추가 (옵션) */}
          <div className="md:hidden flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div>
            <MiniCalendar
              selectedDate={currentDate}
              onSelectDate={(date) => {
                setCurrentDate(date);
                setIsMobileMenuOpen(false); // 날짜 고르면 메뉴 닫기
              }}
              refreshKey={refreshKey}
            />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <UpcomingReservations
              refreshKey={refreshKey}
              onItemClick={handleReservationClick}
            />
          </div>
        </aside>

        {/* 우측 메인 뷰 */}
        <section className="flex-1 p-0 md:p-6 overflow-hidden bg-[#121212] w-full">
          <WeeklyTimetable
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onReservationChange={handleDataChange}
            onReservationClick={handleReservationClick}
          />
        </section>
      </main>

      {/* <footer className="py-4 text-center text-gray-600 text-xs border-t border-gray-800 bg-[#1a1a1a] flex-shrink-0">
        © 2024 Club Scheduler. All rights reserved.
      </footer> */}

      {/* 상세 모달 (전역 레벨 렌더링) */}
      {selectedReservation && (
        <ReservationDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          reservation={selectedReservation}
          onDeleteSuccess={handleDataChange}
        />
      )}
    </div>
  );
}
