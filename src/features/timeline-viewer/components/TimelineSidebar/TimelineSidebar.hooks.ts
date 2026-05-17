import { useEffect } from "react";

export function useTimelineSidebarEscape({
  activeView,
  isOpen,
  onClose,
}: {
  activeView: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen || activeView !== "timeline") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeView, isOpen, onClose]);
}
