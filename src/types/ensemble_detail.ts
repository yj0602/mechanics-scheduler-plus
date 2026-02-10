// src/types/ensemble_detail.ts
// 합주 상세 페이지 데이터 타입

// 합주 관련 타입
export type Ensemble = {
    id: string;
    // sessionId?: string; // 합주방/세션과 연결 (나중 확장)
    room_id: string; // 조율 방 ID (추가)
    title: string;

    date: string; // "YYYY-MM-DD" 형식
    start_time: string; // 'HH:mm' 형식
    end_time: string; // 'HH:mm' 형식

    location?: string;
    description?: string; // 일정 설명(선택)
    rating?: number; // (선택) 완성도
    participants: Participant[]; // 참여자 목록 (JSONB 대응)
    created_at: string;
    updated_at: string;  
    status: 'open' | 'confirmed';
};

export type Participant = {
    // id: string; // userId
    // event_id: string;
    name: string;
    sessions: string[];  // ['보컬', '기타'] 대응
};


export type Comment = {
  id: string;
  event_id: string;
  // author_id: string;        // 가짜로그인 userId
  // author_name: string;      // 표시용
  content: string;
  created_at: string;
};