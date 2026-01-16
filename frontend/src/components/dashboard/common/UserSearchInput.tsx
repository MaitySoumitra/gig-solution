import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

interface SearchUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface UserSearchInputProps {
    onUserSelect: (user: SearchUser) => void;
    excludeUserIds: string[];
    includeUserIds?: string[]; // Fixed naming to camelCase
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({ onUserSelect, excludeUserIds, includeUserIds }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const delayMs = 500;
        const handler = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await axiosClient.get('/api/users/search', {
                    params: { query: searchTerm }
                });

                const data: SearchUser[] = response.data;

                // 2. CRITICAL FILTER: 
                // Only keep users who are in the 'includeUserIds' (Board Members)
                // AND not already assigned (excludeUserIds)
                const filteredResults = data.filter((user) => {
                    const isBoardMember = includeUserIds 
                        ? includeUserIds.includes(user._id) 
                        : true;
                    const isNotAlreadyAssigned = !excludeUserIds.includes(user._id);
                    
                    return isBoardMember && isNotAlreadyAssigned;
                });

                setSearchResults(filteredResults);
            } catch (err) {
                setError("Search failed");
            } finally {
                setIsLoading(false);
            }
        }, delayMs);

        return () => clearTimeout(handler);
    }, [searchTerm, excludeUserIds, includeUserIds]);

    const handleSelect = (user: SearchUser) => {
        onUserSelect(user);
        setSearchTerm('');
        setSearchResults([]);
    };

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search by Name or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 transition w-full text-black"
                disabled={isLoading && searchTerm === ''}
            />

            {isLoading && (
                <div className="absolute top-3 right-3 text-gray-500">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(user => (
                        <li
                            key={user._id}
                            onClick={() => handleSelect(user)}
                            className="p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200 flex flex-col text-black"
                        >
                            <span className="font-semibold text-gray-800">{user.name}</span>
                            <span className="text-sm text-gray-500">{user.email}</span>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            {searchTerm.length >= 2 && !isLoading && searchResults.length === 0 && !error && (
                <p className="p-3 text-sm text-gray-500 bg-white border border-gray-300 rounded-md mt-1 shadow-lg absolute z-10 w-full">
                    No board members found matching "{searchTerm}".
                </p>
            )}
        </div>
    );
};

export default UserSearchInput;