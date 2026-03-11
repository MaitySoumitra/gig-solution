// components/GlobalTopLoader.tsx

import { useAppSelector } from "../redux/app/hook";


export const GlobalTopLoader = () => {
  const activeRequests = useAppSelector((state) => state.ui.activeRequests);
  const isLoading = activeRequests > 0;

  return (
    <div className={`fixed top-0 left-0 z-[100] h-[3px] w-full transition-opacity duration-500 ${isLoading ? "opacity-100" : "opacity-0"}`}>
      <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse-fast w-full origin-left scale-x-[0.3]">
         {/* You can use a CSS animation to make this look like it's progressing */}
      </div>
    </div>
  );
};