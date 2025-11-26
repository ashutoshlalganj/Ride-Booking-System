import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: send OTP, 2: reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/forgot-password`,
        { email }
      );
      setMessage(res.data.message || 'If this email exists, OTP has been sent.');
      setStep(2);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirm) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/reset-password`,
        { email, otp, password }
      );

      setMessage(res.data.message || 'Password reset successfully. You can now login.');
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Failed to reset password. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-7">
        <h1 className="text-2xl font-semibold mb-2 text-center">Forgot Password</h1>
        <p className="text-xs text-gray-500 mb-5 text-center">
          Enter your registered email. We&apos;ll send you an OTP to reset your password.
        </p>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Enter your email</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 bg-blue-50 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-lg"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Email (locked)
              </label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 outline-none text-gray-500"
                value={email}
                disabled
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">OTP</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 bg-blue-50 outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter OTP sent to email"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">New Password</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 bg-blue-50 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 bg-blue-50 outline-none"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-lg"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
