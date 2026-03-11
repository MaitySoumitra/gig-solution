import { Navigate, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from './components/api/useCurrentUser'
import { Auth } from './components/redux/features/User/Auth';
import { useAppSelector } from './components/redux/app/hook';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { GlobalTopLoader } from './components/context/GlobalTopLoader';

function App() {
    const user = useAppSelector(state => state.login.user)

    const { isFetched } = useCurrentUser();
    if (!isFetched) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
                Loading Application Session...
            </div>
        );
    }
    return (
        <>
        <GlobalTopLoader/>
        <Routes>
            <Route path="/" element={<Auth />} />
            <Route
                path="/:role/dashboard/*"
                element={
                    user?.name ? (
                        <AdminDashboard />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </>
    )
}

export default App