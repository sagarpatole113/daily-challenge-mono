import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { DailyTestWithState, DayListItem } from "@shared/index";

export function useDays() {
  return useQuery({
    queryKey: ["days"],
    queryFn: () => api.get<DayListItem[]>("/days"),
  });
}

export function useTestsForDay(dayId: string | undefined) {
  return useQuery({
    queryKey: ["days", dayId, "tests"],
    queryFn: () => api.get<DailyTestWithState[]>(`/days/${dayId}/tests`),
    enabled: !!dayId,
  });
}
