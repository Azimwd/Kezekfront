
    
  
import { api } from './api';


export type OnboardingStepKey =
    | 'create_business'
    | 'create_service'
    | 'create_staff'
    | 'assign_service'
    | 'setup_schedule'
    | 'setup_booking'
    | 'test_booking';


export interface OnboardingStep {
    key: OnboardingStepKey;
    title: string;
    description: string;
    completed: boolean;
    route: string;
}


export interface BusinessOwnerOnboarding {
    completed: boolean;
    dismissed: boolean;
    progress: number;
    completed_steps: number;
    total_steps: number;
    current_step: OnboardingStepKey | null;
    business_id: number | null;
    business_name: string | null;
    steps: OnboardingStep[];
}


export const getBusinessOwnerOnboarding =
    async (): Promise<BusinessOwnerOnboarding> => {

        const response =
            await api.get(
                '/api/onboarding/business-owner/',
                {
                    withCredentials: true
                }
            );

        return response.data.data;
    };


export const completeBookingSettingsOnboarding =
    async (): Promise<BusinessOwnerOnboarding> => {

        const response =
            await api.patch(
                '/api/onboarding/business-owner/booking-settings/complete/',
                {},
                {
                    withCredentials: true
                }
            );

        return response.data.data;
    };


export const dismissBusinessOwnerOnboarding =
    async (): Promise<BusinessOwnerOnboarding> => {

        const response =
            await api.patch(
                '/api/onboarding/business-owner/dismiss/',
                {},
                {
                    withCredentials: true
                }
            );

        return response.data.data;
    };
