import { Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/Auth/LoginPage';
import RegistrationPage from '../pages/Auth/RegistrationPage';
import Authorization from '../pages/Auth/Authorization';

import MainAppLayout from '../pages/MainAppLayout';

import Catalog from '../pages/Catalog';
import Favorites from '../pages/Favorites';
import Mybookings from '../pages/Mybookings';
import Booking from '../pages/Booking';

import Dashboard from '../pages/CRM/Dashboard';
import Mybusinesses from '../pages/CRM/Mybusinesses';
import Appointments from '../pages/CRM/Appointments';
import Services from '../pages/CRM/Services';
import Staff from '../pages/CRM/Staff';
import Settings from '../pages/CRM/Settings';
import Reviews from '../pages/CRM/Reviews';
import Home from '../pages/Home';
import AddStaf from '../pages/CRM/AddStaf';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '../context/UserContext';

import CrmPage from '../pages/CRM/Crm';
import EditStaff from '../pages/CRM/EditStaff';
import Schedule from '../pages/CRM/Schedule';
import EditAppointment from '../components/organisms/Crm/Appointments/Edit/EditAppointment';

import { setDefaultOptions } from 'date-fns';
import { ru } from 'date-fns/locale';

import BusinessOwnerRoute from '../routes/BusinessOwnerRoute';

const queryClient = new QueryClient();

function App() {
    setDefaultOptions({ locale: ru });

    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <Routes>

                    {/* Главный сайт + Navbar */}
                    <Route path="/" element={<MainAppLayout />}>

                        <Route
                            index
                            element={<Home />}
                        />

                        <Route
                            path="catalog"
                            element={<Catalog />}
                        />

                        <Route
                            path="favorites"
                            element={<Favorites />}
                        />

                        <Route
                            path="my-bookings"
                            element={<Mybookings />}
                        />
                        <Route
                            path="booking/:businessId"
                            element={<Booking />}
                        />

                        {/* Авторизация теперь внутри MainAppLayout */}
                        <Route
                            path="auth"
                            element={<Authorization />}
                        >
                            <Route
                                path="login"
                                element={<LoginPage />}
                            />

                            <Route
                                path="register"
                                element={<RegistrationPage />}
                            />
                        </Route>

                    </Route>


                    {/* Только business_owner */}
                    <Route element={<BusinessOwnerRoute />}>
                        <Route path="/crm" element={<CrmPage />}>

                            <Route
                                path="dashboard"
                                element={<Dashboard />}
                            />

                            <Route
                                path="my-businesses"
                                element={<Mybusinesses />}
                            />

                            <Route path="appointments">

                                <Route
                                    index
                                    element={<Appointments />}
                                />

                                <Route
                                    path="edit/:id"
                                    element={<EditAppointment />}
                                />

                            </Route>

                            <Route path="staff">

                                <Route
                                    index
                                    element={<Staff />}
                                />

                                <Route
                                    path="add"
                                    element={<AddStaf />}
                                />

                                <Route
                                    path="edit/:id"
                                    element={<EditStaff />}
                                />

                            </Route>

                            <Route
                                path="services"
                                element={<Services />}
                            />

                            <Route
                                path="schedule"
                                element={<Schedule />}
                            />

                            <Route
                                path="settings"
                                element={<Settings />}
                            />

                            <Route
                                path="reviews"
                                element={<Reviews />}
                            />

                        </Route>
                    </Route>

                </Routes>
            </UserProvider>
        </QueryClientProvider>
    );
}

export default App;