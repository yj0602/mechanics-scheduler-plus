// src/app/concertCreate/new/page.tsx

import ConcertCreate from "@/components/ReservationConcert/ReservationConcert";
import BackToMainButton from "@/components/common/BackToMainButton";

export default function ConcertCreatePage() {
  return (
    <>
        <ConcertCreate />
        <BackToMainButton />
    </>
  );
}