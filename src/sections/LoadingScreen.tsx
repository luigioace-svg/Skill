/**
 * Loading Screen — shown while data initializes from Firestore
 */

import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.1) 20px),
                           repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.1) 20px)`,
        }}
      />
      <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
      <p className="text-gray-400 text-sm">Loading your store data...</p>
    </div>
  );
}
