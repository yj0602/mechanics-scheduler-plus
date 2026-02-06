import type { Participant, Comment } from "@/types/ensemble_detail"; 
export const mockParticipants: Participant[] = [ 
    { id: "u1",event_id: "evt_001", name: "재훈", instrument: "Bass" }, 
    { id: "u2", event_id: "evt_002", name: "민지", instrument: "Vocal" }, 
    { id: "u3", event_id: "evt_003", name: "서준", instrument: "Guitar" }, 
]; 
export const mockComments: Comment[] = [
    { id: "c1", event_id: "evt_001", content: "튜닝 해라", created_at: new Date().toISOString(), },
];