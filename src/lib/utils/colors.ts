// Expanded color palette
const TAG_COLORS = [
  'bg-red-500 text-red-100',
  'bg-red-600 text-red-100',
  'bg-orange-500 text-orange-100',
  'bg-orange-600 text-orange-100',
  'bg-amber-500 text-amber-100',
  'bg-amber-600 text-amber-100',
  'bg-yellow-500 text-yellow-100',
  'bg-yellow-600 text-yellow-100',
  'bg-lime-500 text-lime-100',
  'bg-lime-600 text-lime-100',
  'bg-green-500 text-green-100',
  'bg-green-600 text-green-100',
  'bg-emerald-500 text-emerald-100',
  'bg-emerald-600 text-emerald-100',
  'bg-teal-500 text-teal-100',
  'bg-teal-600 text-teal-100',
  'bg-cyan-500 text-cyan-100',
  'bg-cyan-600 text-cyan-100',
  'bg-sky-500 text-sky-100',
  'bg-sky-600 text-sky-100',
  'bg-blue-500 text-blue-100',
  'bg-blue-600 text-blue-100',
  'bg-indigo-500 text-indigo-100',
  'bg-indigo-600 text-indigo-100',
  'bg-violet-500 text-violet-100',
  'bg-violet-600 text-violet-100',
  'bg-purple-500 text-purple-100',
  'bg-purple-600 text-purple-100',
  'bg-fuchsia-500 text-fuchsia-100',
  'bg-fuchsia-600 text-fuchsia-100',
  'bg-pink-500 text-pink-100',
  'bg-pink-600 text-pink-100',
  'bg-rose-500 text-rose-100',
  'bg-rose-600 text-rose-100'
];

// Improved hashing function (djb2)
function hashString(str: string): number {
  let hash = 5381; // Initial hash value
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i); // XOR and multiply by a prime number
  }
  return hash >>> 0; // Ensure the hash is a non-negative integer
}

export function getTagColor(tag: string): string {
  const hash = hashString(tag);
  return TAG_COLORS[hash % TAG_COLORS.length];
}