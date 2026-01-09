import {  useAppSelector } from "../../../redux/app/hook"

export const HomeTab = () => {
    const user = useAppSelector(state => state.login.user);
    
    return (
        <div className="flex h-screen w-full overflow-hidden"> 
            <div className="flex-1 p-6 overflow-y-auto">
                <h2 className="text-[25px] font-bold">Welcome 👋 {user?.name}</h2>
            </div>
        </div>
    );
};