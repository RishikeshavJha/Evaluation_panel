import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Checks if entered 4-digit PIN matches the current time (HHMM in 12h or 24h format).
 * Includes a 1-minute grace window (+/- 1 minute) to handle minute rollover while typing.
 */
function isValidTimePin(enteredPin: string): boolean {
  if (!enteredPin || enteredPin.length !== 4) return false;

  // Static admin backup PIN overrides
  if (enteredPin === '1234' || enteredPin === '5507') return true;

  const now = new Date();
  const validPins = new Set<string>();

  // Check current minute and +/- 1 minute grace window
  [-1, 0, 1].forEach((minuteOffset) => {
    const d = new Date(now.getTime() + minuteOffset * 60 * 1000);
    const h24 = d.getHours();
    const h12 = (h24 % 12) || 12;
    const min = d.getMinutes();
    const minStr = String(min).padStart(2, '0');

    // 24-hour HHMM (e.g. 2351)
    validPins.add(String(h24).padStart(2, '0') + minStr);

    // 12-hour HHMM (e.g. 1151)
    validPins.add(String(h12).padStart(2, '0') + minStr);
  });

  return validPins.has(enteredPin.trim());
}

const LOCKOUT_KEY = 'teacher_pin_lockout_until';
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes

export default function PinPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [error, setError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { enterPin } = useAuth();
  const navigate = useNavigate();

  // Check persistent lockout on mount & tick countdown
  useEffect(() => {
    const checkLockout = () => {
      const storedLockout = localStorage.getItem(LOCKOUT_KEY);
      if (storedLockout) {
        const lockoutUntil = parseInt(storedLockout, 10);
        const diff = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (diff > 0) {
          setLockoutRemaining(diff);
          setError(`Too many wrong attempts. Access locked for ${diff}s.`);
          return true;
        } else {
          // Lockout expired
          localStorage.removeItem(LOCKOUT_KEY);
          setLockoutRemaining(0);
          setError('');
          setFailedAttempts(0);
        }
      }
      return false;
    };

    checkLockout();
    const timer = setInterval(() => {
      const isLocked = checkLockout();
      if (!isLocked) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerLockout = () => {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    localStorage.setItem(LOCKOUT_KEY, String(lockoutUntil));
    const seconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
    setLockoutRemaining(seconds);
    setError(`Too many wrong attempts. Access locked for ${seconds}s.`);
    setPin(['', '', '', '']);
  };

  const verifyPin = (enteredPin: string) => {
    if (lockoutRemaining > 0) return;

    if (isValidTimePin(enteredPin)) {
      setFailedAttempts(0);
      localStorage.removeItem(LOCKOUT_KEY);
      enterPin();
      navigate('/dashboard');
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        triggerLockout();
      } else {
        const remaining = 3 - newAttempts;
        setError(`Incorrect PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining before lockout.`);
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    if (lockoutRemaining > 0) return;

    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);
    if (!lockoutRemaining) setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every(digit => digit !== '')) {
      verifyPin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (lockoutRemaining > 0) return;

    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    const enteredPin = pin.join('');
    if (enteredPin.length < 4) {
      setError('Please enter all 4 digits of the PIN.');
      return;
    }
    verifyPin(enteredPin);
  };

  const isLocked = lockoutRemaining > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-lg text-center shadow-sm">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-lg ${
          isLocked ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
        }`}>
          {isLocked ? '🔒' : '⏱️'}
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {isLocked ? 'Access Locked' : 'Security PIN'}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {isLocked
            ? 'Too many failed login attempts. Please wait for the lockout timer to finish.'
            : 'Enter the PIN to access the dashboard.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                disabled={isLocked}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-2xl font-semibold border rounded-md focus:outline-none transition-all ${
                  isLocked
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className={`text-xs mb-4 p-2.5 rounded border font-medium ${
              isLocked
                ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLocked}
            className={`w-full font-medium py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm ${
              isLocked
                ? 'bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 cursor-pointer shadow-sm'
            }`}
          >
            {isLocked ? `Locked (${lockoutRemaining}s remaining)` : 'Verify & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
