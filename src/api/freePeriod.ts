import { api } from './api';

export interface FreeAccessStatus {
    notice_enabled: boolean;
    free_until: string | null;
    server_now: string;
    timezone: string;
    phase: 'unconfigured' | 'active' | 'ended';
    active_notice: string;
    expired_notice: string;
}

export async function getFreeAccessStatus() {
    const { data } = await api.get<FreeAccessStatus>('/api/businesses/free-period/');
    // Запоминаем момент получения именно этих данных, а не очередного рендера.
    return { ...data, receivedAt: Date.now() };
}
