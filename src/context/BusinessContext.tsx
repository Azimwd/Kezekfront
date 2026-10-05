import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useMatch, useNavigate } from "react-router-dom";
import { listAllBusinesses, type Business } from "../api/businesses";
import type { SelectOption } from "../components/atoms/Select";
import { useUser } from "./UserContext";
import {
  BUSINESS_LIST_PATH,
  businessPath,
  readLastBusiness,
  saveLastBusiness,
} from "../utils/crmPaths";

type BusinessContextType = {
  selectedBusiness: SelectOption | null;
  setSelectedBusiness: (business: SelectOption | null) => void;
  businesses: Business[];
  currentBusiness: Business | null;
  lastBusinessId: number | null;
  isBusinessesPending: boolean;
  isBusinessesFetching: boolean;
  businessesError: unknown;
  refetchBusinesses: () => void;
};
const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined,
);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user, isLoadingUser } = useUser();
  const navigate = useNavigate();
  const match = useMatch("/crm/businesses/:businessId/*");
  const routeId = match?.params.businessId;
  const [remembered, setRemembered] = useState<{
    userId: number;
    id: number;
  } | null>(null);
  const query = useQuery({
    queryKey: ["all-businesses", user?.id],
    queryFn: listAllBusinesses,
    enabled: !!user && user.role === "business_owner",
    retry: false,
  });
  const businesses = useMemo(
    () =>
      (query.data ?? []).filter(
        (business) => Number(business.owner) === user?.id,
      ),
    [query.data, user?.id],
  );
  // A direct URL takes priority over the last business stored in this browser.
  const currentBusiness =
    !query.isError && /^\d+$/.test(routeId ?? "")
      ? (businesses.find((business) => String(business.id) === routeId) ?? null)
      : null;
  const selectedBusiness = useMemo<SelectOption | null>(
    () =>
      currentBusiness
        ? { id: String(currentBusiness.id), label: currentBusiness.name }
        : null,
    [currentBusiness],
  );
  const lastBusinessId = user
    ? remembered?.userId === user.id
      ? remembered.id
      : readLastBusiness(user.id)
    : null;
  const remember = useCallback(
    (id: number) => {
      if (!user) return;
      saveLastBusiness(user.id, id);
      setRemembered((previous) =>
        previous?.id === id && previous.userId === user.id
          ? previous
          : { userId: user.id, id },
      );
    },
    [user?.id],
  );
  useEffect(() => {
    if (currentBusiness) remember(currentBusiness.id);
  }, [currentBusiness?.id, remember]);
  const setSelectedBusiness = useCallback(
    (business: SelectOption | null) => {
      if (!business) {
        navigate(BUSINESS_LIST_PATH);
        return;
      }
      const id = Number(business.id);
      if (!Number.isSafeInteger(id) || id < 1) return;
      remember(id);
      navigate(businessPath(id));
    },
    [navigate, remember],
  );
  return (
    <BusinessContext.Provider
      value={{
        selectedBusiness,
        setSelectedBusiness,
        businesses,
        currentBusiness,
        lastBusinessId,
        isBusinessesPending: isLoadingUser || query.isPending,
        isBusinessesFetching: query.isFetching,
        businessesError: query.isError ? query.error : null,
        refetchBusinesses: () => {
          void query.refetch();
        },
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}
export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context)
    throw new Error(
      "useBusiness должен использоваться внутри BusinessProvider",
    );
  return context;
}
