export type User = {
    _id: string,
    name: string,
    email: string,
    role: string
}
export type Column = {
    _id: string;
    name: string;
    board: string;
    task: string[];

}
export type Board = {
    _id: string;
    name: string;
    members: User[];
    columns: string[]
}

type Comment = {
    _id: string
    user: User[],
    text: string
}
type Activity = {
    _id: string
    user: User[],
    action: string
}
export type Task = {
    title: string,
    description: string,
    priority: "Low" | "medium" | "high" | "critical",
    dueDate: Date,
    startDayte: Date,
    assignedTo: User[],
    column: Column[],
    board: Board[],
    subtasks: string[],
    attachment: [],
    comments: Comment[],
    activityLog: Activity[],
    labels: string

}