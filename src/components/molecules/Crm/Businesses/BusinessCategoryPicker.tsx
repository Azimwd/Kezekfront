import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCategories, type Category } from "../../../../api/categories";

interface Props {
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}
export default function BusinessCategoryPicker({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });
  const categories = query.data?.data ?? [];
  const roots = categories.filter((c) => c.parent === null);
  const word = search.trim().toLocaleLowerCase("ru");
  const descendants = (id: number): number[] => {
    const result = new Set<number>();
    const queue = [id];
    while (queue.length) {
      const parent = queue.pop();
      categories
        .filter((c) => c.parent === parent)
        .forEach((c) => {
          if (!result.has(c.id)) {
            result.add(c.id);
            queue.push(c.id);
          }
        });
    }
    return [...result];
  };
  const toggle = (category: Category) => {
    if (value.includes(category.id))
      onChange(value.filter((id) => id !== category.id));
    else
      onChange([
        ...value.filter((id) => !descendants(category.id).includes(id)),
        category.id,
      ]);
  };
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-semibold text-slate-700">
        Направления услуг *
      </legend>
      <p className="text-xs text-slate-500">
        Выберите несколько направлений. Отметьте весь раздел или отдельные
        категории — по ним появятся шаблоны услуг.
      </p>
      <input
        type="search"
        aria-label="Поиск направлений"
        placeholder="Например, маникюр или лазер"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-slate-200 p-3 text-sm"
      />
      {query.isPending && <p className="text-sm">Загружаем направления…</p>}
      {query.isError && (
        <div role="alert" className="text-sm text-red-600">
          Не удалось загрузить направления.{" "}
          <button
            type="button"
            onClick={() => query.refetch()}
            className="underline"
          >
            Повторить
          </button>
        </div>
      )}
      <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200 p-3">
        {roots.map((root) => {
          const children = categories.filter((c) => c.parent === root.id);
          const rootMatch = root.name.toLocaleLowerCase("ru").includes(word);
          const visible = children.filter(
            (c) => rootMatch || c.name.toLocaleLowerCase("ru").includes(word),
          );
          if (word && !rootMatch && !visible.length) return null;
          const checked = value.includes(root.id);
          return (
            <div key={root.id} className="mb-3 last:mb-0">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(root)}
                  className="accent-indigo-600"
                />
                {root.name}
              </label>
              {visible.length > 0 && (
                <div className="ml-6 mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  {visible.map((child) => (
                    <label
                      key={child.id}
                      className="flex items-center gap-2 text-xs text-slate-600"
                    >
                      <input
                        type="checkbox"
                        checked={checked || value.includes(child.id)}
                        disabled={disabled || checked}
                        onChange={() => toggle(child)}
                        className="accent-indigo-600"
                      />
                      {child.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {!query.isPending &&
          !query.isError &&
          !categories.some((c) =>
            c.name.toLocaleLowerCase("ru").includes(word),
          ) && (
            <p className="text-sm text-slate-500">Направлений не найдено.</p>
          )}
      </div>
      <p className="text-xs text-slate-500">
        Выбрано: {value.length}. Чтобы выбрать часть раздела, снимите отметку с
        его названия.
      </p>
      {query.isSuccess &&
        value
          .filter((id) => !categories.some((c) => c.id === id))
          .map((id) => (
            <div key={id} role="alert" className="text-sm text-amber-700">
              Направление #{id} больше недоступно.{" "}
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== id))}
                className="underline"
              >
                Убрать из выбора
              </button>
            </div>
          ))}
    </fieldset>
  );
}
