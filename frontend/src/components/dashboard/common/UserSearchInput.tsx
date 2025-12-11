// src/components/common/UserSearchInput.tsx (VANILLA JS - NO LODASH)

import React, { useState, useEffect, useCallback } from 'react';
// import { debounce } from 'lodash'; // <-- REMOVED
import axiosClient from '../../api/axiosClient'; // <-- Keeping your axios client

// Define the shape of the user object returned from the backend search
interface SearchUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface UserSearchInputProps {
    onUserSelect: (userId: string) => void;
    excludeUserIds: string[];
}

// --- CORE SEARCH LOGIC FUNCTION (Non-debounced) ---
const executeSearch = async (query: string, excludeUserIds: string[], 
                             setResults: (data: SearchUser[]) => void, 
                             setLoading: (loading: boolean) => void, 
                             setError: (error: string | null) => void) => {
    
    if (query.length < 2) {
        setResults([]);
        return;
    }

    setLoading(true);
    setError(null);
    try {
        const response = await axiosClient.get('/api/users/search', {
            params: { query: query }
        });
        
        const data = response.data;

        const filteredResults = data.filter((user: SearchUser) => !excludeUserIds.includes(user._id));
        setResults(filteredResults);

    } catch (err) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to search users.';
        setError(errorMessage);
        setResults([]);
    } finally {
        setLoading(false);
    }
};

const UserSearchInput: React.FC<UserSearchInputProps> = ({ onUserSelect, excludeUserIds }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- VANILLA JS DEBOUNCE LOGIC using useEffect ---
    useEffect(() => {
        // 1. Skip search if query is too short or empty
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        // 2. Set the delay duration (e.g., 500ms)
        const delayMs = 500;
        
        // 3. Start the timer
        const handler = setTimeout(() => {
            // Execute the actual search logic after the delay
            executeSearch(searchTerm, excludeUserIds, setSearchResults, setIsLoading, setError);
        }, delayMs);

        // 4. Cleanup function: This runs if the component unmounts OR 
        //    if 'searchTerm' changes (meaning the user typed another key).
        //    It clears the previous timer, effectively implementing the debounce reset.
        return () => {
            clearTimeout(handler);
        };
        
    // Dependency array: Re-run effect when searchTerm or excludeUserIds changes.
    }, [searchTerm, excludeUserIds]);


    const handleSelect = (user: SearchUser) => {
        onUserSelect(user._id); // Pass the required ID back to the parent form
        setSearchTerm(''); // Clear the input field
        setSearchResults([]); // Clear the dropdown results
    };

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search by Name or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 transition w-full text-black-400"
                disabled={isLoading}
            />
            
            {/* Loading Indicator (Only show if search term is long enough AND loading) */}
            {isLoading && searchTerm.length >= 2 && (
                <div className="absolute top-0 right-0 p-3 text-gray-500">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            
            {/* Dropdown Results */}
            {searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(user => (
                        <li
                            key={user._id}
                            onClick={() => handleSelect(user)}
                            className="p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200 flex flex-col"
                        >
                            <span className="font-semibold text-gray-800">{user.name}</span>
                            <span className="text-sm text-gray-500">{user.email}</span>
                        </li>
                    ))}
                </ul>
            )}
            
            {/* Error Message */}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

             {/* No Results Message */}
             {searchTerm.length >= 2 && !isLoading && searchResults.length === 0 && !error && (
                <p className="p-3 text-sm text-gray-500 bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                    No users found matching "{searchTerm}".
                </p>
            )}
        </div>
    );
};

export default UserSearchInput;