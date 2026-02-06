import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Reservation } from "@/types";
import { formatToDbDate } from "@/utils/date";
import { mockEvents } from "@/mocks/events_mock"; 
import type { Ensemble } from "@/types/ensemble_detail";


const USE_MOCK = true;

const mockUserName = "노윤지"; // 모달에 보여줄 임시 예약자

const ensembleToReservation = (e: Ensemble): Reservation => ({
  id: e.id,
  user_name: mockUserName,
  purpose: e.title,          // UI의 '목적/예약명'에 합주 제목 넣기
  date: e.date,
  start_time: e.start_time,
  end_time: e.end_time,
  created_at: e.created_at,
});


// [Read] 특정 기간(주간/월간)의 예약 가져오기
export const useReservations = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: [
      "reservations",
      formatToDbDate(startDate),
      formatToDbDate(endDate),
    ],
    queryFn: async () => {
      if (USE_MOCK) {
        // ✅ 기간 필터링까지 해주면 화면이 자연스럽게 동작
        const start = formatToDbDate(startDate);
        const end = formatToDbDate(endDate);

        return mockEvents
          .filter((e) => e.date >= start && e.date <= end)
          .map(ensembleToReservation);
      }

      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .gte("date", formatToDbDate(startDate))
        .lte("date", formatToDbDate(endDate));

      if (error) throw error;
      return data as Reservation[];
    },
  });
};

// [Read] 모든 예약 가져오기 (특정 컴포넌트용, 필요시 사용)
// 예: "다가오는 예약" 컴포넌트에서 오늘 이후 데이터만 필요할 때
export const useUpcomingReservations = () => {
  return useQuery({
    queryKey: ["reservations", "upcoming"],
    queryFn: async () => {
      if (USE_MOCK) {
        const today = formatToDbDate(new Date());
        return mockEvents
          .filter((e) => e.date >= today)
          .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time))
          .slice(0, 20)
          .map(ensembleToReservation);
      }

      const today = formatToDbDate(new Date());
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .gte("date", today)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(20);

      if (error) throw error;
      return data as Reservation[];
    },
  });
};

// [Create] 예약 추가하기
export const useAddReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRes: Omit<Reservation, "id" | "created_at">) => {
      if (USE_MOCK) return;  // ✅ 아무것도 안 함
      const { error } = await supabase.from("reservations").insert(newRes);
      if (error) throw error;
    },
    onSuccess: () => {
      // 모든 예약 관련 쿼리를 무효화하여 최신 데이터로 자동 갱신
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      alert("예약이 완료되었습니다.");
    },
    onError: (error) => {
      console.error(error);
      alert("예약에 실패했습니다.");
    },
  });
};

// [Delete] 예약 삭제하기
export const useDeleteReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return;  // ✅ 아무것도 안 함
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      alert("예약이 취소되었습니다.");
    },
    onError: (error) => {
      console.error(error);
      alert("삭제에 실패했습니다.");
    },
  });
};

// [NEW] 리스트 뷰용: 오늘 이후의 모든 예약 가져오기
export const useAllUpcomingReservations = () => {
  return useQuery({
    queryKey: ["reservations", "all_upcoming"], // 키 분리
    queryFn: async () => {
      if (USE_MOCK) {
        const today = formatToDbDate(new Date());
        return mockEvents
          .filter((e) => e.date >= today)
          .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time))
          .map(ensembleToReservation);
      }
      const today = formatToDbDate(new Date());
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .gte("date", today) // 오늘 날짜부터
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      // .limit(100) // 필요하면 제한 해제 또는 넉넉하게 설정

      if (error) throw error;
      return data as Reservation[];
    },
  });
};
