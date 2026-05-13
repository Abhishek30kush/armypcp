import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, CheckCircle2, Loader2, Info } from 'lucide-react';
import { auth } from '../firebase';
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink 
} from 'firebase/auth';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  // Handle the redirect back to the app
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let savedEmail = window.localStorage.getItem('emailForSignIn');
      if (!savedEmail) {
        savedEmail = window.prompt('Please provide your email for confirmation');
      }
      
      setLoading(true);
      signInWithEmailLink(auth, savedEmail, window.location.href)
        .then((result) => {
          window.localStorage.removeItem('emailForSignIn');
          onLoginSuccess(result.user);
        })
        .catch((err) => {
          console.error("Sign in error:", err);
          let userMessage = "The login link is invalid or has expired. Please request a new one.";
          if (err.code === 'auth/invalid-email') userMessage = "Email mismatch. Please use the same browser and email.";
          setError(userMessage);
          setLoading(false);
          // If mismatch, allow them to re-enter email
          if (err.code === 'auth/invalid-email') {
             const reEnteredEmail = window.prompt("Email mismatch. Please enter your email again to confirm:");
             if (reEnteredEmail) {
                signInWithEmailLink(auth, reEnteredEmail, window.location.href)
                  .then(r => onLoginSuccess(r.user))
                  .catch(e => setError("Failed again. Please request a new link."));
             }
          }
        });
    }
  }, [onLoginSuccess]);

  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    const actionCodeSettings = {
      url: window.location.origin, // Redirect back here
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (err) {
      console.error("Error sending link:", err);
      let userMessage = "Something went wrong. Please try again.";
      
      if (err.code === 'auth/operation-not-allowed') {
        userMessage = "Email login is currently being configured by the admin. Please try again in a few minutes.";
      } else if (err.code === 'auth/invalid-email') {
        userMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/network-request-failed') {
        userMessage = "Network error. Please check your internet connection.";
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome</h2>
          <p className="text-gray-500 mt-1">Please verify your identity to begin</p>
        </div>
        
        {!emailSent ? (
          <form onSubmit={handleSendLink} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3 mb-6">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                We use passwordless login. We'll send a verification link to your email to log you in securely.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white/50"
                  placeholder="e.g. candidate@example.com"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span>Send Login Link</span>
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We've sent a secure login link to:<br/>
              <span className="font-bold text-gray-900 break-all">{email}</span>
            </p>
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-500 mb-8">
              <p>Click the link in the email to log in automatically. If you don't see it, check your <b>Spam</b> folder.</p>
            </div>
            <button 
              onClick={() => setEmailSent(false)}
              className="w-full py-3 px-4 border border-green-200 text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all active:scale-95"
            >
              Change Email / Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
