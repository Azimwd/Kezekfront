import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCrmPath } from "../../../../hooks/useCrmPath";
export default function Header() {
  const navigate = useNavigate();
  const crmPath = useCrmPath();
  return (
    <button
      type="button"
      onClick={() => navigate(crmPath("appointments/create"))}
      className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#4031d0] bg-white px-5 text-sm font-medium text-[#4031d0] hover:bg-[#F5F3FF] sm:w-auto"
    >
      <Plus size={20} />
      Создать запись
    </button>
  );
}
