import {
  ensureWorldLandLoaded,
  getWorldLandPath2D,
} from "../MapPreview.utils";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
  type WheelEvent,
} from "react";

import {
  FRAME_PATH,
  MAP_HEIGHT,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAP_WIDTH,
} from "../MapPreview.const";
import { clamp, scheduleMapIdleTask } from "../MapPreview.utils";
import type {
  HoveredMapFeature,
  MapViewport,
  RenderedMapSlice,
} from "../MapPreview.types";

const HOVER_SETTLE_MS = 70;
const TAP_SLOP_PX = 8;

type ActiveMapPointer = {
  clientX: number;
  clientY: number;
  pointerType: string;
  startClientX: number;
  startClientY: number;
};

type MapGestureState =
  | {
      mode: "pan";
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startViewport: MapViewport;
    }
  | {
      firstPointerId: number;
      mode: "pinch";
      secondPointerId: number;
      startDistance: number;
      startMidpointX: number;
      startMidpointY: number;
      startViewport: MapViewport;
    };

function clampMapViewport(viewport: MapViewport) {
  const zoom = clamp(viewport.zoom, MAP_MIN_ZOOM, MAP_MAX_ZOOM);
  const minOffsetX = MAP_WIDTH * (1 - zoom);
  const minOffsetY = MAP_HEIGHT * (1 - zoom);

  return {
    offsetX: clamp(viewport.offsetX, minOffsetX, 0),
    offsetY: clamp(viewport.offsetY, minOffsetY, 0),
    zoom,
  };
}

