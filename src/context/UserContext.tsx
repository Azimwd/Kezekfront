import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from 'react';

import { getCurrentUser } from '../api/auth';

type UserData = {
    email: string;
    id: number;
    phone: string | null;
    role: string;
};

interface UserContextType {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
    isLoadingUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(
    undefined
);

export const UserProvider = ({
    children
}: {
    children: ReactNode;
}) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const response = await getCurrentUser();

                const currentUser =
                    response?.data ?? response;

                setUser(currentUser);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoadingUser(false);
            }
        };

        loadCurrentUser();
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                isLoadingUser
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error(
            'useUser должен использоваться внутри UserProvider'
        );
    }

    return context;
};