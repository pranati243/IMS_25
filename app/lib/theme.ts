export const departmentColors = {
  // Full names
  "Computer Engineering": {
    primary: "#2563eb", // Blue
    secondary: "#1d4ed8",
    light: "#dbeafe",
    dark: "#1e40af",
  },
  "Mechanical Engineering": {
    primary: "#16a34a", // Green
    secondary: "#15803d",
    light: "#dcfce7",
    dark: "#166534",
  },
  "Electronics and Telecommunication Engineering": {
    primary: "#f59e0b", // Yellow-Orange
    secondary: "#d97706",
    light: "#fef3c7",
    dark: "#92400e",
  },
  "Electrical Engineering": {
    primary: "#7c3aed", // Purple
    secondary: "#6d28d9",
    light: "#ede9fe",
    dark: "#5b21b6",
  },
  "Information Technology": {
    primary: "#dc2626", // Red
    secondary: "#b91c1c",
    light: "#fee2e2",
    dark: "#991b1b",
  },

  // Add abbreviations with the same color schemes
  CE: {
    primary: "#2563eb", // Blue (same as Computer Engineering)
    secondary: "#1d4ed8",
    light: "#dbeafe",
    dark: "#1e40af",
  },
  ME: {
    primary: "#16a34a", // Green (same as Mechanical Engineering)
    secondary: "#15803d",
    light: "#dcfce7",
    dark: "#166534",
  },
  ExTC: {
    primary: "#f59e0b", // Yellow-Orange (same as Electronics and Telecommunication Engineering)
    secondary: "#d97706",
    light: "#fef3c7",
    dark: "#92400e",
  },
  EE: {
    primary: "#7c3aed", // Purple (same as Electrical Engineering)
    secondary: "#6d28d9",
    light: "#ede9fe",
    dark: "#5b21b6",
  },
  IT: {
    primary: "#dc2626", // Red (same as Information Technology)
    secondary: "#b91c1c",
    light: "#fee2e2",
    dark: "#991b1b",
  },
};

export const commonStyles = {
  card: {
    base: "rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg",
    header: "text-xl font-semibold mb-4",
    content: "space-y-4",
  },
  button: {
    primary: "px-4 py-2 rounded-md font-medium transition-colors duration-200",
    secondary:
      "px-4 py-2 rounded-md font-medium border transition-colors duration-200",
  },
  table: {
    container: "w-full overflow-x-auto",
    table: "min-w-full divide-y divide-gray-200",
    header: "bg-gray-50",
    headerCell:
      "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
    row: "hover:bg-gray-50",
    cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
  },
  badge: {
    base: "px-2 py-1 text-xs font-medium rounded-full",
  },
  input: {
    base: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2",
  },
};

export const getDepartmentStyle = (departmentName: string) => {
  return (
    departmentColors[departmentName as keyof typeof departmentColors] || {
      primary: "#6b7280",
      secondary: "#4b5563",
      light: "#f3f4f6",
      dark: "#374151",
    }
  );
};
