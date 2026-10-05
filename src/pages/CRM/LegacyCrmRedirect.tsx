import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { appointmentById } from "../../api/appointments";
import { getStaffById } from "../../api/staff";
import { useBusiness } from "../../context/BusinessContext";
import { BUSINESS_LIST_PATH, businessPath } from "../../utils/crmPaths";
import {
  BusinessLoading,
  BusinessLoadError,
  CrmEntry,
} from "./BusinessWorkspace";

export default function LegacyCrmRedirect() {
  const location = useLocation();
  const section = location.pathname.replace(/^\/crm\/?/, "");
  const resource = /^(staff|appointments)\/(?:edit\/)?(\d+)\/?$/.exec(section);
  const { businesses, isBusinessesPending, businessesError } = useBusiness();
  const query = useQuery({
    queryKey: ["legacy-crm-resource", resource?.[1], resource?.[2]],
    queryFn: async () =>
      resource?.[1] === "staff"
        ? getStaffById(Number(resource[2]))
        : appointmentById(Number(resource?.[2])),
    enabled: !!resource && !isBusinessesPending && !businessesError,
    retry: false,
    gcTime: 0,
  });
  if (isBusinessesPending) return <BusinessLoading />;
  if (businessesError) return <BusinessLoadError />;
  if (resource) {
    if (query.isPending) return <BusinessLoading />;
    const data = query.data?.data ?? query.data;
    const business = businesses.find(
      (item) => item.id === Number(data?.business),
    );
    return (
      <Navigate
        replace
        to={
          business
            ? `${businessPath(business.id, `${resource[1]}/edit/${resource[2]}`)}${location.search}${location.hash}`
            : BUSINESS_LIST_PATH
        }
      />
    );
  }
  if (
    !/^(dashboard|analytics|appointments|staff|services|schedule|settings|reviews)(\/|$)/.test(
      section,
    )
  )
    return <Navigate to={BUSINESS_LIST_PATH} replace />;
  return <CrmEntry legacySection={section} />;
}
