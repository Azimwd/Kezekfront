import { useState } from "react";

import { CircleCheck, Trash, TriangleAlert, X } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "../../../atoms/Button";
import Icon from "../../../atoms/Icon";
import Typography from "../../../atoms/Typography";
import Popover from "../../Popover";

import { deleteCardBusinesses } from "../../../../api/businesses";

interface DeleteBusinessProps {
  businessId: number;
}

interface DeleteBusinessResponse {
  message?: string;
  archived?: boolean;
}

export default function DeleteBusiness({ businessId }: DeleteBusinessProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [isArchived, setIsArchived] = useState(false);

  const [isError, setIsError] = useState(false);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCardBusinesses(id),

    onSuccess: async (response: DeleteBusinessResponse) => {
      setIsPopoverOpen(false);

      setIsError(false);

      setIsArchived(response?.archived === true);

      setMessage(response?.message || "Бизнес успешно удалён.");

      await queryClient.invalidateQueries({
        queryKey: ["businesses"],
      });

      await queryClient.invalidateQueries({ queryKey: ["all-businesses"] });

      window.setTimeout(() => {
        setMessage("");
      }, 7000);
    },

    onError: (error) => {
      console.error("Ошибка при удалении бизнеса:", error);

      setIsPopoverOpen(false);

      setIsArchived(false);

      setIsError(true);

      setMessage("Не удалось удалить бизнес. Попробуйте ещё раз.");

      window.setTimeout(() => {
        setMessage("");
      }, 7000);
    },
  });

  const handleConfirmDelete = () => {
    deleteMutation.mutate(businessId);
  };

  const handleCloseMessage = () => {
    setMessage("");
  };

  return (
    <>
      <div className="relative">
        <Button
          type="button"
          onClick={() => setIsPopoverOpen((current) => !current)}
          disabled={deleteMutation.isPending}
          className={`
                        flex
                        h-[46px]
                        w-[46px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#fff0f0]
                        text-red-500
                        transition-colors

                        hover:bg-red-100

                        ${
                          deleteMutation.isPending
                            ? `
                                    cursor-not-allowed
                                    opacity-50
                                `
                            : `
                                    cursor-pointer
                                `
                        }
                    `}
        >
          <Icon icon={Trash} className="h-5 w-5" />
        </Button>

        <Popover isOpen={isPopoverOpen} onClose={() => setIsPopoverOpen(false)}>
          <div className="flex max-w-[320px] flex-col gap-1">
            <Typography
              text="Удалить бизнес?"
              className="text-sm font-bold text-white"
            />

            <Typography
              text={
                "Если у бизнеса нет истории записей, он будет удалён. Если записи уже существуют, бизнес будет архивирован и больше не будет принимать новые записи."
              }
              className="text-xs leading-relaxed text-white"
            />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => setIsPopoverOpen(false)}
              disabled={deleteMutation.isPending}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Отмена
            </Button>

            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Удаление..." : "Да, удалить"}
            </Button>
          </div>
        </Popover>
      </div>

      {message && (
        <div
          className={`
                        fixed
                        right-4
                        top-4
                        z-[12000]
                        flex
                        w-[calc(100%-32px)]
                        max-w-[430px]
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        p-4
                        shadow-lg

                        sm:right-6
                        sm:top-6

                        ${
                          isError
                            ? `
                                    border-red-200
                                    bg-red-50
                                    text-red-800
                                `
                            : isArchived
                              ? `
                                        border-amber-200
                                        bg-amber-50
                                        text-amber-900
                                    `
                              : `
                                        border-emerald-200
                                        bg-emerald-50
                                        text-emerald-800
                                    `
                        }
                    `}
        >
          <div className="mt-0.5 shrink-0">
            <Icon
              icon={isError || isArchived ? TriangleAlert : CircleCheck}
              size={20}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">
              {isError
                ? "Ошибка"
                : isArchived
                  ? "Бизнес архивирован"
                  : "Бизнес удалён"}
            </div>

            <div className="mt-1 text-sm leading-5">{message}</div>
          </div>

          <button
            type="button"
            onClick={handleCloseMessage}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg opacity-60 transition hover:bg-black/5 hover:opacity-100"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}
