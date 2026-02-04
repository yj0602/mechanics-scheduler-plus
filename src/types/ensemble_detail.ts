// src/types/ensemble_detail.ts
// 합주 상세 페이지 데이터 타입

// 합주 관련 타입
export type Ensemble = {
    id: string;
    // sessionId?: string; // 합주방/세션과 연결 (나중 확장)
    title: string;

    date: string; // "YYYY-MM-DD" 형식
    start_time: string; // 'HH:mm' 형식
    end_time: string; // 'HH:mm' 형식

    location?: string;
    description?: string; // 일정 설명(선택)
    rating?: number; // (선택) 완성도
    created_at: string;
    updated_at: string;  
};

export type Participant = {
    id: string; // userId
    event_id: string;
    name: string;
    instrument?: string; // "Guitar", "Bass", "Drums" 등
};


export type Comment = {
  id: string;
  event_id: string;
  // author_id: string;        // 가짜로그인 userId
  // author_name: string;      // 표시용
  content: string;
  created_at: string;
};