import { api } from './api';

export interface AnalyticsOption {
    id: number;
    name: string;
}

export interface AnalyticsOptions {
    staff: AnalyticsOption[];
    services: AnalyticsOption[];
}

export interface AnalyticsFilters {
    date_from: string;
    date_to: string;
    staff_id?: number;
    service_id?: number;
    status?: string;
}

export interface AnalyticsSummary {
    revenue: string;
    expected_revenue: string;
    appointments: number;
    completed: number;
    average_check: string;
    cancelled: number;
    cancellation_rate: string;
    no_show: number;
    no_show_rate: string;
    clients: number;
    visitors: number;
    new_visitors: number;
    returning_visitors: number;
    multiple_visit_clients: number;
    confirmed_prepayments: string;
}

export interface AnalyticsGroup {
    id: number;
    name: string;
    appointments: number;
    completed: number;
    cancelled: number;
    no_show: number;
    revenue: string;
    average_check: string;
}

export interface AnalyticsReport {
    business: AnalyticsOption;
    generated_at: string;
    timezone: string;

    period: {
        date_from: string;
        date_to: string;
    };

    previous_period: {
        date_from: string;
        date_to: string;
    };

    filters: {
        staff_id?: number;
        service_id?: number;
        status?: string;
    };

    summary: AnalyticsSummary;
    previous_summary: AnalyticsSummary;

    changes: Record<
        keyof AnalyticsSummary,
        string | null
    >;

    daily: {
        date: string;
        appointments: number;
        completed: number;
        revenue: string;
        clients: number;
    }[];

    statuses: {
        status: string;
        label: string;
        count: number;
    }[];

    services: AnalyticsGroup[];
    staff: AnalyticsGroup[];

    demand: {
        weekday: number;
        hour: number;
        count: number;
    }[];

    notes: string[];
}

export async function getAnalyticsBusinesses(
    signal?: AbortSignal
): Promise<AnalyticsOption[]> {
    const response = await api.get<{
        data: AnalyticsOption[];
    }>(
        '/api/appointments/analytics/businesses/',
        {
            withCredentials: true,
            signal,
        }
    );

    return response.data.data;
}

export async function getAnalyticsOptions(
    businessId: number,
    signal?: AbortSignal
): Promise<AnalyticsOptions> {
    const response = await api.get<AnalyticsOptions>(
        `/api/appointments/businesses/${businessId}/analytics/options/`,
        {
            withCredentials: true,
            signal,
        }
    );

    return response.data;
}

export async function getAnalytics(
    businessId: number,
    filters: AnalyticsFilters,
    signal?: AbortSignal
): Promise<AnalyticsReport> {
    const response = await api.get<AnalyticsReport>(
        `/api/appointments/businesses/${businessId}/analytics/`,
        {
            withCredentials: true,
            params: filters,
            signal,
        }
    );

    return response.data;
}

export async function downloadAnalytics(
    businessId: number,
    filters: AnalyticsFilters
): Promise<void> {
    const response = await api.get<Blob>(
        `/api/appointments/businesses/${businessId}/analytics/export/`,
        {
            withCredentials: true,
            params: filters,
            responseType: 'blob',
        }
    );

    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');

    link.href = url;
    link.download =
        `Kezek_Analytics_${businessId}_` +
        `${filters.date_from}_${filters.date_to}.xlsx`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}