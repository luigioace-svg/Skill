/**
 * PIN Screen — Tier 2 Access Control
 * 
 * Mode "setup": First-run PIN creation (Section 11.2)
 * Mode "lock": PIN entry on every fresh app open (Section 11.3)
 * 
 * The PIN is stored in Firestore, NOT in source code.
 * Session behavior: PIN resets when browser tab/window is fully closed.
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { usePinMutations } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';

interface PinScreenProps {
  mode: 'setup' | 'lock';
}

export default function PinScreen({ mode }: PinScreenProps) {
  const { googleUser, navigateTo, setPinVerified } = useAppStore();
  const { savePin, verifyPin } = usePinMutations(googleUser?.uid ?? null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>(mode === 'setup' ? 'enter' : 'enter');
  const [isSaving, setIsSaving] = useState(false);

  // Demo mode: skip PIN
  useEffect(() => {
    if (googleUser?.uid === 'demo-user' && mode === 'setup') {
      // Auto-create a demo PIN
      handleDemoSetup();
    }
  }, [googleUser, mode]);

  const handleDemoSetup = async () => {
    try {
      await savePin('0000');
      // Only reached if savePin genuinely resolved successfully.
      setPinVerified(true);
      navigateTo('home');
    } catch (err) {
      console.error('Demo PIN setup error:', err);
      setError('Could not set up demo access. Please try again.');
      toast.error('Could not set up demo access. Please try again.');
    }
  };

  const handleSetupSubmit = async () => {
    setError('');
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 characters');
      return;
    }
    if (step === 'enter') {
      setStep('confirm');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      setConfirmPin('');
      return;
    }
    setIsSaving(true);
    try {
      await savePin(pin);
      // Only navigate once savePin has genuinely resolved successfully.
      setPinVerified(true);
      navigateTo('home');
    } catch (err) {
      console.error('Save PIN error:', err);
      // TEMPORARY DIAGNOSTIC: show the real error message so it's visible
      // on mobile without needing desktop dev tools. Revert to a generic
      // message once the root cause is confirmed and fixed.
      const detail = err instanceof Error ? err.message : String(err);
      setError(`Could not save your PIN: ${detail}`);
      toast.error(`Could not save your PIN: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLockSubmit = async () => {
    setError('');
    if (currentPin.length !== 4) {
      setError('PIN must be exactly 4 characters');
      return;
    }
    setIsSaving(true);
    try {
      const valid = await verifyPin(currentPin);
      if (valid) {
        setPinVerified(true);
        navigateTo('home');
      } else {
        setError('Incorrect PIN. Please try again.');
        setCurrentPin('');
      }
    } catch (err) {
      console.error('Verify PIN error:', err);
      // TEMPORARY DIAGNOSTIC: show the real error message so it's visible
      // on mobile without needing desktop dev tools. Revert to a generic
      // message once the root cause is confirmed and fixed.
      const detail = err instanceof Error ? err.message : String(err);
      setError(`Could not verify your PIN: ${detail}`);
      toast.error(`Could not verify your PIN: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeypadPress = (key: string) => {
    if (mode === 'setup') {
      if (step === 'enter') {
        if (key === 'back') { setPin(pin.slice(0, -1)); }
        else if (pin.length < 4) { setPin(pin + key); }
      } else {
        if (key === 'back') { setConfirmPin(confirmPin.slice(0, -1)); }
        else if (confirmPin.length < 4) { setConfirmPin(confirmPin + key); }
      }
    } else {
      if (key === 'back') { setCurrentPin(currentPin.slice(0, -1)); }
      else if (currentPin.length < 4) { setCurrentPin(currentPin + key); }
    }
  };

  const displayValue = mode === 'setup'
    ? (step === 'enter' ? pin : confirmPin)
    : currentPin;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.1) 20px),
                           repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.1) 20px)`,
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {mode === 'lock' && (
          <button onClick={() => navigateTo('auth')} className="flex items-center text-blue-300/60 text-sm mb-4 hover:text-blue-300">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign-In
          </button>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'setup' ? 'Create Your PIN' : 'Enter PIN'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'setup'
              ? (step === 'enter' ? 'Choose a 4-character PIN' : 'Re-enter to confirm')
              : 'Enter your 4-character PIN to continue'}
          </p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-lg flex items-center justify-center text-xl font-bold border-2 transition-all ${
                i < displayValue.length
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-white/20 bg-white/5 text-transparent'
              }`}
            >
              {displayValue[i] || '•'}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key)}
              className="h-14 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-lg transition-colors border border-white/10"
            >
              {key}
            </button>
          ))}
          <button
            onClick={() => handleKeypadPress('0')}
            className="h-14 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-lg transition-colors border border-white/10 col-start-2"
          >
            0
          </button>
          <button
            onClick={() => handleKeypadPress('back')}
            className="h-14 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-colors border border-white/10"
          >
            ⌫
          </button>
        </div>

        <Button
          onClick={mode === 'setup' ? handleSetupSubmit : handleLockSubmit}
          disabled={displayValue.length !== 4 || isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-xl disabled:opacity-40"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === 'setup' ? (step === 'enter' ? 'Continue' : 'Saving...') : 'Verifying...'}
            </span>
          ) : (
            mode === 'setup' ? (step === 'enter' ? 'Continue' : 'Create PIN') : 'Unlock'
          )}
        </Button>

        {mode === 'setup' && step === 'confirm' && (
          <button
            onClick={() => { setStep('enter'); setConfirmPin(''); setError(''); }}
            disabled={isSaving}
            className="w-full text-center text-blue-400 text-sm mt-3 hover:text-blue-300 disabled:opacity-40"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}

  
