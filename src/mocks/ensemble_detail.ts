import type { Ensemble, Participant, Comment } from "@/types/ensemble_detail";

export const mockEvent: Ensemble = {
  id: "evt_123",
  title: "2월 첫째주 합주",
  date: "2026-02-04",
  start_time: "18:00",
  end_time: "20:00",
  location: "동아리방 412호",
  rating: 4,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockParticipants: Participant[] = [
  { id: "u1", eventId: "evt_123", name: "재훈", instrument: "Bass" },
  { id: "u2", eventId: "evt_123", name: "민지", instrument: "Vocal" },
  { id: "u3", eventId: "evt_123", name: "서준", instrument: "Guitar" },
];

export const mockComments: Comment[] = [
  {
    id: "c1",
    eventId: "evt_123",
    //authorId: "u2",
    //authorName: "민지",
    content: "1절 템포는 조금 더 빠르게 가자",
    createdAt: new Date().toISOString(),
  },
];
