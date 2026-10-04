import {
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CircleAlert, Plus, Trash2 } from "lucide-react";
import Button from "../../../atoms/Button";
import Icon from "../../../atoms/Icon";
import Typography from "../../../atoms/Typography";
import Input from "../../../atoms/Input";
import SidePage from "../../../organisms/SidePage";
import { useBusiness } from "../../../../context/BusinessContext";
import {
  createServiceAddon,
  editServiceAddon,
  deleteServiceAddon,
  editService,
  type ServiceItem,
} from "../../../../api/services";
import {
  activateServiceTemplate,
  createConfiguredService,
  type LibraryRow,
  type ServiceConfiguration,
} from "../../../../api/serviceLibrary";
import SpecialistsList from "./SpecialistsList";
import CategorySelector from "./CategorySelector";
import { getApiErrorMessage } from "../../../../utils/getApiErrorMessage";
/*
 * ============================================================
 * ADDON DRAFT
 * ============================================================
 */
interface AddonDraft {
  id?: number;
  tempId: string;
  name: string;
  description: string;
  price: string;
  duration_minutes: number;
  is_active: boolean;
}
/*
 * ============================================================
 * ADDON ERRORS
 * ============================================================
 */
type AddonErrorMap = Record<string, string[]>;
interface AddonApiErrorData {
  message?: unknown;
  detail?: unknown;
  non_field_errors?: unknown;
  name?: unknown;
  price?: unknown;
  duration_minutes?: unknown;
  is_active?: unknown;
  [key: string]: unknown;
}
class AddonMutationError extends Error {
  tempId: string;
  addonName: string;
  originalError: unknown;
  constructor(tempId: string, addonName: string, originalError: unknown) {
    super(
      `Ошибка дополнительной услуги: ${addonName.trim() || "без названия"}`,
    );
    this.name = "AddonMutationError";
    this.tempId = tempId;
    this.addonName = addonName;
    this.originalError = originalError;
  }
}
const collectApiMessages = (value: unknown): string[] => {
  if (typeof value === "string") {
    const prepared = value.trim();
    return prepared ? [prepared] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectApiMessages);
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(
      collectApiMessages,
    );
  }
  return [];
};
const getAddonApiErrorMessages = (error: unknown): string[] => {
  const axiosError = error as AxiosError<AddonApiErrorData>;
  const data = axiosError.response?.data;
  const messages = data ? collectApiMessages(data) : [];
  const uniqueMessages = Array.from(new Set(messages));
  if (uniqueMessages.length > 0) {
    return uniqueMessages;
  }
  return [
    getApiErrorMessage(error, "Не удалось сохранить дополнительную услугу."),
  ];
};
/*
 * ============================================================
 * CREATE EMPTY ADDON
 * ============================================================
 */
const createEmptyAddon = (): AddonDraft => ({
  tempId: `${Date.now()}-${Math.random()}`,
  name: "",
  description: "",
  price: "",
  duration_minutes: 0,
  is_active: true,
});
export interface NewServiceProps {
  open?: boolean;
  showTrigger?: boolean;
  row?: LibraryRow;
  availableStaffIds?: number[];
  onClose?: () => void;
  onSaved?: (service: ServiceItem) => void | Promise<void>;
}

