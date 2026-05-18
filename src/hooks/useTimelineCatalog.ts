import { useMemo } from "react";

import {
  compileTimelineCatalog,
  STATIC_TIMELINE_CATALOG,
} from "@/lib/catalog/timelineCatalog";
import { useCustomSetCatalogStore } from "@/stores/customSetCatalog.store";

export function useTimelineCatalog() {
  const customSets = useCustomSetCatalogStore((state) => state.normalizedSets);

  return useMemo(() => {
    if (customSets.length === 0) {
      return STATIC_TIMELINE_CATALOG;
    }

    return compileTimelineCatalog([...STATIC_TIMELINE_CATALOG.sets, ...customSets]);
  }, [customSets]);
}
