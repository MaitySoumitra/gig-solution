import { useAppSelector } from "../../redux/app/hook";
import { CheckCircle } from "@phosphor-icons/react";
import { getAvatarColor } from "../../utils/avatarColor";

export const AllTable = () => {
  const user = useAppSelector((state) => state.login?.user);
  const tasks = useAppSelector((state) => state.task?.task) || [];

  // 1. Define roles
  const roles = [
    "Designer",
    "Developer",
    "Quality Testing",
    "Bussiness Analyst",
  ];

  const msToHours = (ms: number = 0) => (ms / (1000 * 60 * 60)).toFixed(1);

  const renderUserTable = (roleTitle: string, roleUsers: any[]) => (
    <div className="mb-10" key={roleTitle}>
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
        {roleTitle} Team Performance
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#000] border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-50 tracking-widest">
                Team Member
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-50 tracking-widest">
                Total Tasks
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-50 tracking-widest">
                Completed
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-50 tracking-widest">
                Remaining
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-50 tracking-widest">
                Logged Time
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-50 tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {roleUsers.map((u: any) => (
              <tr key={u._id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white border"
                      style={{
                        backgroundColor: getAvatarColor(u.name || "User"),
                      }}
                    >
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {u.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                  {u.stats.total}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                    <CheckCircle weight="fill" size={16} /> {u.stats.completed}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-amber-600 font-bold text-sm">
                    {u.stats.remaining}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {u.stats.totalLogged}h
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.stats.remaining === 0 && u.stats.total > 0 ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase">
                      All Done
                    </span>
                  ) : (
                    <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full transition-all"
                        style={{
                          width: `${(u.stats.completed / u.stats.total) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  // --- Logic to transform Tasks into User Stats ---
  const getRoleData = (roleName: string) => {
    const userMap: Record<string, any> = {};

    tasks.forEach((task: any) => {
      task.assignedTo?.forEach((member: any) => {
        if (member?.role === roleName) {
          if (!userMap[member._id]) {
            userMap[member._id] = {
              _id: member._id,
              name: member.name,
              stats: { total: 0, completed: 0, remaining: 0, totalLogged: 0 },
            };
          }

          userMap[member._id].stats.total += 1;

          // Logic for completion: Check progress or Column name
          // Assuming column name 'Done' or progress === 100
          if (
            task.progress === 100 ||
            task.column?.name?.toLowerCase() === "done"
          ) {
            userMap[member._id].stats.completed += 1;
          } else {
            userMap[member._id].stats.remaining += 1;
          }

          userMap[member._id].stats.totalLogged += Number(
            msToHours(task.timeManagement?.totalLoggedTime || 0),
          );
        }
      });
    });

    // Convert object back to array and fix decimals
    return Object.values(userMap).map((u: any) => ({
      ...u,
      stats: { ...u.stats, totalLogged: u.stats.totalLogged.toFixed(1) },
    }));
  };

  if (!user)
    return (
      <div className="p-10 text-center text-gray-400">
        Loading User Context...
      </div>
    );

  return (
    <div className="">
      {roles.map((role) => {
        const roleUsers = getRoleData(role);
        const isAuthorized =
          user.role === "admin" ||
          user.role === "super-admin" ||
          user.role === role;

        if (isAuthorized && roleUsers.length > 0) {
          return renderUserTable(role, roleUsers);
        }
        return null;
      })}
    </div>
  );
};