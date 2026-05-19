import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";

import App from "@/app/App";
import { APP_ROUTE_PATHS } from "@/app/routePaths";

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  beforeLoad: () => {
    throw redirect({
      replace: true,
      to: APP_ROUTE_PATHS.timeline,
    });
  },
  getParentRoute: () => rootRoute,
  path: APP_ROUTE_PATHS.root,
});

const timelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTE_PATHS.timeline,
});

const setsRoute = createRoute({
  component: lazyRouteComponent(
    () => import("@/pages/AvailableSetsView/AvailableSetsView"),
    "AvailableSetsView",
  ),
  getParentRoute: () => rootRoute,
  path: APP_ROUTE_PATHS.sets,
});

const newSetRoute = createRoute({
  component: lazyRouteComponent(
    () => import("@/pages/SetBuilderView/SetBuilderView"),
    "CreateSetBuilderRoute",
  ),
  getParentRoute: () => rootRoute,
  path: APP_ROUTE_PATHS.newSet,
});

const editSetRoute = createRoute({
  component: lazyRouteComponent(
    () => import("@/pages/SetBuilderView/SetBuilderView"),
    "EditSetBuilderRoute",
  ),
  getParentRoute: () => rootRoute,
  path: APP_ROUTE_PATHS.editSet,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  timelineRoute,
  setsRoute,
  newSetRoute,
  editSetRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
