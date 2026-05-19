import { useParams } from "@tanstack/react-router";

import { APP_ROUTE_PATHS } from "@/app/routePaths";
import { SetBuilderPage } from "@/features/set-builder";
import { THEME } from "@/lib/ui/theme";

type SetBuilderViewProps = {
  editingSetId: string | null;
};

export function SetBuilderView({ editingSetId }: SetBuilderViewProps) {
  return (
    <div
      className="absolute inset-0 h-full w-full overflow-hidden backdrop-blur-2xl transition-[transform,opacity] duration-300 ease-out will-change-[transform,opacity]"
      style={{
        background: `linear-gradient(180deg, ${THEME.color.glass.setsFrom} 0%, ${THEME.color.glass.setsTo} 100%)`,
      }}
    >
      <SetBuilderPage editingSetId={editingSetId} />
    </div>
  );
}

export function CreateSetBuilderRoute() {
  return <SetBuilderView editingSetId={null} />;
}

export function EditSetBuilderRoute() {
  const { setId } = useParams({ from: APP_ROUTE_PATHS.editSet });

  return <SetBuilderView editingSetId={setId} />;
}
