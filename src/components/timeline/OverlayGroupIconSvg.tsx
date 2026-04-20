import {
  resolveOverlayGroupIconId,
  type OverlayGroupIconId,
} from "./overlayGroupIcons";

function renderIcon(iconId: OverlayGroupIconId) {
  switch (iconId) {
    case "markers":
      return (
        <>
          <circle cx="0" cy="-1.9" r="1.5" fill="currentColor" stroke="none" />
          <path d="M 0 -0.6 L 0 3.2 M -1.8 3.2 L 1.8 3.2" />
        </>
      );
    case "deep-time-life":
      return (
        <>
          <path
            d="M -0.25 0.75 Q -3.55 -0.55 -1.45 -3.15 Q 0.95 -1.55 0.55 1.35 Q 0.1 1.02 -0.25 0.75 Z"
            fill="currentColor"
            stroke="none"
          />
          <path
            d="M 1.15 1.08 Q 3.7 0.35 3.25 -1.15 Q 1.45 -1.75 0.7 0.38 Q 0.88 0.88 1.15 1.08 Z"
            fill="currentColor"
            stroke="none"
          />
          <path d="M -1.1 3.05 Q -0.35 2.55 0.1 1.45 Q 0.55 0.55 0.72 0.18 M 0.15 1.52 Q 1.45 1.1 2.5 0.28" />
        </>
      );
    case "human-evolution":
      return (
        <>
          <path d="M 0 3.1 L 0 -0.4 L -2.7 -3 M 0 -0.4 L 2.7 -3" />
          <circle cx="0" cy="3.1" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="0" cy="-0.4" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="-2.7" cy="-3" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="2.7" cy="-3" r="0.8" fill="currentColor" stroke="none" />
        </>
      );
    case "cultures":
      return (
        <path d="M -3.4 2.8 L -1.9 -2.2 L -0.5 2.8 M -1.2 2.8 L 2.2 -1.4 L 3.4 2.8 M -3.7 2.8 L 3.7 2.8" />
      );
    case "civilizations":
      return (
        <path d="M -3.3 -1.2 L 0 -3.5 L 3.3 -1.2 M -2.5 -1.2 L 2.5 -1.2 M -2.8 2.8 L 2.8 2.8 M -2.1 -0.8 L -2.1 2.4 M 0 -0.8 L 0 2.4 M 2.1 -0.8 L 2.1 2.4" />
      );
  }
}

type OverlayGroupIconSvgProps = {
  groupId?: string;
  className?: string;
};

export function OverlayGroupIconSvg({
  groupId,
  className,
}: OverlayGroupIconSvgProps) {
  const iconId = resolveOverlayGroupIconId(groupId);

  if (!iconId) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      viewBox="-5 -5 10 10"
    >
      {renderIcon(iconId)}
    </svg>
  );
}