export default function NewService({
  open,
  showTrigger = open === undefined,
  row,
  availableStaffIds,
  onClose,
  onSaved,
}: NewServiceProps = {}) {
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = open ?? localOpen;
  const setIsOpen = (value: boolean) => {
    if (open === undefined) setLocalOpen(value);
    else if (!value) onClose?.();
  };
  const [existingServiceId, setExistingServiceId] = useState<number | null>(
    null,
  );
  const savedService = useRef<ServiceItem | null>(null);
  const savedAddonIds = useRef(new Map<string, number>());
  const deletedAddonIds = useRef(new Set<number>());
  /*
   * ============================================================
   * BUSINESS
   * ============================================================
   */
  const { selectedBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const previousBusiness = useRef(selectedBusiness?.id);
  const currentBusiness = useRef(selectedBusiness?.id);
  currentBusiness.current = selectedBusiness?.id;

  /*
   * ============================================================
   * SERVICE DATA
   * ============================================================
   */
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState(0);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [isActive, setIsActive] = useState(true);
  /*
   * ============================================================
   * CATEGORY
   * ============================================================
   */
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  /*
   * ============================================================
   * STAFF
   * ============================================================
   */
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  /*
   * ============================================================
   * ADDONS
   * ============================================================
   */
  const [addons, setAddons] = useState<AddonDraft[]>([]);
  const [addonErrors, setAddonErrors] = useState<AddonErrorMap>({});
  /*
   * ============================================================
   * ERROR
   * ============================================================
   */
  const [errorMessage, setErrorMessage] = useState("");
  /*
   * ============================================================
   * INTEGER INPUT
   * ============================================================
   */
  const handleIntegerChange = (
    value: string,
    setter: Dispatch<SetStateAction<number>>,
  ) => {
    if (!/^\d*$/.test(value)) {
      return;
    }
    if (value === "") {
      setter(0);
      return;
    }
    setter(Number(value));
  };
  /*
   * ============================================================
   * PRICE INPUT
   * ============================================================
   */
  const handlePriceChange = (value: string) => {
    if (!/^\d*[.,]?\d{0,2}$/.test(value)) {
      return;
    }
    setPrice(value.replace(",", "."));
  };
  /*
   * ============================================================
   * ADD ADDON
   * ============================================================
   */
  const handleAddAddon = () => {
    setAddons((current) => [...current, createEmptyAddon()]);
  };
  const clearAddonError = (tempId: string) => {
    setAddonErrors((current) => {
      if (!current[tempId]) {
        return current;
      }
      const next = {
        ...current,
      };
      delete next[tempId];
      return next;
    });
  };
  /*
   * ============================================================
   * REMOVE ADDON
   * ============================================================
   */
  const handleRemoveAddon = (tempId: string) => {
    const addon = addons.find((item) => item.tempId === tempId);
    const id = addon?.id ?? savedAddonIds.current.get(tempId);
    if (id) deletedAddonIds.current.add(id);
    setAddons((current) => current.filter((addon) => addon.tempId !== tempId));
    clearAddonError(tempId);
  };
  /*
   * ============================================================
   * UPDATE ADDON
   * ============================================================
   */
  const updateAddon = (tempId: string, changes: Partial<AddonDraft>) => {
    clearAddonError(tempId);
    setAddons((current) =>
      current.map((addon) => {
        if (addon.tempId !== tempId) {
          return addon;
        }
        return {
          ...addon,
          ...changes,
        };
      }),
    );
  };
  /*
   * ============================================================
   * ADDON PRICE
   * ============================================================
   */
  const handleAddonPriceChange = (tempId: string, value: string) => {
    if (!/^\d*[.,]?\d{0,2}$/.test(value)) {
      return;
    }
    updateAddon(tempId, {
      price: value.replace(",", "."),
    });
  };
  /*
   * ============================================================
   * ADDON DURATION
   * ============================================================
   */
  const handleAddonDurationChange = (tempId: string, value: string) => {
    if (!/^\d*$/.test(value)) {
      return;
    }
    updateAddon(tempId, {
      duration_minutes: value === "" ? 0 : Number(value),
    });
  };
  /*
   * ============================================================
   * VALIDATE ADDONS
   * ============================================================
   */
  const validateAddons = () => {
    const nextErrors: AddonErrorMap = {};
    const addError = (tempId: string, message: string) => {
      nextErrors[tempId] = [...(nextErrors[tempId] ?? []), message];
    };
    const namesMap = new Map<string, string[]>();
    addons.forEach((addon, index) => {
      const preparedName = addon.name.trim();
      const preparedPrice = addon.price.trim();
      if (!preparedName) {
        addError(addon.tempId, `Доп. услуга ${index + 1}: введите название.`);
      } else {
        const normalizedName = preparedName.toLocaleLowerCase("ru");
        const ids = namesMap.get(normalizedName) ?? [];
        namesMap.set(normalizedName, [...ids, addon.tempId]);
      }
      if (preparedPrice === "") {
        addError(addon.tempId, "Введите цену дополнительной услуги.");
      } else {
        const numericPrice = Number(preparedPrice);
        if (!Number.isFinite(numericPrice)) {
          addError(addon.tempId, "Цена должна быть числом.");
        } else if (numericPrice < 0) {
          addError(
            addon.tempId,
            "Цена дополнительной услуги не может быть отрицательной.",
          );
        }
      }
      if (
        !Number.isFinite(addon.duration_minutes) ||
        addon.duration_minutes < 0
      ) {
        addError(
          addon.tempId,
          "Дополнительное время не может быть отрицательным.",
        );
      }
    });
    namesMap.forEach((tempIds) => {
      if (tempIds.length < 2) {
        return;
      }
      tempIds.forEach((tempId) => {
        addError(
          tempId,
          "Название дополнительной услуги должно быть уникальным.",
        );
      });
    });
    setAddonErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setErrorMessage("Проверьте ошибки в дополнительных услугах ниже.");
      return false;
    }
    return true;
  };
  /*
   * ============================================================
   * RESET FORM
   * ============================================================
   */
  const resetForm = () => {
    savedService.current = null;
    savedAddonIds.current.clear();
    deletedAddonIds.current.clear();
    setExistingServiceId(null);
    setServiceName("");
    setServiceDesc("");
    setPrice("");
    setDuration(0);
    setBufferBefore(0);
    setBufferAfter(0);
    setIsActive(true);
    setSelectedCategoryId(null);
    setSelectedStaffIds([]);
    setAddons([]);
    setAddonErrors({});
    setErrorMessage("");
  };
  const loadService = (service?: ServiceItem | null) => {
    setServiceName(service?.name ?? row?.template?.name ?? "");
    setServiceDesc(service?.description ?? row?.template?.description ?? "");
    setPrice(service ? String(service.price) : "");
    setDuration(
      service?.duration_minutes ??
        row?.template?.suggested_duration_minutes ??
        0,
    );
    setBufferBefore(service?.buffer_before_minutes ?? 0);
    setBufferAfter(service?.buffer_after_minutes ?? 0);
    setSelectedCategoryId(row?.template?.category ?? service?.category ?? null);
    setSelectedStaffIds(
      (service?.assigned_staff_ids ?? []).filter(
        (id) => !availableStaffIds || availableStaffIds.includes(id),
      ),
    );
    setIsActive(row ? true : (service?.is_active ?? true));
    setAddons(
      (service?.addons ?? []).map((addon) => ({
        id: addon.id,
        tempId: `saved:${addon.id}`,
        name: addon.name,
        description: addon.description ?? "",
        price: String(addon.price),
        duration_minutes: addon.duration_minutes,
        is_active: addon.is_active,
      })),
    );
    setAddonErrors({});
    setErrorMessage("");
  };
  useEffect(() => {
    if (isOpen) {
      resetForm();
      loadService(row?.service);
      window.dispatchEvent(
        new CustomEvent("kezek:service-panel-opened", {
          detail: {
            mode: row ? (row.template ? "template" : "existing") : "manual",
          },
        }),
      );
    }
    // Reset only when opening or changing the selected row; edits remain local.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, row]);
  useEffect(() => {
    if (previousBusiness.current !== selectedBusiness?.id) {
      previousBusiness.current = selectedBusiness?.id;
      resetForm();
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusiness?.id]);
  /*
   * ============================================================
   * CREATE SERVICE
   * ============================================================
   */
  const NewServiceMutate = useMutation({
    mutationFn: async (): Promise<{
      service: ServiceItem;
      businessKey: string | number;
    }> => {
      if (!selectedBusiness?.id) throw new Error("Бизнес не выбран.");
      const businessKey = selectedBusiness.id;
      const payload: ServiceConfiguration = {
        name: serviceName.trim(),
        description: serviceDesc.trim(),
        price,
        duration_minutes: duration,
        buffer_before_minutes: bufferBefore,
        buffer_after_minutes: bufferAfter,
        assign_staff_ids: selectedStaffIds,
      };
      let service: ServiceItem;
      if (row?.template) {
        const response = await activateServiceTemplate(
          Number(businessKey),
          row.template.id,
          {
            ...payload,
            ...(existingServiceId
              ? { existing_service_id: existingServiceId }
              : {}),
          },
        );
        service = response.data;
      } else {
        const existing = savedService.current ?? row?.service;
        if (existing) {
          service = await editService(
            existing.id,
            selectedCategoryId,
            payload.name,
            payload.description,
            Number(price),
            duration,
            bufferBefore,
            bufferAfter,
            row ? true : isActive,
            selectedStaffIds,
          );
        } else {
          const response = await createConfiguredService(Number(businessKey), {
            ...payload,
            category: selectedCategoryId,
            is_active: isActive,
          });
          service = response.data;
        }
      }
      // Keep the successful service and addon IDs if a later request fails.
      // Retrying updates these same objects, including an existing linked service.
      savedService.current = service;
      for (const addon of addons) {
        try {
          const addonPayload = {
            name: addon.name.trim(),
            description: addon.description.trim(),
            price: Number(addon.price),
            duration_minutes: addon.duration_minutes,
            is_active: addon.is_active,
          };
          const id = addon.id ?? savedAddonIds.current.get(addon.tempId);
          const result = id
            ? await editServiceAddon(id, addonPayload)
            : await createServiceAddon(service.id, addonPayload);
          savedAddonIds.current.set(addon.tempId, result.id);
          setAddons((current) =>
            current.map((item) =>
              item.tempId === addon.tempId ? { ...item, id: result.id } : item,
            ),
          );
        } catch (error) {
          throw new AddonMutationError(addon.tempId, addon.name, error);
        }
      }
      for (const id of [...deletedAddonIds.current]) {
        await deleteServiceAddon(id);
        deletedAddonIds.current.delete(id);
      }
      return { service, businessKey };
    },
    /*
     * ====================================================
     * BEFORE
     * ====================================================
     */
    onMutate: () => {
      setErrorMessage("");
    },
    /*
     * ====================================================
     * SUCCESS
     * ====================================================
     */
    onSuccess: async ({ service, businessKey }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["services", businessKey] }),
        queryClient.invalidateQueries({ queryKey: ["businesses"] }),
        queryClient.invalidateQueries({ queryKey: ["all-businesses"] }),
        queryClient.invalidateQueries({
          queryKey: ["booking-services", Number(businessKey)],
        }),
        queryClient.invalidateQueries({
          queryKey: ["service-addons", service.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["assignedStaff", service.id],
        }),
      ]);
      if (currentBusiness.current !== businessKey) return;
      window.dispatchEvent(
        new CustomEvent("kezek:service-created", { detail: service }),
      );
      await onSaved?.(service);
      resetForm();
      setIsOpen(false);
    },
    /*
     * ====================================================
     * ERROR
     * ====================================================
     */
    onError: (error) => {
      console.error("Ошибка сохранения услуги:", error);
      if (savedService.current && selectedBusiness?.id) {
        void queryClient.invalidateQueries({
          queryKey: ["services", selectedBusiness.id],
        });
      }
      if (error instanceof AddonMutationError) {
        const messages = getAddonApiErrorMessages(error.originalError);
        setAddonErrors((current) => ({
          ...current,
          [error.tempId]: messages,
        }));
        const message = `Не удалось сохранить дополнительную услугу «${
          error.addonName.trim() || "без названия"
        }». Услуга сохранена. Исправьте ошибку и повторите сохранение.`;
        setErrorMessage(message);
        window.dispatchEvent(
          new CustomEvent("kezek:service-create-error", {
            detail: {
              message,
            },
          }),
        );
        return;
      }
      const message = getApiErrorMessage(error, "Не удалось создать услугу.");
      setErrorMessage(message);
      window.dispatchEvent(
        new CustomEvent("kezek:service-create-error", {
          detail: {
            message,
          },
        }),
      );
    },
  });
  /*
   * ============================================================
   * VALIDATE + SUBMIT
   * ============================================================
   */
  const handleCreateService = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    /*
     * ====================================================
     * SERVICE NAME
     * ====================================================
     */
    if (!serviceName.trim()) {
      const message = "Введите название услуги.";
      setErrorMessage(message);
      window.dispatchEvent(
        new CustomEvent("kezek:service-create-error", {
          detail: {
            message,
          },
        }),
      );
      return;
    }
    /*
     * ====================================================
     * SERVICE PRICE
     * ====================================================
     */
    if (price.trim() === "") {
      const message = "Введите цену услуги.";
      setErrorMessage(message);
      window.dispatchEvent(
        new CustomEvent("kezek:service-create-error", {
          detail: {
            message,
          },
        }),
      );
      return;
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      const message = "Цена услуги не может быть отрицательной.";
      setErrorMessage(message);
      window.dispatchEvent(
        new CustomEvent("kezek:service-create-error", {
          detail: {
            message,
          },
        }),
      );
      return;
    }
    /*
     * ====================================================
     * SERVICE DURATION
     * ====================================================
     */
    if (duration <= 0) {
      const message = "Длительность услуги должна быть больше 0 минут.";
      setErrorMessage(message);
      window.dispatchEvent(
        new CustomEvent("kezek:service-create-error", {
          detail: {
            message,
          },
        }),
      );
      return;
    }
    /*
     * ====================================================
     * BUFFER
     * ====================================================
     */
    if (bufferBefore < 0 || bufferAfter < 0) {
      const message = "Буфер услуги не может быть отрицательным.";
      setErrorMessage(message);
      window.dispatchEvent(
        new CustomEvent("kezek:service-create-error", {
          detail: {
            message,
          },
        }),
      );
      return;
    }
    /*
     * ====================================================
     * ADDONS
     * ====================================================
     */
    if (!validateAddons()) {
      window.dispatchEvent(
        new CustomEvent("kezek:service-create-error", {
          detail: {
            message:
              "Проверьте дополнительные услуги: название обязательно, а цена не может быть отрицательной.",
          },
        }),
      );
      return;
    }
    if ((row || isActive) && selectedStaffIds.length === 0) {
      const message = "Выберите хотя бы одного мастера для услуги.";
      setErrorMessage(message);
      window.dispatchEvent(
        new CustomEvent("kezek:service-create-error", {
          detail: {
            message,
          },
        }),
      );
      return;
    }
    NewServiceMutate.mutate();
  };
  /*
   * ============================================================
   * BUSINESS NOT SELECTED
   * ============================================================
   */
  if (!selectedBusiness) {
    return <div>Пожалуйста, выберите бизнес из списка сверху...</div>;
  }
  const businessesId = Number(selectedBusiness.id);
  const handleServicePanelClose = () => {
    if (NewServiceMutate.isPending) return;
    setErrorMessage("");
    setIsOpen(false);
    window.dispatchEvent(new Event("kezek:service-panel-closed"));
  };
  const handleSelectedStaffChange = (ids: number[]) => {
    setSelectedStaffIds(ids);
    if (ids.length > 0) {
      window.dispatchEvent(
        new CustomEvent("kezek:service-staff-selected", {
          detail: {
            ids,
          },
        }),
      );
    }
  };
  const areAddonsValid =
    addons.every((addon) => {
      const addonPrice = Number(addon.price);
      return (
        addon.name.trim().length > 0 &&
        addon.price.trim().length > 0 &&
        Number.isFinite(addonPrice) &&
        addonPrice >= 0 &&
        Number.isFinite(addon.duration_minutes) &&
        addon.duration_minutes >= 0
      );
    }) &&
    new Set(addons.map((addon) => addon.name.trim().toLocaleLowerCase("ru")))
      .size === addons.length;
  const numericServicePrice = Number(price);
  const isServicePriceValid =
    price.trim().length > 0 &&
    Number.isFinite(numericServicePrice) &&
    numericServicePrice >= 0;
  const canCreateService =
    serviceName.trim().length > 0 &&
    isServicePriceValid &&
    duration > 0 &&
    bufferBefore >= 0 &&
    bufferAfter >= 0 &&
    areAddonsValid &&
    (!(row || isActive) || selectedStaffIds.length > 0);
  /*
   * ============================================================
   * TOTAL PREVIEW
   * ============================================================
   */
  const addonsTotalPrice = addons.reduce((total, addon) => {
    const addonPrice = Number(addon.price);
    return total + (Number.isFinite(addonPrice) ? addonPrice : 0);
  }, 0);
  const addonsTotalDuration = addons.reduce(
    (total, addon) => total + addon.duration_minutes,
    0,
  );
  const servicePrice = Number(price) || 0;
  const finalPricePreview = servicePrice + addonsTotalPrice;
  const finalDurationPreview = duration + addonsTotalDuration;
  /*
   * ============================================================
   * JSX
   * ============================================================
   */
  return (
    <>
      {/* =====================================================
                CREATE BUTTON
            ===================================================== */}
      {showTrigger && (
        <Button
          type="button"
          className="
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#4F46E5]
                    px-7
                    py-3
                    text-white
                    shadow-sm
                    transition-colors
                    hover:bg-indigo-600
                    md:w-auto
                    md:shrink-0
                "
          onClick={() => {
            setErrorMessage("");
            setIsOpen(true);
          }}
          data-tour="create-service"
        >
          <Icon icon={Plus} size={20} />
          <Typography
            text="Создать услугу"
            className="
                        whitespace-nowrap
                        text-sm
                        font-semibold
                    "
          />
        </Button>
      )}
      {/* =====================================================
                SIDE PAGE
            ===================================================== */}
      <SidePage
        isOpen={isOpen}
        onClose={handleServicePanelClose}
        title={row ? "Настроить и включить услугу" : "Создать услугу"}
        description={"Добавьте новую услугу для выбранного бизнеса"}
      >
        <form
          data-tour-scroll-allowed="true"
          className="
                        flex
                        h-full
                        flex-col
                    "
          onSubmit={handleCreateService}
        >
          <fieldset disabled={NewServiceMutate.isPending} className="contents">
            <div
              className="
                            flex
                            flex-1
                            flex-col
                            gap-6
                        "
            >
              {/* =========================================
                            BUSINESS
                        ========================================= */}
              <div
                className="
                                flex
                                items-center
                                justify-start
                                gap-4
                                rounded-xl
                                border
                                border-[#c7c4d8]
                                bg-[#eff4ff]
                                px-4
                                py-2
                            "
              >
                <Icon
                  icon={CircleAlert}
                  className="
                                    text-[#4F46E5]
                                "
                />
                <div
                  className="
                                    flex
                                    flex-col
                                "
                >
                  <Typography
                    className="
                                        text-md
                                        font-medium
                                        tracking-normal
                                    "
                    text={`Бизнес: ${
                      selectedBusiness.label || "Выберите бизнес."
                    }`}
                  />
                  <Typography
                    className="
                                        text-sm
                                        text-gray-700
                                    "
                    text={"Услуга относится к выбранному бизнесу"}
                  />
                </div>
              </div>
              {/* =========================================
                            ERROR
                        ========================================= */}
              {errorMessage && (
                <div
                  className="
                                    flex
                                    items-start
                                    gap-3
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-red-700
                                "
                >
                  <CircleAlert
                    size={19}
                    className="
                                        mt-0.5
                                        shrink-0
                                        text-red-500
                                    "
                  />
                  <div
                    className="
                                        whitespace-pre-line
                                        leading-5
                                    "
                  >
                    {errorMessage}
                  </div>
                </div>
              )}
              {row?.template && (
                <p className="text-xs text-slate-500">
                  Категория взята из шаблона. Цена, время, мастера и дополнения
                  задаются вашим бизнесом.
                </p>
              )}
              {!!row?.matching_services?.length && !row.service && (
                <label
                  data-tour="service-existing"
                  className="block text-sm text-slate-700"
                >
                  У вас уже есть услуга с таким названием
                  <select
                    className="mt-2 w-full rounded-lg border border-slate-200 p-3"
                    value={existingServiceId ?? ""}
                    disabled={
                      NewServiceMutate.isPending || !!savedService.current
                    }
                    onChange={(event) => {
                      const id = event.target.value
                        ? Number(event.target.value)
                        : null;
                      setExistingServiceId(id);
                      savedService.current = null;
                      savedAddonIds.current.clear();
                      deletedAddonIds.current.clear();
                      loadService(
                        row.matching_services.find(
                          (service) => service.id === id,
                        ),
                      );
                    }}
                  >
                    <option value="">Создать отдельную услугу</option>
                    {row.matching_services.map((service) => (
                      <option key={service.id} value={service.id}>
                        Использовать «{service.name}» (#{service.id})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {/* =========================================
                            SERVICE NAME
                        ========================================= */}
              <div
                className="
                                flex
                                flex-col
                                gap-1.5
                            "
              >
                <Typography
                  className="
                                    text-sm
                                    font-medium
                                    text-slate-800
                                "
                  text="Название услуги"
                />
                <Input
                  data-tour="service-name"
                  type="text"
                  value={serviceName}
                  placeholder="Мужская стрижка"
                  className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-[#d6d4e1]
                                    bg-[#f8f9ff]
                                    px-4
                                    py-3
                                    font-normal
                                    text-slate-900
                                    focus:border-[#5955e8]
                                    focus:outline-none
                                    focus:ring
                                    focus:ring-[#5955e8]
                                "
                  onChange={(e) => setServiceName(e.target.value)}
                />
              </div>
              {/* =========================================
                            CATEGORY
                        ========================================= */}
              <div data-tour="service-category">
                <CategorySelector
                  disabled={!!row?.template}
                  value={selectedCategoryId}
                  onChange={setSelectedCategoryId}
                />
              </div>
              {/* =========================================
                            DESCRIPTION
                        ========================================= */}
              <div
                className="
                                flex
                                flex-col
                                gap-1.5
                            "
              >
                <Typography
                  className="
                                    text-sm
                                    font-medium
                                    text-slate-800
                                "
                  text="Описание"
                />
                <textarea
                  data-tour="service-description"
                  rows={3}
                  value={serviceDesc}
                  placeholder="Опишите услугу"
                  className="
                                    w-full
                                    resize-none
                                    rounded-lg
                                    border
                                    border-[#d6d4e1]
                                    bg-[#f8f9ff]
                                    px-4
                                    py-3
                                    text-slate-900
                                    placeholder:font-medium
                                    placeholder:text-[#858585]
                                    focus:border-[#5955e8]
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[#5955e8]
                                "
                  onChange={(e) => setServiceDesc(e.target.value)}
                />
              </div>
              {/* =========================================
                            PRICE / DURATION / BUFFER
                        ========================================= */}
              <div
                className="
                                grid
                                grid-cols-1
                                gap-5
                                sm:grid-cols-2
                            "
              >
                {/* PRICE */}
                <div
                  className="
                                    flex
                                    flex-col
                                    gap-1.5
                                "
                >
                  <Typography
                    className="
                                        text-sm
                                        font-medium
                                        text-slate-800
                                    "
                    text="Цена"
                  />
                  <div
                    className="
                                        relative
                                        flex
                                        items-center
                                    "
                  >
                    <Input
                      data-tour="service-price"
                      type="text"
                      inputMode="decimal"
                      value={price}
                      className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-[#d6d4e1]
                                            bg-[#f8f9ff]
                                            py-3
                                            pl-4
                                            pr-10
                                            font-normal
                                            text-slate-900
                                            focus:border-[#5955e8]
                                            focus:outline-none
                                            focus:ring-1
                                            focus:ring-[#5955e8]
                                        "
                      placeholder="0"
                      onChange={(e) => handlePriceChange(e.target.value)}
                    />
                    <span
                      className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                    >
                      ₸
                    </span>
                  </div>
                  {price.trim() !== "" && !isServicePriceValid && (
                    <div
                      className="
                                            text-xs
                                            font-medium
                                            text-red-600
                                        "
                    >
                      Цена не может быть отрицательной.
                    </div>
                  )}
                </div>
                {/* DURATION */}
                <div
                  className="
                                    flex
                                    flex-col
                                    gap-1.5
                                "
                >
                  <Typography
                    className="
                                        text-sm
                                        font-medium
                                        text-slate-800
                                    "
                    text="Длительность"
                  />
                  <div
                    className="
                                        relative
                                        flex
                                        items-center
                                    "
                  >
                    <Input
                      data-tour="service-duration"
                      type="text"
                      inputMode="numeric"
                      value={duration}
                      className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-[#d6d4e1]
                                            bg-[#f8f9ff]
                                            py-3
                                            pl-4
                                            pr-12
                                            font-normal
                                            text-slate-900
                                            focus:border-[#5955e8]
                                            focus:outline-none
                                            focus:ring-1
                                            focus:ring-[#5955e8]
                                        "
                      placeholder="0"
                      onChange={(e) =>
                        handleIntegerChange(e.target.value, setDuration)
                      }
                    />
                    <span
                      className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                    >
                      мин
                    </span>
                  </div>
                </div>
                {/* BUFFER BEFORE */}
                <div
                  className="
                                    flex
                                    flex-col
                                    gap-1.5
                                "
                >
                  <Typography
                    className="
                                        text-sm
                                        font-medium
                                        text-slate-800
                                    "
                    text="Буфер до услуги"
                  />
                  <div
                    className="
                                        relative
                                        flex
                                        items-center
                                    "
                  >
                    <Input
                      data-tour="service-buffers"
                      type="text"
                      inputMode="numeric"
                      value={bufferBefore}
                      className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-[#d6d4e1]
                                            bg-[#f8f9ff]
                                            py-3
                                            pl-4
                                            pr-12
                                            font-normal
                                            text-slate-900
                                            focus:border-[#5955e8]
                                            focus:outline-none
                                            focus:ring-1
                                            focus:ring-[#5955e8]
                                        "
                      placeholder="0"
                      onChange={(e) =>
                        handleIntegerChange(e.target.value, setBufferBefore)
                      }
                    />
                    <span
                      className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                    >
                      мин
                    </span>
                  </div>
                </div>
                {/* BUFFER AFTER */}
                <div
                  className="
                                    flex
                                    flex-col
                                    gap-1.5
                                "
                >
                  <Typography
                    className="
                                        text-sm
                                        font-medium
                                        text-slate-800
                                    "
                    text="Буфер после услуги"
                  />
                  <div
                    className="
                                        relative
                                        flex
                                        items-center
                                    "
                  >
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={bufferAfter}
                      className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-[#d6d4e1]
                                            bg-[#f8f9ff]
                                            py-3
                                            pl-4
                                            pr-12
                                            font-normal
                                            text-slate-900
                                            focus:border-[#5955e8]
                                            focus:outline-none
                                            focus:ring-1
                                            focus:ring-[#5955e8]
                                        "
                      placeholder="0"
                      onChange={(e) =>
                        handleIntegerChange(e.target.value, setBufferAfter)
                      }
                    />
                    <span
                      className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                    >
                      мин
                    </span>
                  </div>
                </div>
              </div>
              <hr
                className="
                                mb-1
                                mt-2
                                border-t
                                border-[#f0f0f5]
                            "
              />
              {/* =========================================
                            ADDONS HEADER
                        ========================================= */}
              <div
                data-tour="service-addons"
                data-tour-valid={areAddonsValid ? "true" : "false"}
                className="
                                flex
                                flex-col
                                gap-4
                            "
              >
                <div
                  className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                "
                >
                  <div
                    className="
                                        flex
                                        flex-col
                                        gap-1
                                    "
                  >
                    <Typography
                      text="Дополнительные услуги"
                      className="
                                            text-sm
                                            font-semibold
                                            text-slate-800
                                        "
                    />
                    <Typography
                      text={
                        "Клиент сможет выбрать их дополнительно к основной услуге"
                      }
                      className="
                                            text-xs
                                            text-slate-500
                                        "
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddAddon}
                    className="
                                        flex
                                        shrink-0
                                        items-center
                                        gap-2
                                        rounded-lg
                                        border
                                        border-[#c7c4d8]
                                        bg-white
                                        px-3
                                        py-2
                                        transition-colors
                                        hover:bg-slate-50
                                    "
                  >
                    <Icon
                      icon={Plus}
                      size={17}
                      className="
                                            text-[#4F46E5]
                                        "
                    />
                    <Typography
                      text="Добавить"
                      className="
                                            text-sm
                                            font-medium
                                            text-[#4F46E5]
                                        "
                    />
                  </Button>
                </div>
                {/* =====================================
                                NO ADDONS
                            ===================================== */}
                {addons.length === 0 && (
                  <div
                    className="
                                        rounded-xl
                                        border
                                        border-dashed
                                        border-[#d6d4e1]
                                        bg-[#f8f9ff]
                                        px-4
                                        py-5
                                        text-center
                                        text-sm
                                        text-slate-500
                                    "
                  >
                    Дополнительных услуг пока нет
                  </div>
                )}
                {/* =====================================
                                ADDON CARDS
                            ===================================== */}
                {addons.map((addon, index) => (
                  <div
                    key={addon.tempId}
                    className={`
                                            flex
                                            flex-col
                                            gap-4
                                            rounded-xl
                                            border
                                            p-4
                                            ${
                                              addonErrors[addon.tempId]?.length
                                                ? `
                                                        border-red-300
                                                        bg-red-50/30
                                                    `
                                                : `
                                                        border-[#d6d4e1]
                                                        bg-white
                                                    `
                                            }
                                        `}
                  >
                    {/* HEADER */}
                    <div
                      className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-4
                                            "
                    >
                      <Typography
                        text={`Доп. услуга ${index + 1}`}
                        className="
                                                    text-sm
                                                    font-semibold
                                                    text-slate-800
                                                "
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAddon(addon.tempId)}
                        className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    cursor-pointer
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    text-red-500
                                                    transition-colors
                                                    hover:bg-red-50
                                                "
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {addonErrors[addon.tempId]?.length > 0 && (
                      <div
                        className="
                                                    flex
                                                    items-start
                                                    gap-2
                                                    rounded-lg
                                                    border
                                                    border-red-200
                                                    bg-red-50
                                                    px-3
                                                    py-2.5
                                                    text-xs
                                                    text-red-700
                                                "
                      >
                        <CircleAlert
                          size={16}
                          className="
                                                        mt-0.5
                                                        shrink-0
                                                        text-red-500
                                                    "
                        />
                        <div
                          className="
                                                        flex
                                                        flex-col
                                                        gap-1
                                                    "
                        >
                          {addonErrors[addon.tempId].map(
                            (message, errorIndex) => (
                              <div key={`${addon.tempId}-${errorIndex}`}>
                                {message}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                    {/* NAME */}
                    <div
                      className="
                                                flex
                                                flex-col
                                                gap-1.5
                                            "
                    >
                      <Typography
                        text="Название"
                        className="
                                                    text-sm
                                                    font-medium
                                                    text-slate-800
                                                "
                      />
                      <Input
                        type="text"
                        value={addon.name}
                        placeholder={"Например: Снятие покрытия"}
                        className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    border-[#d6d4e1]
                                                    bg-[#f8f9ff]
                                                    px-4
                                                    py-3
                                                    text-slate-900
                                                    focus:border-[#5955e8]
                                                    focus:outline-none
                                                    focus:ring-1
                                                    focus:ring-[#5955e8]
                                                "
                        onChange={(e) =>
                          updateAddon(addon.tempId, {
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    {/* DESCRIPTION */}
                    <div
                      className="
                                                flex
                                                flex-col
                                                gap-1.5
                                            "
                    >
                      <Typography
                        text="Описание"
                        className="
                                                    text-sm
                                                    font-medium
                                                    text-slate-800
                                                "
                      />
                      <textarea
                        rows={2}
                        value={addon.description}
                        placeholder={"Описание дополнительной услуги"}
                        className="
                                                    w-full
                                                    resize-none
                                                    rounded-lg
                                                    border
                                                    border-[#d6d4e1]
                                                    bg-[#f8f9ff]
                                                    px-4
                                                    py-3
                                                    text-slate-900
                                                    focus:border-[#5955e8]
                                                    focus:outline-none
                                                    focus:ring-1
                                                    focus:ring-[#5955e8]
                                                "
                        onChange={(e) =>
                          updateAddon(addon.tempId, {
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    {/* PRICE + DURATION */}
                    <div
                      className="
                                                grid
                                                grid-cols-1
                                                gap-4
                                                sm:grid-cols-2
                                            "
                    >
                      {/* ADDON PRICE */}
                      <div
                        className="
                                                    flex
                                                    flex-col
                                                    gap-1.5
                                                "
                      >
                        <Typography
                          text="Доп. цена"
                          className="
                                                        text-sm
                                                        font-medium
                                                        text-slate-800
                                                    "
                        />
                        <div
                          className="
                                                        relative
                                                        flex
                                                        items-center
                                                    "
                        >
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={addon.price}
                            placeholder="0"
                            className="
                                                            w-full
                                                            rounded-lg
                                                            border
                                                            border-[#d6d4e1]
                                                            bg-[#f8f9ff]
                                                            py-3
                                                            pl-4
                                                            pr-10
                                                            text-slate-900
                                                            focus:border-[#5955e8]
                                                            focus:outline-none
                                                            focus:ring-1
                                                            focus:ring-[#5955e8]
                                                        "
                            onChange={(e) =>
                              handleAddonPriceChange(
                                addon.tempId,
                                e.target.value,
                              )
                            }
                          />
                          <span
                            className="
                                                            pointer-events-none
                                                            absolute
                                                            right-4
                                                            text-sm
                                                            text-slate-500
                                                        "
                          >
                            ₸
                          </span>
                        </div>
                      </div>
                      {/* ADDON DURATION */}
                      <div
                        className="
                                                    flex
                                                    flex-col
                                                    gap-1.5
                                                "
                      >
                        <Typography
                          text="Доп. время"
                          className="
                                                        text-sm
                                                        font-medium
                                                        text-slate-800
                                                    "
                        />
                        <div
                          className="
                                                        relative
                                                        flex
                                                        items-center
                                                    "
                        >
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={addon.duration_minutes}
                            placeholder="0"
                            className="
                                                            w-full
                                                            rounded-lg
                                                            border
                                                            border-[#d6d4e1]
                                                            bg-[#f8f9ff]
                                                            py-3
                                                            pl-4
                                                            pr-12
                                                            text-slate-900
                                                            focus:border-[#5955e8]
                                                            focus:outline-none
                                                            focus:ring-1
                                                            focus:ring-[#5955e8]
                                                        "
                            onChange={(e) =>
                              handleAddonDurationChange(
                                addon.tempId,
                                e.target.value,
                              )
                            }
                          />
                          <span
                            className="
                                                            pointer-events-none
                                                            absolute
                                                            right-4
                                                            text-sm
                                                            text-slate-500
                                                        "
                          >
                            мин
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* ACTIVE */}
                    <div
                      className="
                                                flex
                                                items-center
                                                justify-between
                                            "
                    >
                      <Typography
                        text={"Доп. услуга активна"}
                        className="
                                                    text-sm
                                                    font-medium
                                                    text-slate-800
                                                "
                      />
                      <label
                        className="
                                                    relative
                                                    inline-flex
                                                    cursor-pointer
                                                    items-center
                                                "
                      >
                        <input
                          type="checkbox"
                          checked={addon.is_active}
                          onChange={(e) =>
                            updateAddon(addon.tempId, {
                              is_active: e.target.checked,
                            })
                          }
                          className="
                                                        peer
                                                        sr-only
                                                    "
                        />
                        <div
                          className="
                                                        peer
                                                        h-6
                                                        w-11
                                                        rounded-full
                                                        bg-gray-200
                                                        after:absolute
                                                        after:left-0.5
                                                        after:top-0.5
                                                        after:h-5
                                                        after:w-5
                                                        after:rounded-full
                                                        after:border
                                                        after:border-gray-300
                                                        after:bg-white
                                                        after:content-['']
                                                        after:transition-all
                                                        peer-checked:bg-[#5955e8]
                                                        peer-checked:after:translate-x-full
                                                        peer-checked:after:border-white
                                                    "
                        />
                      </label>
                    </div>
                  </div>
                ))}
                {/* =====================================
                                TOTAL PREVIEW
                            ===================================== */}
                {addons.length > 0 && (
                  <div
                    className="
                                        rounded-xl
                                        border
                                        border-[#c7c4d8]
                                        bg-[#eff4ff]
                                        p-4
                                    "
                  >
                    <Typography
                      text={"Если клиент выберет все дополнительные услуги:"}
                      className="
                                            mb-2
                                            text-sm
                                            font-medium
                                            text-slate-700
                                        "
                    />
                    <div
                      className="
                                            flex
                                            flex-wrap
                                            gap-x-6
                                            gap-y-2
                                            text-sm
                                        "
                    >
                      <span>
                        Цена:{" "}
                        <strong>
                          {finalPricePreview.toLocaleString("ru-RU")} ₸
                        </strong>
                      </span>
                      <span>
                        Длительность:{" "}
                        <strong>{finalDurationPreview} мин</strong>
                      </span>
                    </div>
                    <Typography
                      text={`Буферы применяются один раз: ${bufferBefore} мин до всей записи и ${bufferAfter} мин после всей записи.`}
                      className="
                                            mt-2
                                            text-xs
                                            text-slate-500
                                        "
                    />
                  </div>
                )}
              </div>
              <hr
                className="
                                mb-1
                                mt-2
                                border-t
                                border-[#f0f0f5]
                            "
              />
              {/* =========================================
                            MAIN SERVICE ACTIVE
                        ========================================= */}
              <div
                data-tour="service-active"
                className="
                                flex
                                items-center
                                justify-between
                            "
              >
                <Typography
                  className="
                                    text-sm
                                    font-medium
                                    text-slate-800
                                "
                  text="Услуга активна"
                />
                <label
                  className="
                                    relative
                                    inline-flex
                                    cursor-pointer
                                    items-center
                                "
                >
                  <input
                    type="checkbox"
                    disabled={!!row || NewServiceMutate.isPending}
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="
                                        peer
                                        sr-only
                                    "
                  />
                  <div
                    className="
                                        peer
                                        h-6
                                        w-11
                                        rounded-full
                                        bg-gray-200
                                        after:absolute
                                        after:left-0.5
                                        after:top-0.5
                                        after:h-5
                                        after:w-5
                                        after:rounded-full
                                        after:border
                                        after:border-gray-300
                                        after:bg-white
                                        after:content-['']
                                        after:transition-all
                                        peer-checked:bg-[#5955e8]
                                        peer-checked:after:translate-x-full
                                        peer-checked:after:border-white
                                    "
                  />
                </label>
              </div>
            </div>
            {/* =============================================
                        STAFF
                    ============================================= */}
            <div
              data-tour="service-staff"
              data-tour-valid={
                !(row || isActive) || selectedStaffIds.length > 0
                  ? "true"
                  : "false"
              }
              className="
                            mt-10
                            flex
                            items-center
                            justify-start
                            gap-5
                        "
            >
              <SpecialistsList
                businessId={businessesId}
                selectedIds={selectedStaffIds}
                onChangeSelected={handleSelectedStaffChange}
              />
            </div>
            {/* =============================================
                        FOOTER
                    ============================================= */}
            <div
              className="
                            sticky
                            bottom-0
                            z-10
                            -mx-6
                            -mb-6
                            mt-8
                            flex
                            items-center
                            justify-end
                            gap-3
                            border-t
                            border-[#f0f0f5]
                            bg-white
                            px-6
                            pb-8
                            pt-5
                        "
            >
              <Button
                type="button"
                onClick={handleServicePanelClose}
                className="
                                rounded-xl
                                border
                                border-[#c7c4d8]
                                bg-white
                                px-6
                                py-2.5
                                transition-colors
                                hover:bg-slate-50
                            "
              >
                <Typography
                  text="Отмена"
                  className="
                                    whitespace-nowrap
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                />
              </Button>
              <Button
                data-tour="service-submit"
                type="submit"
                disabled={NewServiceMutate.isPending || !canCreateService}
                className="
                                cursor-pointer
                                rounded-xl
                                bg-[#4F46E5]
                                px-6
                                py-2.5
                                shadow-sm
                                transition-colors
                                hover:bg-indigo-600
                                disabled:cursor-not-allowed
                                disabled:bg-gray-400
                            "
              >
                <Typography
                  text={
                    NewServiceMutate.isPending
                      ? "Сохраняем..."
                      : row
                        ? "Сохранить и включить"
                        : "Создать"
                  }
                  className="
                                    whitespace-nowrap
                                    text-sm
                                    font-semibold
                                    text-white
                                "
                />
              </Button>
            </div>
          </fieldset>
        </form>
      </SidePage>
    </>
  );
}
