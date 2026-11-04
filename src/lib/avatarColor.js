const colors = [
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-purple-500",
  "bg-lime-600",
  "bg-orange-500",
  "bg-teal-600",
  "bg-red-500",
  "bg-green-600",
  "bg-blue-500",
];

export function getAvatarColor(name) {
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}