import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCrmPath } from "../../../../hooks/useCrmPath";
export default function StaffHeader() {
  const navigate = useNavigate();
  const crmPath = useCrmPath();
  return (
    <button
      type="button"
      data-tour="create-staff"
      onClick={() => navigate(crmPath("staff/add"))}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 sm:w-auto"
    >
      <Plus size={20} />
      Добавить мастера
    </button>
  );
}
