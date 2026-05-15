import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import ApplicationForm from './components/ApplicationForm';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = async (data) => {
    setUserData(data);
    setIsAuthenticated(true);
    
    // Store user info in Firestore (Optional metadata sync)
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await setDoc(doc(db, "users", data.uid), {
        email: data.email,
        lastLogin: serverTimestamp(),
        uid: data.uid
      }, { merge: true });
      console.log("User data synced to Firestore");
    } catch (err) {
      console.warn("User data sync failed (this usually doesn't block the app):", err);
    }

  };

  return (
    <div className="min-h-screen bg-emerald-50 font-sans text-gray-800 selection:bg-green-200 selection:text-green-900">
      <Routes>
        {/* User Application Route */}
        <Route path="/" element={
          <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-green-900 tracking-tight mb-2 drop-shadow-sm">
                Army Public School
                <span className="block text-2xl md:text-3xl mt-1 opacity-90">Old Cantt, Prayagraj</span>
              </h1>
              <p className="text-lg md:text-xl text-green-700 font-semibold uppercase tracking-widest">Application Portal</p>
            </header>
            
            <main>
              {!isAuthenticated ? (
                <Login onLoginSuccess={handleLoginSuccess} />
              ) : (
                <ApplicationForm userData={userData} />
              )}
            </main>
            
            <footer className="mt-12 text-center text-gray-500 text-sm space-y-2">
              <p>&copy; {new Date().getFullYear()} Army Public School, Old Cantt, Prayagraj. All rights reserved.</p>
            </footer>
          </div>
        } />

        {/* Admin Dashboard Route */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
