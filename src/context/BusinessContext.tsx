import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from 'react';

import type {
    SelectOption
} from '../components/atoms/Select';


type BusinessContextType = {
    selectedBusiness: SelectOption | null;

    setSelectedBusiness: (
        business: SelectOption | null
    ) => void;
};


const BusinessContext =
    createContext<BusinessContextType | undefined>(
        undefined
    );


const STORAGE_KEY =
    'kezek_selected_business';


export function BusinessProvider({
    children
}: {
    children: ReactNode;
}) {

    /*
     * При первом запуске сразу пытаемся
     * восстановить бизнес из localStorage.
     */
    const [
        selectedBusiness,
        setSelectedBusiness
    ] = useState<SelectOption | null>(() => {

        try {
            const savedBusiness =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!savedBusiness) {
                return null;
            }


            return JSON.parse(
                savedBusiness
            ) as SelectOption;

        } catch {
            return null;
        }
    });


    /*
     * При каждом изменении бизнеса
     * сохраняем его.
     */
    useEffect(() => {

        if (selectedBusiness) {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    selectedBusiness
                )
            );

        } else {

            localStorage.removeItem(
                STORAGE_KEY
            );
        }

    }, [
        selectedBusiness
    ]);


    return (
        <BusinessContext.Provider
            value={{
                selectedBusiness,
                setSelectedBusiness
            }}
        >
            {children}
        </BusinessContext.Provider>
    );
}


export function useBusiness() {

    const context =
        useContext(
            BusinessContext
        );


    if (!context) {
        throw new Error(
            'useBusiness должен использоваться внутри BusinessProvider'
        );
    }


    return context;
}