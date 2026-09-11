import {api} from "./api"


interface LoginResponse {
    message: string;
    data: {
        id: number;
        email: string; 
        phone: string;
        role: string;
    }
}

interface RegisterResponse {
    message: string;
    data: {
        id: number;
        email: string;
        phone: string;
        first_name: string;
        last_name: string;
        role: string;
    }
}

export interface RegisterPayload {
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    password: string;
    confirm_password: string;
}

export const registerUser = async (userData: RegisterPayload) => {
    try {
        const response = await api.post<RegisterResponse>('/api/users/register/', 
            userData,
            
    );
        return response.data;
    } catch(error) {
        console.error("Ошибка регистрации: ", error);
        throw error; 
    }
}

export const loginUser = async (email: string, password: string) => {
    try{
        const response = await api.post<LoginResponse>('/api/users/login/',
            {
                email,
                password
            },
            {
                withCredentials: true
            }
        )

        return response.data
    }
    catch(error){
        console.error("Ошибка авторизации: ", error);
        throw error;
    }
}

export const getCurrentUser = async () => {
    try {
        const response = await api.get('/api/users/me/', {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await api.post('/api/users/logout/', null, {
            withCredentials: true
        });

        return response.data;
    } catch(error) {
        console.error("Ошибка выхода: ", error);
        throw error;
    }
}

