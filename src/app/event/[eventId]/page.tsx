// app/event/[eventId]/page.tsx

import EnsembleInfoSection from "@/components/ensemble/EnsembleInfoSection";
import BackToMainButton from "@/components/common/BackToMainButton";
import { notFound } from "next/navigation";
import { mockEvents } from "@/mocks/events_mock";
import { mockParticipants, mockComments } from "@/mocks/ensemble_detail";

export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params; // ✅ 핵심

    const ensemble = mockEvents.find((e) => e.id === eventId);
    if (!ensemble) notFound();

    const participants = mockParticipants.filter((p) => p.event_id === eventId);
    const comments = mockComments.filter((c) => c.event_id === eventId);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <EnsembleInfoSection ensemble={ensemble} participants={participants}/>
      <BackToMainButton />
    </main>
  );
}

export function generateStaticParams() {
  return mockEvents.map((e) => ({ eventId: e.id }));
}

