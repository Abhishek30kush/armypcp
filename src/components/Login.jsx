import React, { useState } from 'react';
import { Mail, Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [method, setMethod] = useState('mobile'); // 'mobile' or 'email'
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!identifier) return;
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 1500);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true);
    // Mock Verification
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      setTimeout(() => {
        onLoginSuccess({ [method]: identifier });
      }, 1000);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="mb-8 text-center animate-fade-in-down">
        <h1 className="text-4xl font-extrabold text-green-800 drop-shadow-sm mb-2">Army Public School</h1>
        <p className="text-lg text-green-700 font-medium">Application Form Portal for PGT/TGT/PRT</p>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white p-8 transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login to Continue</h2>
        
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${method === 'mobile' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setMethod('mobile')}
              >
                Mobile Number
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${method === 'email' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setMethod('email')}
              >
                Email ID
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {method === 'mobile' ? 'Enter Mobile Number' : 'Enter Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  {method === 'mobile' ? <Phone size={20} /> : <Mail size={20} />}
                </div>
                <input
                  type={method === 'mobile' ? 'tel' : 'email'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white/50"
                  placeholder={method === 'mobile' ? 'e.g. 9876543210' : 'e.g. your@email.com'}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !identifier}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                <Lock size={24} />
              </div>
              <p className="text-gray-600 text-sm">
                We've sent an OTP to <span className="font-semibold text-gray-800">{identifier}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white/50"
                placeholder="0000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4 || verified}
              className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center ${
                verified 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : verified ? (
                <>
                  <CheckCircle2 size={24} className="mr-2" />
                  <span>Verified successfully!</span>
                </>
              ) : (
                'Verify & Proceed'
              )}
            </button>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setOtpSent(false)} 
                className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
              >
                Change {method === 'mobile' ? 'Mobile Number' : 'Email ID'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
