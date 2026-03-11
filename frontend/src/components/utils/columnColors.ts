export const getColumnColor = (columnName: string) => {
  const name = columnName.toLowerCase();

  switch (name) {
    case "todo":
      return {
        header: "bg-blue-600",
        badge: "bg-blue-600",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-100",
      };

    case "in progress":
      return {
        header: "bg-yellow-500",
        badge: "bg-yellow-500",
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-100",
      };

    case "completed":
      return {
        header: "bg-green-600",
        badge: "bg-green-600",
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-100",
      };

    case "delay":
      return {
        header: "bg-red-600",
        badge: "bg-red-600",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-100",
      };

    default:
      return {
        header: "bg-gray-600",
        badge: "bg-gray-600",
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-100",
      };
  }
};