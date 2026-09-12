import { useState, useRef } from 'react';
import type { KeyboardEvent, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const CORRECT_PIN = '1234'; // TODO: Replace with real auth check later

export default function PinPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { enterPin } = useAuth();
  const navigate = useNavigate();

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === CORRECT_PIN) {
      enterPin();
      navigate('/dashboard');
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every(digit => digit !== '')) {
      verifyPin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin.length < 4) {
      setError('Please enter all 4 digits.');
      return;
    }
    verifyPin(enteredPin);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-lg text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Enter PIN</h1>
        <p className="text-sm text-gray-500 mb-6">Please enter your 4-digit security PIN to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-500 mb-4">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
