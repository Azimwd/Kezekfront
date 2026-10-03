import { useQuery } from "@tanstack/react-query";
import { categoryPath, listCategories } from "../../../../api/categories";

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}
export default function CategorySelector({ value, onChange, disabled }: Props) {
  const query = useQuery({
    queryKey: ["categories", "legacy"],
    queryFn: () => listCategories(true),
  });
  const categories = query.data?.data ?? [];
  return (
    <div>
      <label className="block text-sm text-slate-600">
        Категория услуги
        <select
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          disabled={disabled || query.isPending || query.isError}
          className="mt-1 w-full rounded-lg border border-slate-200 p-3"
        >
          <option value="">Без категории</option>
          {categories
            .filter((c) => !c.is_legacy || c.id === value)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {categoryPath(c, categories)}
                {c.is_legacy ? " (старая категория)" : ""}
              </option>
            ))}
          {value !== null &&
            query.isSuccess &&
            !categories.some((c) => c.id === value) && (
              <option value={value}>Категория #{value} (недоступна)</option>
            )}
        </select>
      </label>
      {query.isError && (
        <button
          type="button"
          onClick={() => query.refetch()}
          className="text-sm text-red-600"
        >
          Ошибка загрузки категорий. Повторить
        </button>
      )}
    </div>
  );
}
