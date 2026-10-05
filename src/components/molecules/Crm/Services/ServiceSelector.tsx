import { useBusiness } from "../../../../context/BusinessContext";
export default function BusinessSelect() {
  const { selectedBusiness } = useBusiness();
  return selectedBusiness ? (
    <span className="text-sm font-medium text-[#30295c]">
      {selectedBusiness.label}
    </span>
  ) : null;
}
