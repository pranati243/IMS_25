/**
 * Combines multiple class names into a single string
 */
export function classNames(
  ...classes: (string | boolean | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a number with commas for thousands
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Calculate percentage and format it
 */
export function calculatePercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Generate random colors for charts
 */
export function getRandomColors(count: number): string[] {
  const colors = [
    "#4f46e5", // indigo-600
    "#7c3aed", // violet-600
    "#2563eb", // blue-600
    "#9333ea", // purple-600
    "#c026d3", // fuchsia-600
    "#db2777", // pink-600
    "#e11d48", // rose-600
    "#f97316", // orange-500
    "#eab308", // yellow-500
    "#22c55e", // green-500
    "#06b6d4", // cyan-500
  ];

  // If we need more colors than in our predefined list, generate random ones
  if (count > colors.length) {
    const additionalColors = Array.from(
      { length: count - colors.length },
      () => {
        return `#${Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")}`;
      }
    );
    return [...colors, ...additionalColors];
  }

  return colors.slice(0, count);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