export const MapPreviewCanvas = memo(function MapPreviewCanvas({
  height,
  hoveredFeatureLabel,
  onHoverFeature,
  slice,
  width,
}: {
  height: number;
  hoveredFeatureLabel: string | null;
  onHoverFeature: (feature: HoveredMapFeature | null) => void;
  slice: RenderedMapSlice | null;
  width: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawFrameRef = useRef(0);
  const hoverSettleTimeoutRef = useRef<number | null>(null);
  const pendingHoverFeatureRef = useRef<HoveredMapFeature | null>(null);
  const touchTooltipPinnedRef = useRef(false);
  const lastTouchInteractionAtRef = useRef(0);
  const idleCancelRef = useRef<(() => void) | null>(null);
  const activePointersRef = useRef(new Map<number, ActiveMapPointer>());
  const gestureStateRef = useRef<MapGestureState | null>(null);
  const pathCacheRef = useRef<{
    paths: Array<{
      feature: RenderedMapSlice["features"][number];
      path: Path2D;
    }>;
    sliceId: string;
  } | null>(null);
  const viewportRef = useRef<MapViewport>({
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
  });
  const latestDrawStateRef = useRef({
    height,
    hoveredFeatureLabel,
    slice,
    width,
  });

  latestDrawStateRef.current = {
    height,
    hoveredFeatureLabel,
    slice,
    width,
  };

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const {
      height: currentHeight,
      hoveredFeatureLabel: currentHoveredFeatureLabel,
      slice: currentSlice,
      width: currentWidth,
    } = latestDrawStateRef.current;
    const viewport = viewportRef.current;
    const pixelRatio = window.devicePixelRatio || 1;
    const targetWidth = Math.max(1, Math.round(currentWidth * pixelRatio));
    const targetHeight = Math.max(1, Math.round(currentHeight * pixelRatio));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const scaleX = currentWidth / MAP_WIDTH;
    const scaleY = currentHeight / MAP_HEIGHT;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, currentWidth, currentHeight);

    context.fillStyle = "rgba(98, 137, 154, 0.08)";
    context.fillRect(0, 0, currentWidth, currentHeight);

    context.save();
    context.scale(scaleX, scaleY);
    context.translate(viewport.offsetX, viewport.offsetY);
    context.scale(viewport.zoom, viewport.zoom);

    context.save();
    context.strokeStyle = "rgba(100, 116, 139, 0.28)";
    context.globalAlpha = 0.28;
    context.lineWidth = 1;
    context.stroke(new Path2D(FRAME_PATH));
    context.restore();

    if (currentSlice) {
      let cachedPaths = pathCacheRef.current;
      const isHistorical = currentSlice.id.startsWith("historical:");

      if (cachedPaths?.sliceId !== currentSlice.id) {
        const sourcePaths = currentSlice.features
          .filter(
            (feature) => !isHistorical || feature.label !== "Historical region",
          )
          .map((feature) => ({
            feature,
            path: new Path2D(feature.d),
          }));

        cachedPaths = {
          sliceId: currentSlice.id,
          paths: sourcePaths,
        };
        pathCacheRef.current = cachedPaths;
      }

      if (isHistorical) {
        // Draw Natural Earth land as base underlay
        context.save();
        context.fillStyle = "rgba(158, 148, 128, 0.72)";
        context.globalAlpha = 1;
        context.fill(getWorldLandPath2D() ?? new Path2D());
        context.restore();
      }

      for (const { feature, path } of cachedPaths.paths) {
        const isHovered =
          feature.hoverable && currentHoveredFeatureLabel === feature.label;

        context.save();
        context.fillStyle = feature.color;
        context.globalAlpha = feature.opacity;
        context.fill(path, "evenodd");
        context.restore();

        if (isHovered) {
          context.save();
          context.fillStyle = "rgba(255, 255, 255, 0.28)";
          context.globalCompositeOperation = "source-atop";
          context.fill(path, "evenodd");
          context.restore();
        }

        context.save();
        context.strokeStyle = "rgba(15, 23, 42, 0.38)";
        context.globalAlpha = feature.strokeOpacity;
        context.lineWidth = 0.32;
        context.stroke(path);
        context.restore();
      }
    }

    context.restore();
  }, []);

  const scheduleDrawMap = useCallback(
    (defer = false) => {
      if (drawFrameRef.current) {
        return;
      }

      if (idleCancelRef.current) {
        idleCancelRef.current();
        idleCancelRef.current = null;
      }

      const requestDrawFrame = () => {
        drawFrameRef.current = window.requestAnimationFrame(() => {
          drawFrameRef.current = 0;
          drawMap();
        });
      };

      if (defer) {
        idleCancelRef.current = scheduleMapIdleTask(() => {
          idleCancelRef.current = null;
          requestDrawFrame();
        });
        return;
      }

      requestDrawFrame();
    },
    [drawMap],
  );

  useEffect(() => {
    scheduleDrawMap(true);
  }, [height, hoveredFeatureLabel, scheduleDrawMap, slice, width]);

  useEffect(() => {
    ensureWorldLandLoaded(() => scheduleDrawMap(true));
  }, [scheduleDrawMap]);

  useEffect(() => {
    return () => {
      if (idleCancelRef.current) {
        idleCancelRef.current();
        idleCancelRef.current = null;
      }

      if (drawFrameRef.current) {
        window.cancelAnimationFrame(drawFrameRef.current);
      }

      if (hoverSettleTimeoutRef.current !== null) {
        window.clearTimeout(hoverSettleTimeoutRef.current);
      }
    };
  }, []);

  const getMapPointForEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = width / MAP_WIDTH;
    const scaleY = height / MAP_HEIGHT;
    const viewport = viewportRef.current;
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const x = (canvasX / scaleX - viewport.offsetX) / viewport.zoom;
    const y = (canvasY / scaleY - viewport.offsetY) / viewport.zoom;

    return {
      canvasX,
      canvasY,
      x,
      y,
    };
  };
  const getMapPointForClientPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = width / MAP_WIDTH;
    const scaleY = height / MAP_HEIGHT;

    return {
      x: (clientX - rect.left) / scaleX,
      y: (clientY - rect.top) / scaleY,
    };
  };
  const getTwoTouchPointers = () => {
    const touchPointers = [...activePointersRef.current.entries()].filter(
      ([, pointer]) => pointer.pointerType === "touch",
    );

    if (touchPointers.length < 2) {
      return null;
    }

    return [touchPointers[0], touchPointers[1]] as const;
  };
  const getPointerDistance = (
    firstPointer: ActiveMapPointer,
    secondPointer: ActiveMapPointer,
  ) =>
    Math.hypot(
      secondPointer.clientX - firstPointer.clientX,
      secondPointer.clientY - firstPointer.clientY,
    );
  const getPointerMidpoint = (
    firstPointer: ActiveMapPointer,
    secondPointer: ActiveMapPointer,
  ) => ({
    clientX: (firstPointer.clientX + secondPointer.clientX) / 2,
    clientY: (firstPointer.clientY + secondPointer.clientY) / 2,
  });
  const beginPinchGesture = () => {
    const touchPointers = getTwoTouchPointers();

    if (!touchPointers) {
      return false;
    }

    const [[firstPointerId, firstPointer], [secondPointerId, secondPointer]] =
      touchPointers;
    const midpoint = getPointerMidpoint(firstPointer, secondPointer);
    const mapMidpoint = getMapPointForClientPoint(
      midpoint.clientX,
      midpoint.clientY,
    );

    if (!mapMidpoint) {
      return false;
    }

    gestureStateRef.current = {
      firstPointerId,
      mode: "pinch",
      secondPointerId,
      startDistance: Math.max(1, getPointerDistance(firstPointer, secondPointer)),
      startMidpointX: mapMidpoint.x,
      startMidpointY: mapMidpoint.y,
      startViewport: viewportRef.current,
    };
    scheduleHoverFeature(null);
    return true;
  };
  const beginPanGesture = (
    pointerId: number,
    pointer: ActiveMapPointer,
  ) => {
    gestureStateRef.current = {
      mode: "pan",
      pointerId,
      startClientX: pointer.clientX,
      startClientY: pointer.clientY,
      startViewport: viewportRef.current,
    };
  };
  const commitHoverFeature = (feature: HoveredMapFeature | null) => {
    latestDrawStateRef.current = {
      ...latestDrawStateRef.current,
      hoveredFeatureLabel: feature?.label ?? null,
    };
    onHoverFeature(feature);
    scheduleDrawMap();
  };
  const clearHoverFeature = () => {
    touchTooltipPinnedRef.current = false;
    clearPendingHoverFeature();
    commitHoverFeature(null);
  };
  const pinTouchHoverFeature = (feature: HoveredMapFeature | null) => {
    touchTooltipPinnedRef.current = Boolean(feature);
    clearPendingHoverFeature();
    commitHoverFeature(feature);
  };
  const clearPendingHoverFeature = () => {
    pendingHoverFeatureRef.current = null;

    if (hoverSettleTimeoutRef.current !== null) {
      window.clearTimeout(hoverSettleTimeoutRef.current);
      hoverSettleTimeoutRef.current = null;
    }
  };
  const scheduleHoverFeature = (feature: HoveredMapFeature | null) => {
    if (!feature) {
      clearHoverFeature();
      return;
    }

    touchTooltipPinnedRef.current = false;

    if (latestDrawStateRef.current.hoveredFeatureLabel === feature.label) {
      clearPendingHoverFeature();
      commitHoverFeature(feature);
      return;
    }

    pendingHoverFeatureRef.current = feature;

    if (hoverSettleTimeoutRef.current !== null) {
      return;
    }

    hoverSettleTimeoutRef.current = window.setTimeout(() => {
      hoverSettleTimeoutRef.current = null;
      commitHoverFeature(pendingHoverFeatureRef.current);
      pendingHoverFeatureRef.current = null;
    }, HOVER_SETTLE_MS);
  };
  const updateHoverFeature = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const mapPoint = getMapPointForEvent(event);
    const cachedPaths = pathCacheRef.current;

    if (!context || !mapPoint || !cachedPaths) {
      scheduleHoverFeature(null);
      return;
    }

    for (let index = cachedPaths.paths.length - 1; index >= 0; index -= 1) {
      const { feature, path } = cachedPaths.paths[index];

      if (!feature.hoverable) {
        continue;
      }

      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      const isHit = context.isPointInPath(
        path,
        mapPoint.x,
        mapPoint.y,
        "evenodd",
      );
      context.restore();

      if (isHit) {
        scheduleHoverFeature({
          details: feature.details,
          label: feature.label,
          x: mapPoint.canvasX,
          y: mapPoint.canvasY,
        });
        return;
      }
    }

    scheduleHoverFeature(null);
  };
  const updateTapFeature = (
    clientX: number,
    clientY: number,
    options: { immediate?: boolean } = {},
  ) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const rawMapPoint = getMapPointForClientPoint(clientX, clientY);
    const cachedPaths = pathCacheRef.current;

    if (!context || !rawMapPoint || !cachedPaths) {
      if (options.immediate) {
        pinTouchHoverFeature(null);
      } else {
        scheduleHoverFeature(null);
      }
      return;
    }

    const viewport = viewportRef.current;
    const mapPoint = {
      canvasX: rawMapPoint.x * (width / MAP_WIDTH),
      canvasY: rawMapPoint.y * (height / MAP_HEIGHT),
      x: (rawMapPoint.x - viewport.offsetX) / viewport.zoom,
      y: (rawMapPoint.y - viewport.offsetY) / viewport.zoom,
    };

    for (let index = cachedPaths.paths.length - 1; index >= 0; index -= 1) {
      const { feature, path } = cachedPaths.paths[index];

      if (!feature.hoverable) {
        continue;
      }

      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      const isHit = context.isPointInPath(
        path,
        mapPoint.x,
        mapPoint.y,
        "evenodd",
      );
      context.restore();

      if (isHit) {
        const hoverFeature = {
          details: feature.details,
          label: feature.label,
          x: mapPoint.canvasX,
          y: mapPoint.canvasY,
        };

        if (options.immediate) {
          pinTouchHoverFeature(hoverFeature);
          return;
        }

        scheduleHoverFeature(hoverFeature);
        return;
      }
    }

    if (options.immediate) {
      pinTouchHoverFeature(null);
      return;
    }

    scheduleHoverFeature(null);
  };
  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointer = {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerType: event.pointerType,
      startClientX: event.clientX,
      startClientY: event.clientY,
    };

    activePointersRef.current.set(event.pointerId, pointer);

    if (event.pointerType === "touch") {
      lastTouchInteractionAtRef.current = Date.now();

      if (beginPinchGesture()) {
        return;
      }

      beginPanGesture(event.pointerId, pointer);
      return;
    }

    beginPanGesture(event.pointerId, pointer);
  };
  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const currentPointer = activePointersRef.current.get(event.pointerId);

    if (currentPointer) {
      activePointersRef.current.set(event.pointerId, {
        clientX: event.clientX,
        clientY: event.clientY,
        pointerType: currentPointer.pointerType,
        startClientX: currentPointer.startClientX,
        startClientY: currentPointer.startClientY,
      });
    }

    const gestureState = gestureStateRef.current;

    if (gestureState?.mode === "pinch") {
      const firstPointer = activePointersRef.current.get(
        gestureState.firstPointerId,
      );
      const secondPointer = activePointersRef.current.get(
        gestureState.secondPointerId,
      );

      if (!firstPointer || !secondPointer) {
        return;
      }

      const midpoint = getPointerMidpoint(firstPointer, secondPointer);
      const mapMidpoint = getMapPointForClientPoint(
        midpoint.clientX,
        midpoint.clientY,
      );

      if (!mapMidpoint) {
        return;
      }

      const nextZoom = clamp(
        gestureState.startViewport.zoom *
          (getPointerDistance(firstPointer, secondPointer) /
            gestureState.startDistance),
        MAP_MIN_ZOOM,
        MAP_MAX_ZOOM,
      );
      const worldX =
        (gestureState.startMidpointX - gestureState.startViewport.offsetX) /
        gestureState.startViewport.zoom;
      const worldY =
        (gestureState.startMidpointY - gestureState.startViewport.offsetY) /
        gestureState.startViewport.zoom;

      viewportRef.current = clampMapViewport({
        offsetX: mapMidpoint.x - worldX * nextZoom,
        offsetY: mapMidpoint.y - worldY * nextZoom,
        zoom: nextZoom,
      });
      scheduleHoverFeature(null);
      scheduleDrawMap();
      return;
    }

    if (gestureState?.mode === "pan" && gestureState.pointerId === event.pointerId) {
      const scaleX = width / MAP_WIDTH;
      const scaleY = height / MAP_HEIGHT;

      viewportRef.current = clampMapViewport({
        ...viewportRef.current,
        offsetX:
          gestureState.startViewport.offsetX +
          (event.clientX - gestureState.startClientX) / scaleX,
        offsetY:
          gestureState.startViewport.offsetY +
          (event.clientY - gestureState.startClientY) / scaleY,
      });
      if (currentPointer?.pointerType === "touch") {
        if (
          Math.hypot(
            event.clientX - currentPointer.startClientX,
            event.clientY - currentPointer.startClientY,
          ) > TAP_SLOP_PX
        ) {
          clearHoverFeature();
        }
      }
      scheduleDrawMap();
      return;
    }

    if (event.pointerType !== "touch") {
      updateHoverFeature(event);
    }
    scheduleDrawMap();
  };
  const handlePointerEnd = (event: PointerEvent<HTMLCanvasElement>) => {
    const endedPointer = activePointersRef.current.get(event.pointerId);

    activePointersRef.current.delete(event.pointerId);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (endedPointer?.pointerType === "touch") {
      lastTouchInteractionAtRef.current = Date.now();
      const wasTap =
        gestureStateRef.current?.mode === "pan" &&
        gestureStateRef.current.pointerId === event.pointerId &&
        activePointersRef.current.size === 0 &&
        Math.hypot(
          event.clientX - endedPointer.startClientX,
          event.clientY - endedPointer.startClientY,
        ) <= TAP_SLOP_PX;

      if (wasTap) {
        gestureStateRef.current = null;
        updateTapFeature(event.clientX, event.clientY, { immediate: true });
        return;
      }

      if (beginPinchGesture()) {
        return;
      }

      const nextPointer = [...activePointersRef.current.entries()].find(
        ([, pointer]) => pointer.pointerType === "touch",
      );

      if (nextPointer) {
        beginPanGesture(nextPointer[0], nextPointer[1]);
      } else {
        gestureStateRef.current = null;
      }

      return;
    }

    if (
      gestureStateRef.current?.mode === "pan" &&
      gestureStateRef.current.pointerId === event.pointerId
    ) {
      gestureStateRef.current = null;
    }
  };
  const handleWheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = width / MAP_WIDTH;
    const scaleY = height / MAP_HEIGHT;
    const anchorX = (event.clientX - rect.left) / scaleX;
    const anchorY = (event.clientY - rect.top) / scaleY;
    const zoomMultiplier = Math.exp(-event.deltaY * 0.0016);
    const current = viewportRef.current;
    const nextZoom = clamp(
      current.zoom * zoomMultiplier,
      MAP_MIN_ZOOM,
      MAP_MAX_ZOOM,
    );
    const worldX = (anchorX - current.offsetX) / current.zoom;
    const worldY = (anchorY - current.offsetY) / current.zoom;

    viewportRef.current = clampMapViewport({
      offsetX: anchorX - worldX * nextZoom,
      offsetY: anchorY - worldY * nextZoom,
      zoom: nextZoom,
    });
    scheduleDrawMap();
  };

  return (
    <canvas
      aria-hidden="true"
      className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
      height={Math.round(height)}
      onDoubleClick={() => {
        if (Date.now() - lastTouchInteractionAtRef.current < 700) {
          return;
        }

        viewportRef.current = { offsetX: 0, offsetY: 0, zoom: 1 };
        scheduleDrawMap();
      }}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerLeave={() => {
        if (!touchTooltipPinnedRef.current) {
          scheduleHoverFeature(null);
        }
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onWheel={handleWheel}
      ref={canvasRef}
      role="img"
      width={Math.round(width)}
    />
  );
});
