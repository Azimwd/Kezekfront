import { Search, SlidersHorizontal } from "lucide-react";
import NewBusiness from "../../../molecules/Crm/Businesses/NewBusiness";

interface BusinessHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  cities: { id: string; name: string }[];
  status: string;
  onStatusChange: (value: string) => void;
}
export default function BusinessHeader({
  search,
  onSearchChange,
  city,
  onCityChange,
  cities,
  status,
  onStatusChange,
}: BusinessHeaderProps) {
  return (
    <div className="flex w-full min-w-0 flex-wrap items-center gap-2.5 xl:w-auto xl:flex-1 xl:justify-end">
      <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#ecedf5] bg-white px-3 focus-within:border-[#b5aaf7] focus-within:ring-2 focus-within:ring-indigo-100 sm:min-w-[180px] xl:max-w-[220px]">
        <Search
          size={17}
          className="shrink-0 text-[#939bb1]"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Поиск бизнеса"
          placeholder="Название или адрес"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-sm text-[#202840] outline-none placeholder:text-[#a1a7b8]"
        />
      </label>
      <div className="flex w-full min-w-0 items-center gap-1 rounded-xl border border-[#ecedf5] bg-white/40 px-2 sm:w-auto">
        <SlidersHorizontal
          size={16}
          className="shrink-0 text-[#939bb1]"
          aria-hidden="true"
        />
        <select
          aria-label="Город бизнеса"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="h-11 min-w-0 flex-1 cursor-pointer rounded-lg bg-transparent px-1 text-xs text-[#586681] focus-visible:outline-2 focus-visible:outline-indigo-400 sm:max-w-[145px] sm:text-sm"
        >
          <option value="">Все города</option>
          {cities.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <span className="h-4 w-px bg-[#e5e6ef]" aria-hidden="true" />
        <select
          aria-label="Статус бизнеса"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-11 min-w-0 flex-1 cursor-pointer rounded-lg bg-transparent px-1 text-xs text-[#586681] focus-visible:outline-2 focus-visible:outline-indigo-400 sm:max-w-[160px] sm:text-sm"
        >
          <option value="">Все статусы</option>
          <option value="active">Активные</option>
          <option value="draft">Черновики</option>
          <option value="blocked">Заблокированные</option>
        </select>
      </div>
      <div className="w-full sm:w-auto">
        <NewBusiness showHelpLink={false} />
      </div>
    </div>
  );
}
