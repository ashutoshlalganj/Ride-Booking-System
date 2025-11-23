import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/forgot-password`,
        { email }
      );
      setMessage(res.data.message || 'If this email exists, reset link has been sent.');
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h1>
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block mb-1">Enter your email</label>
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
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

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
