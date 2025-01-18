// Array of tailwind color classes for tags
const TAG_COLORS = [
  'bg-red-500/20 text-red-300',
  'bg-orange-500/20 text-orange-300',
  'bg-amber-500/20 text-amber-300',
  'bg-yellow-500/20 text-yellow-300',
  'bg-lime-500/20 text-lime-300',
  'bg-green-500/20 text-green-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-teal-500/20 text-teal-300',
  'bg-cyan-500/20 text-cyan-300',
  'bg-sky-500/20 text-sky-300',
  'bg-blue-500/20 text-blue-300',
  'bg-indigo-500/20 text-indigo-300',
  'bg-violet-500/20 text-violet-300',
  'bg-purple-500/20 text-purple-300',
  'bg-fuchsia-500/20 text-fuchsia-300',
  'bg-pink-500/20 text-pink-300',
  'bg-rose-500/20 text-rose-300'
];

// Get a consistent color for a given string (same tag always gets same color)
export function getTagColor(tag: string): string {
  const hash = tag.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}