// src/mocks/events_mock.ts
import type { Ensemble, Participant, Comment } from "@/types/ensemble_detail";
import type { Concert, ConcertDetail } from "@/types/concert_detail";

export const mockEvents: Ensemble[] = [
  {
    id: "evt_001",
    title: "정기 합주",
    date: "2026-02-04",
    start_time: "18:00",
    end_time: "20:00",
    location: "동아리방 412호",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "evt_002",
    title: "정기 합주",
    date: "2026-02-06",
    start_time: "19:00",
    end_time: "21:00",
    location: "동아리방 412호",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "evt_003",
    title: "정기 합주",
    date: "2026-02-09",
    start_time: "18:30",
    end_time: "20:30",
    location: "동아리방 401호",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "evt_004",
    title: "정기 합주",
    date: "2026-02-11",
    start_time: "17:00",
    end_time: "19:00",
    location: "동아리방 412호",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "evt_005",
    title: "정기 합주",
    date: "2026-02-14",
    start_time: "16:00",
    end_time: "19:00",
    location: "동아리방 412호",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "evt_006",
    title: "정기 합주",
    date: "2026-02-18",
    start_time: "18:00",
    end_time: "21:00",
    location: "동아리방 401호",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockParticipants: Participant[] = [ 
    { id: "u1",event_id: "evt_001", name: "재훈", instrument: "Bass" }, 
    { id: "u2", event_id: "evt_002", name: "민지", instrument: "Vocal" }, 
    { id: "u3", event_id: "evt_003", name: "서준", instrument: "Guitar" }, 
]; 
export const mockComments: Comment[] = [
    { id: "c1", event_id: "evt_001", content: "튜닝 해라", created_at: new Date().toISOString(), },
];

export const mockConcert: Concert[] = [
  {
    id: "concert_001",
    title: "정기 공연",

    date: "2026-02-12",
    start_time: "18:00",
    end_time: "21:00",

    rehearsal_start_time: "13:00",
    rehearsal_end_time: "17:00",

    location: "The Vinyl Underground",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockConcertDetails: ConcertDetail[] = [
  {
    concert: mockConcert[0],
    teams: [],
    setList: [
      { id: "sl_001", order: 1, title: "Opening" },
      { id: "sl_002", order: 2, title: "Smells Like Teen Spirit", note: "Drop D 튜닝" },
      { id: "sl_003", order: 3, title: "Yellow" },
    ],
    memo: "뒷풀이 장소: 느그집",
  },
];