/**
 * Auth Screen — Google Sign-In (Tier 1)
 * 
 * First-time per device only. Persists indefinitely via Firebase Auth.
 * Section 11.1: "Once Google Sign-In succeeds on a given browser/device,
 * that browser/device must remember this sign-in indefinitely."
 */

import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { LogIn, Shield, Store } from 'lucide-react';

export default function AuthScreen() {
  const { setGoogleUser, navigateTo, setPinExists, setPinCheckComplete } = useAppStore();

  const handleSignIn = async () => {
    try {
      // Just sign in here. Do NOT decide pin-setup vs pin-lock from
      // localStorage — that's stale client state. App.tsx's
      // onAuthStateChanged listener is the single source of truth: it
      // fires as soon as signInWithPopup resolves, queries Firestore for
      // the real PIN state, and routes accordingly.
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
      // Fallback: allow demo mode without sign-in
      setGoogleUser({ uid: 'demo-user', email: 'demo@local', displayName: 'Demo User' });
      setPinExists(false);
      setPinCheckComplete(true);
      navigateTo('pin-setup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.1) 20px),
                           repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.1) 20px)`,
        }}
      />

      <div className="relative z-10 text-center max-w-md w-full">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-xl shadow-blue-900/50">
            <Store className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Sari-Sari Store
        </h1>
        <p className="text-blue-200/70 mb-1 text-sm">Grocery Budget Planner</p>
        <p className="text-blue-200/70 mb-8 text-sm">&amp; Sales Tracker</p>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h2 className="text-white font-semibold mb-2">Secure Sign-In Required</h2>
          <p className="text-gray-400 text-sm mb-4">
            Sign in with your Google account to access your store data.
            Your sign-in will be remembered on this device.
          </p>
          <Button
            onClick={handleSignIn}
            className="w-full bg-white text-slate-900 hover:bg-gray-100 font-semibold py-5 rounded-xl transition-all"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>
        </div>

        <button
          onClick={() => {
            setGoogleUser({ uid: 'demo-user', email: 'demo@local', displayName: 'Demo User' });
            setPinExists(false);
            setPinCheckComplete(true);
            navigateTo('pin-setup');
          }}
          className="text-blue-300/50 text-xs hover:text-blue-300 transition-colors"
        >
          Continue in demo mode (no sign-in required)
        </button>
      </div>
    </div>
  );
          }
            
