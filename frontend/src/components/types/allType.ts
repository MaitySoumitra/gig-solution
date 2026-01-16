export type User = {
    _id: string;
    name: string;
    email: string;
    role: string;
};

export type Column = {
    _id: string;
    name: string;
    board: string;
};

export type Board = {
    _id: string;
    name: string;
    members: User[];
    columns: Column[];
};


export type DailyLog = {
    date: string;    
    duration: number; 
};

export type TimeManagement = {
    estimatedTime: number;    
    totalLoggedTime: number;
    delay:number;  
    dailyLogs: DailyLog[];    
    activeStartTime: string | null; 
    isRunning: boolean;      
};

export type Comment = {
    _id: string;
    user: User; 
    text: string;
    createdAt: string;
};

export type Activity = {
    _id: string;
    user: User; 
    action: string;
    createdAt: string;
    details?: {
        field: string;
        oldValue: any;
        newValue: any;
    };
};

export type Label = {
    name: string;
    color: string;
};

export type Attachment = {
    _id: string;
    fileName: string;
    fileUrl: string;
    uploadedBy: User;
};

export type Subtask = { 
    _id?: string;
    title: string; 
    isCompleted: boolean;
};

export type Task = {
    _id: string;
    title: string;
    progress: number;
    description: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    dueDate: string | Date; 
    startDate: string | Date;
    assignedTo: User[];
    column: any; 
    board: any;  
    subtasks: Subtask[];
    attachments: Attachment[]; 
    comments: Comment[];
    activityLog: Activity[];
    labels: Label[];
    position: number;
    timeManagement?: TimeManagement; 
    createdAt: string;
    updatedAt: string;
};