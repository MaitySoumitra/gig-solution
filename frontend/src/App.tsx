// App.tsx (CORRECTED STRUCTURE)

import { useCurrentUser } from './components/api/useCurrentUser'
import { AdminDashboard } from './components/dashboard/admin/AdminDashboard';
import { IndexPage } from './components/pages/IndexPage'
// IMPORTANT: Remove { Routes, Route } imports from here!
// import { Routes, Route } from 'react-router-dom' // <-- DO NOT import/use Routes here

function App() {
    // 1. Run the working currentUser hook to start the session check
    const { isFetched } = useCurrentUser(); 
    
    // 2. Block rendering until the Redux state is updated (after API response)
    if (!isFetched) {
        // We use the same message as in IndexPage, but checking isFetched is cleaner
        return (
            <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
                Loading Application Session...
            </div>
        );
    }

    return <IndexPage/>
}

export default App