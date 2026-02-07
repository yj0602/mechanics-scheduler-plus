// app/event/[eventId]/page.tsx

import EnsembleInfoSection from "@/components/ensemble/EnsembleInfoSection";
import ConcertInfoSection from "@/components/concert/concertInfoSection";
import BackToMainButton from "@/components/common/BackToMainButton";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/utils/supabase-server";
import type { Concert, SetListItem } from "@/types/concert_detail";
import type { Ensemble, Participant } from "@/types/ensemble_detail";

type ConcertRow = {
  id: string;
  title: string;
  date: string;
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  rehearsal_start_time: string | null;
  rehearsal_end_time: string | null;
  location: string | null;
  set_list: SetListItem[] | null;
  created_at: string;
  updated_at: string;
};

type SetListItemRow = {
  id: string;
  concert_id: string;
  order: number;
  title: string;
  note: string | null;
  created_at: string;
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  /**
   * 1) 합주 조회 (❗현재는 DB 미구현 → null 고정)
   * 나중에 ensemble 테이블 붙일 자리
   */
  const ensemble: Ensemble | null = null;
  const participants: Participant[] = []; // 나중에 타입 확정되면 교체

  // 2) 공연(DB) 조회
  const { data: concert } = await supabaseServer
    .from("concerts")
    .select("*")
    .eq("id", eventId)
    .maybeSingle<ConcertRow>();

  // 3) 공연 detail (setList + memo) 조회 (없어도 정상)
    let concertDetail: {
      concert: Concert;
      setList: SetListItem[];
      memo: string;
    } | null = null;

    if (concert) {
      const [{ data: setList }, { data: memoRow }] = await Promise.all([
        supabaseServer
          .from("set_list_items")
          .select("*")
          .eq("concert_id", eventId)
          .order("order", { ascending: true })
          .returns<SetListItemRow[]>(),
        supabaseServer
          .from("concert_memos")
          .select("memo")
          .eq("concert_id", eventId)
          .maybeSingle<{ memo: string | null }>(),
      ]);

  if(concert === null) {
      // Supabase 에러 확인이 필요할 수 있으므로 쿼리 부분에서 error도 같이 받아서 찍어보는 게 좋습니다.
      /* const { data: concert, error } = await supabaseServer... 
      console.log("Supabase Error:", error);
      */
  }

  // 4) 둘 다 없으면 404
  if (!ensemble && !concert) {
    console.log(">> Triggering 404 Not Found");
    notFound();
  }

  // 5) ConcertInfoSection에 넘길 형태
  concertDetail = {
      concert: {
        id: concert.id,
        title: concert.title,
        date: concert.date,
        start_time: concert.start_time.slice(0, 5),
        end_time: concert.end_time.slice(0, 5),
        rehearsal_start_time: concert.rehearsal_start_time?.slice(0, 5),
        rehearsal_end_time: concert.rehearsal_end_time?.slice(0, 5),
        location: concert.location ?? undefined,
        set_list: concert.set_list || undefined, // ✅ DB의 set_list 그대로 사용
        created_at: concert.created_at,
        updated_at: concert.updated_at,
      } satisfies Concert,

      setList: concert.set_list ?? [], // ✅ set_list 직접 전달
      memo: memoRow?.memo ?? "",
    };
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      {ensemble ? (
        <EnsembleInfoSection ensemble={ensemble} participants={participants} />
      ) : (
        <ConcertInfoSection
          concert={concertDetail!.concert}
          setList={concertDetail!.setList}
          memo={concertDetail!.memo}
        />
      )}
      <BackToMainButton />
    </main>
  );
}

// (선택) 동적 라우트 허용: generateStaticParams에 없는 경로도 접근 가능하게
export const dynamicParams = true;
