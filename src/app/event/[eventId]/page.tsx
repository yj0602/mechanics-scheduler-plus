// app/event/[eventId]/page.tsx

import EnsembleInfoSection from "@/components/ensemble/EnsembleInfoSection";
import ConcertInfoSection from "@/components/concert/concertInfoSection";
import BackToMainButton from "@/components/common/BackToMainButton";
import { notFound } from "next/navigation";
import { mockEvents, mockParticipants, mockComments, mockConcert, mockConcertDetails } from "@/mocks/events_mock";

export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params; // ✅ 핵심
  // 공연과 합주를 구분
    const ensemble = mockEvents.find((e) => e.id === eventId);
    const concert = mockConcert.find((c) => c.id === eventId);
    
    const concertDetail = mockConcertDetails.find(
      (d) => d.concert.id === eventId
    );
        if (!ensemble && !concert) notFound();

    const participants = mockParticipants.filter((p) => p.event_id === eventId);
    const comments = mockComments.filter((c) => c.event_id === eventId);

return (
  <main className="mx-auto max-w-3xl p-6">
    {ensemble ? (
      <EnsembleInfoSection
        ensemble={ensemble}
        participants={participants}
      />
    ) : (
      <ConcertInfoSection 
        concert={concertDetail!.concert}
        setList={concertDetail!.setList}
        memo={concertDetail!.memo} />
    )}
    <BackToMainButton />
  </main>
);
}

export function generateStaticParams() {
  return [
    ...mockEvents.map((e) => ({ eventId: e.id })),
    ...mockConcertDetails.map((d) => ({ eventId: d.concert.id })),
  ];
}
