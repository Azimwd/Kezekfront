import { useCrmPath } from "../../../../../hooks/useCrmPath";
import { useNavigate } from "react-router-dom";
import Button from "../../../../atoms/Button";
import { ArrowLeft } from "lucide-react";
import Icon from "../../../../atoms/Icon";
import Typography from "../../../../atoms/Typography";

export default function StaffEditHeader() {
  const crmPath = useCrmPath();

  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 mb-2">
      <Button
        className="flex justify-center items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate(crmPath("staff"))}
      >
        <Icon icon={ArrowLeft} size={15} className="text-[#525252]" />
        <Typography
          text={"Назад к списку"}
          className="text-sm sm:text-base text-[#525252]"
        />
      </Button>

      <Typography
        text={"Редактировать Мастера"}
        className="text-2xl sm:text-3xl font-medium"
      />
    </div>
  );
}
