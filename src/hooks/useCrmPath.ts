import { useBusiness } from "../context/BusinessContext";
import { BUSINESS_LIST_PATH, businessPath } from "../utils/crmPaths";

export function useCrmPath() {
  const { selectedBusiness } = useBusiness();
  return (section = "dashboard") =>
    selectedBusiness
      ? businessPath(selectedBusiness.id, section)
      : BUSINESS_LIST_PATH;
}
