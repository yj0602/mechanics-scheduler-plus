"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Check, User } from "lucide-react";
import { timeToMinutes } from "@/utils/date";

export default function ReservationEnsembleSelect() {
    const [userName, setUserName] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [ensembleData, setEnsembleData] = useState<any>(null);

    const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
    const [isAddingSession, setIsAddingSession] = useState(false);
    const [newSessionName, setNewSessionName] = useState("");
    const addSessionRef = useRef<HTMLDivElement | null>(null);

    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState<"add" | "remove" | null>(null);
    const [sessions, setSessions] = useState<string[]>([
        "보컬",
        "기타",
        "베이스",
        "드럼",
        "키보드",
    ]);

    // Page1 데이터 불러오기 (Hydration 에러 방지를 위해 useEffect 사용)
    useEffect(() => {
        const saved = localStorage.getItem("ensembleDraft");
        if (saved) setEnsembleData(JSON.parse(saved));
    }, []);
    // 드래그 이벤트
    useEffect(() => {
        if (!isDragging) return;
        const stopDrag = () => {
            setIsDragging(false);
            setDragMode(null);
        };
        window.addEventListener("pointerup", stopDrag);
        window.addEventListener("pointercancel", stopDrag);
        window.addEventListener("blur", stopDrag);
        return () => {
            window.removeEventListener("pointerup", stopDrag);
            window.removeEventListener("pointercancel", stopDrag);
            window.removeEventListener("blur", stopDrag);
        };
    }, [isDragging]);
    // 세션 추가 취소 (바깥 영역 클릭 감지)
    useEffect(() => {
        if (!isAddingSession) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
            addSessionRef.current &&
            !addSessionRef.current.contains(e.target as Node)
            ) {
            setIsAddingSession(false);
            setNewSessionName("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isAddingSession]);

    // Page 1에서 정한 날짜들로 days 배열 구성
    const days = useMemo(() => {
        if (!ensembleData?.dates) return [];
        const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
        
        return ensembleData.dates.map((d: string) => {
            const date = new Date(d);
            const month = d.split('-')[1].replace(/^0/, ''); // '02' -> '2'
            const day = d.split('-')[2].replace(/^0/, '');   // '03' -> '3'
            
            return {
                dateDisplay: `${month}/${day}`, // '2/3' 형태
                weekDay: dayNames[date.getDay()] // '화'
            };
        });
    }, [ensembleData]);

    // Page 1에서 정한 시간 범위(startTime ~ endTime)로 30분 단위 times 생성
    const times = useMemo(() => {
        if (!ensembleData) return [];
        
        const startTotal = timeToMinutes(ensembleData.startTime);
        const endTotal = timeToMinutes(ensembleData.endTime);
        const result: string[] = [];

        // 시작 시간부터 종료 시간 직전까지 30분씩 증가
        for (let m = startTotal; m < endTotal; m += 30) {
            const h = Math.floor(m / 60);
            const min = m % 60;
            result.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
        }
        return result;
    }, [ensembleData]);

    // 시간 셀 드래그 (데스크탑+모바일 모두 가능하게)
    const handleCellPointerDown = (key: string) => {
        if (!isLoggedIn) return;
        setIsDragging(true);
        setSelectedCells(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
                setDragMode("remove");
            } else {
                next.add(key);
                setDragMode("add");
            }
            return next;
        });
    };
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !dragMode) return;
        const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
        const key = target?.dataset?.cellkey;

        if (key) {
            setSelectedCells(prev => {
                const next = new Set(prev);
                if (dragMode === "add") next.add(key);
                else next.delete(key);
                return next;
            });
        }
    };
    const handleCellPointerUp = () => {
        setIsDragging(false);
        setDragMode(null);
    };
    
    // 세션 중복 선택 가능
    const toggleSession = (session: string) => {
        setSelectedSessions(prev => {
            const next = new Set(prev);
            if (next.has(session)) next.delete(session);
            else next.add(session);
            return next;
        });
    };
    // 세션 추가 버튼 
    const handleAddSession = () => {
        const trimmed = newSessionName.trim();
        if (!trimmed) return;

        // 기본 세션 이름이랑 겹치는지 중복 체크 (대소문자 무시)
        const exists = sessions.some(
            (s) => s.toLowerCase() === trimmed.toLowerCase()
        );

        if (exists) {
            alert("이미 존재하는 세션입니다");
            return;
        }

        setSessions(prev => [...prev, trimmed]);
        setSelectedSessions(prev => new Set(prev).add(trimmed));

        setNewSessionName("");
        setIsAddingSession(false);
    };

    // 데이터가 로딩 중일 때 처리
    if (!ensembleData) {
        return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-gray-500">정보를 불러오는 중...</div>;
    }


  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center p-6 text-[#c9d1d9] font-sans">
      {/* ===== 헤더 (page1과 동일 톤) ===== */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-12 border-b border-[#30363d] pb-4">
        <div className="flex items-center gap-2 font-bold text-xl text-[#f0f6fc]">
          <span className="text-[#58a6ff]">👥</span>
          BandMeet
        </div>
        {/* 로그인 영역*/}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // TODO: 로그인 로직 연결
            }}
            className="flex items-center gap-1.5 rounded-full border border-gray-700
                      bg-[#1a1a1a] px-3 py-1.5 text-xs text-gray-300
                      hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>로그인</span>
          </button>

          <div className="h-9 w-9 rounded-full bg-gray-700 border border-gray-600" />
        </div>
      </header>

      <main className="w-full max-w-2xl">
        {/* 합주 제목 동적 표시 */}
        <div className="mb-10 text-center">
            <div className="inline-block w-full max-w-md text-3xl font-extrabold text-center bg-[#161b22] py-4 rounded-2xl text-[#f0f6fc]">
                {ensembleData.title}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* ===== 왼쪽: 시간 선택 카드 ===== */}
          <section className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-center text-[#f0f6fc]">
              가능한 시간 선택
            </h3>

            <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-4 md:p-6 shadow-xl overflow-x-auto">
                {/* 동적으로 변하는 days.length에 맞춰 그리드 생성 */}
                <div 
                    className="grid text-xs sticky top-0 bg-[#161b22] z-10 pt-2"
                    style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}
                >
                <div />
                {days.map((d, idx) => (
                    <div key={idx} className="flex flex-col items-center mb-4 select-none">
                        {/* 요일: 작고, 얇고, 연한 회색 */}
                        <span className="text-[10px] font-normal text-gray-500 mb-0.5">
                            {d.weekDay}
                        </span>
                        
                        {/* 날짜: 조금 더 크고, 어두운 회색 (중요도에 따라 색상 조절) */}
                        <span className="text-[13px] font-medium text-[#484f58]">
                            {d.dateDisplay}
                        </span>
                    </div>
                ))}

                {times.map((t) => {
                    const isHour = t.endsWith(":00");
                    return (
                        <div key={t} className="contents">
                            {/* 시간 라벨: 정시에만 표시하거나 작게 표시 */}
                            <div className={`text-[10px] pr-2 flex items-start justify-end text-gray-500 ${isHour ? "mt-[-6px]" : "invisible"}`}>
                                {t}
                            </div>
                            {days.map((d) => {
                                const key = `${d}-${t}`;
                                const selected = selectedCells.has(key);
                                return (
                                    <div
                                        key={key}
                                        data-cellkey={key}
                                        onPointerDown={(e) => {
                                            if (!isLoggedIn) return;
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                            handleCellPointerDown(key);
                                        }}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={(e) => {
                                            e.currentTarget.releasePointerCapture(e.pointerId);
                                            handleCellPointerUp();
                                        }}
                                        onDragStart={(e) => e.preventDefault()}
                                        onContextMenu={(e) => e.preventDefault()}
                                        style={{ touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
                                        className={`
                                            h-6 border-l border-gray-800/60
                                            ${isHour ? "border-t border-gray-600/50" : "border-t border-gray-800/20"}
                                            ${!isLoggedIn ? "bg-gray-800/20 cursor-not-allowed" 
                                              : selected ? "bg-blue-500 border-blue-400" 
                                              : "bg-[#0d1117] hover:bg-gray-700/50 cursor-pointer"}
                                        `}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
              </div>
            </div>
          </section>

          {/* ===== 오른쪽: 로그인 / 세션 선택 ===== */}
          <section>
            {!isLoggedIn ? (
              <>
                <h3 className="text-lg font-semibold mb-6 text-center text-[#f0f6fc]">
                  아이디
                </h3>

                <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                        <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-400">
                      예약자 이름
                    </span>
                  </div>

                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && userName.trim()) {
                        e.preventDefault();
                        setIsLoggedIn(true);
                        }
                    }}
                    placeholder="이름"
                    className="w-full p-3 rounded-xl border border-[#30363d]
                               bg-[#0d1117] text-[#f0f6fc]
                               focus:ring-2 focus:ring-[#58a6ff] outline-none"
                  />

                  <button
                    onClick={() => {
                        if (userName.trim()) setIsLoggedIn(true);
                    }}
                    disabled={!userName.trim()}
                    className={`
                        w-full py-2.5 rounded-xl font-bold
                        transition flex justify-center items-center gap-2
                        shadow-lg shadow-blue-900/20
                        ${
                        !userName.trim()
                            ? "bg-blue-900/50 text-blue-200/50 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }
                    `}
                    >
                    로그인
                    </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-6 text-center text-[#f0f6fc]">
                    세션 선택
                </h3>

                <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-6 space-y-4">
                    
                    {/* 세션 버튼 목록 */}
                    <div className="flex flex-wrap gap-2">
                        {sessions.map(session => {
                            const selected = selectedSessions.has(session);

                            return (
                                <button
                                    key={session}
                                    onClick={() => toggleSession(session)}
                                    className={`
                                        flex items-center gap-2
                                        px-5 py-2
                                        rounded-full
                                        text-sm font-bold
                                        transition
                                        border
                                        ${
                                            selected
                                            ? "bg-[#1f6feb] text-white border-[#1f6feb]"
                                            : "bg-[#0d1117] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d]"
                                        }
                                    `}
                                >
                                    {session}
                                </button>
                            );
                        })}

                        {/* + 버튼 */}
                        {isLoggedIn && (
                            <button
                                onClick={() => setIsAddingSession(true)}
                                className="px-4 py-2 rounded-xl font-bold border border-dashed border-[#30363d]
                                            text-[#58a6ff] hover:bg-[#30363d] transition"
                            >
                            + 
                            </button>
                        )}
                    </div>

                    {/* 새 세션 입력 */}
                    {isAddingSession && (
                        <div
                            ref={addSessionRef}
                            className="
                                mt-3
                                w-full
                                flex items-center gap-2
                                bg-[#0d1117]
                                border border-[#30363d]
                                rounded-xl
                                px-3 py-2
                                overflow-hidden
                            "
                        >
                            <input
                                autoFocus
                                value={newSessionName}
                                onChange={(e) => setNewSessionName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddSession();
                                    }
                                }}
                                placeholder="세션 입력"
                                className="
                                    min-w-0
                                    flex-1
                                    bg-transparent
                                    outline-none
                                    text-sm
                                    text-[#f0f6fc]
                                    placeholder-[#8b949e]
                                    truncate
                                "
                            />
                            <button
                                onClick={handleAddSession}
                                className="
                                    shrink-0
                                    px-4 py-1.5
                                    rounded-lg
                                    bg-blue-600
                                    hover:bg-blue-500
                                    text-white
                                    text-sm font-bold
                                    transition
                                "
                            >
                            추가
                            </button>
                        </div>
                    )}
                </div>
              </>
            )}
          </section>
        </div>

        {/* ===== 하단 확정 버튼 ===== */}
        <div className="mt-12 flex justify-end">
          <button
            disabled={
                !isLoggedIn ||
                selectedSessions.size === 0 ||
                selectedCells.size === 0
            }
            className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold
                transition shadow-lg shadow-blue-900/20
                ${
                !isLoggedIn || selectedSessions.size === 0 || selectedCells.size === 0
                    ? "bg-blue-900/50 text-blue-200/50 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }
            `}
            >
            <Check className="w-5 h-5" />
            확정
            </button>
        </div>
      </main>
    </div>
  );
}
