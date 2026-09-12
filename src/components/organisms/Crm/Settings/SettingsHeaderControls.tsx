import {
    useEffect,
    useMemo,
    useState
} from 'react';

import Select, {
    type SelectOption
} from '../../../atoms/Select';

import {
    useBusiness
} from '../../../../context/BusinessContext';

import {
    listAllBusinesses,
    type Business
} from '../../../../api/businesses';

export default function SettingsHeaderControls() {
    const {
        selectedBusiness,
        setSelectedBusiness
    } = useBusiness();


    const [
        businesses,
        setBusinesses
    ] = useState<Business[]>([]);


    const [
        isLoading,
        setIsLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState<string | null>(null);


    /*
     * Загружаем реальные бизнесы из backend
     */
    useEffect(() => {
        const loadBusinesses = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const businesses =
                    await listAllBusinesses();

                setBusinesses(
                    businesses
                );

            } catch (error) {
                console.error(
                    'Ошибка загрузки бизнесов:',
                    error
                );

                setBusinesses([]);

                setError(
                    'Не удалось загрузить бизнесы'
                );

            } finally {
                setIsLoading(false);
            }
        };


        loadBusinesses();

    }, []);


    /*
     * Business[] -> SelectOption[]
     */
    const businessOptions =
        useMemo<SelectOption[]>(() => {
            return businesses.map(
                (business) => ({
                    id: business.id,
                    label: business.name
                })
            );
        }, [
            businesses
        ]);


    /*
     * Если бизнес ещё не выбран,
     * выбираем первый бизнес из базы.
     *
     * Если раньше был временный "test"
     * и такого ID уже нет в базе,
     * тоже переключаем на первый реальный бизнес.
     */
    useEffect(() => {
        if (
            isLoading ||
            businessOptions.length === 0
        ) {
            return;
        }


        const selectedExists =
            selectedBusiness
                ? businessOptions.some(
                    (business) =>
                        String(business.id) ===
                        String(selectedBusiness.id)
                )
                : false;


        if (!selectedExists) {
            setSelectedBusiness(
                businessOptions[0]
            );
        }

    }, [
        businessOptions,
        selectedBusiness,
        setSelectedBusiness,
        isLoading
    ]);


    /*
     * Выбранный бизнес именно из списка,
     * полученного с backend.
     */
    const currentBusiness =
        useMemo(() => {
            if (
                !selectedBusiness ||
                businessOptions.length === 0
            ) {
                return null;
            }


            return (
                businessOptions.find(
                    (business) =>
                        String(business.id) ===
                        String(selectedBusiness.id)
                ) ?? null
            );

        }, [
            businessOptions,
            selectedBusiness
        ]);


    /*
     * Полный объект Business,
     * чтобы получить status и другие данные.
     */
    const currentBusinessData =
        useMemo(() => {
            if (!currentBusiness) {
                return null;
            }


            return (
                businesses.find(
                    (business) =>
                        business.id ===
                        Number(currentBusiness.id)
                ) ?? null
            );

        }, [
            businesses,
            currentBusiness
        ]);


    /*
     * У тебя нет is_active.
     * Используем status.
     *
     * Если backend возвращает:
     * "active" -> активен
     */
    const isActive =
        currentBusinessData?.status
            ?.toLowerCase() === 'active';


    if (isLoading) {
        return (
            <div
                className="
                    flex
                    h-11
                    w-[250px]
                    items-center
                    rounded-xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-4
                    text-sm
                    text-slate-500
                "
            >
                Загрузка...
            </div>
        );
    }


    if (error) {
        return (
            <div className="text-sm text-red-500">
                {error}
            </div>
        );
    }


    if (
        businessOptions.length === 0 ||
        !currentBusiness
    ) {
        return (
            <div
                className="
                    flex
                    h-11
                    w-[250px]
                    items-center
                    rounded-xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-4
                    text-sm
                    text-slate-500
                "
            >
                Нет бизнесов
            </div>
        );
    }


    return (
        <div className="flex items-center gap-3">

            <div className="w-[250px]">

                <Select
                    options={
                        businessOptions
                    }
                    value={
                        currentBusiness
                    }
                    onChange={
                        setSelectedBusiness
                    }
                    className="
                        w-full
                        rounded-xl
                        border
                        border-[#c7c4d8]
                        bg-white
                    "
                />

            </div>


            {isActive ? (
                <div
                    className="
                        flex
                        h-9
                        items-center
                        gap-2
                        rounded-full
                        bg-emerald-50
                        px-4
                        text-xs
                        font-semibold
                        text-emerald-600
                    "
                >
                    <span
                        className="
                            h-2
                            w-2
                            rounded-full
                            bg-emerald-500
                        "
                    />

                    Активен
                </div>
            ) : (
                <div
                    className="
                        flex
                        h-9
                        items-center
                        gap-2
                        rounded-full
                        bg-slate-100
                        px-4
                        text-xs
                        font-semibold
                        text-slate-500
                    "
                >
                    <span
                        className="
                            h-2
                            w-2
                            rounded-full
                            bg-slate-400
                        "
                    />

                    Неактивен
                </div>
            )}

        </div>
    );
}