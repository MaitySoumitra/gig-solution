// src/pages/admin/CreateProjectPage.tsx (Renamed file and component)

import React from 'react';
import { useAppSelector } from '../../redux/app/hook';
import { CreateBoardForm } from '../../redux/features/Board/CreateBoardForm';

// RENAMED COMPONENT
const CreateProjectPage: React.FC = () => { 
    const { user } = useAppSelector(state => state.login);

    // Authorization check for the CREATE page (Good practice)
    if (user?.role !== 'super-admin' && user?.role !== 'admin' && user?.role !== 'Developer') {
        return (
            <div className="text-red-600 p-8">
                You do not have permission to create projects.
            </div>
        );
    }

    return (
        <div className="p-6"> {/* Added padding/container for better visual context */}
            <h2 className="text-3xl font-bold mb-6 text-gray-700">Create New Project</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-lg border border-gray-300">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                        Project Details
                    </h3>
                    <p className="mb-4 text-gray-600">
                        Use this form to start a new project and assign initial members.
                    </p>
                    <CreateBoardForm />
                </div>
                
                {/* System Summary is fine here for admin context */}
                <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-300">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                        Quick System Summary
                    </h3>
                    <div className="space-y-3">
                        <p className="text-gray-600">Total Users: <span className="font-bold text-gray-800">XX</span></p>
                        <p className="text-gray-600">Active Boards: <span className="font-bold text-gray-800">XX</span></p>
                        <p className="text-gray-600">Pending Tasks: <span className="font-bold text-gray-800">XX</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectPage; // Export the new name