import { useMemo } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import type { TimelineSetId } from "@/lib/core/timelineTypes";

export const APP_ROUTE_PATHS = {
  editSet: "/sets/$setId/edit",
  newSet: "/sets/new",
  root: "/",
  sets: "/sets",
  timeline: "/timeline",
} as const;

export type AppRouteView = "timeline" | "available-sets" | "create-set";

export function getRouteView(pathname: string): AppRouteView {
  if (pathname === APP_ROUTE_PATHS.sets) {
    return "available-sets";
  }

  if (
    pathname === APP_ROUTE_PATHS.newSet ||
    /^\/sets\/[^/]+\/edit$/.test(pathname)
  ) {
    return "create-set";
  }

  return "timeline";
}

export function useRouteView() {
  return useRouterState({
    select: (state) => getRouteView(state.location.pathname),
  });
}

export function useAppRouteNavigation() {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      openCreateSet: () => {
        void navigate({ to: APP_ROUTE_PATHS.newSet });
      },
      openEditSet: (setId: TimelineSetId) => {
        void navigate({
          params: { setId },
          to: APP_ROUTE_PATHS.editSet,
        });
      },
      openSets: () => {
        void navigate({ to: APP_ROUTE_PATHS.sets });
      },
      openTimeline: () => {
        void navigate({ to: APP_ROUTE_PATHS.timeline });
      },
    }),
    [navigate],
  );
}
