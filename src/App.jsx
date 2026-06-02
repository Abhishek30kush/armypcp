import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import Login from './components/Login';
import ApplicationForm from './components/ApplicationForm';
import AdminDashboard from './components/AdminDashboard';
import { ContactUs, TermsConditions, RefundsCancellations } from './components/PolicyPages';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [portalOpen, setPortalOpen] = useState(true);
  const [loadingPortal, setLoadingPortal] = useState(true);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "portal"), (docSnap) => {
      if (docSnap.exists()) {
        setPortalOpen(docSnap.data().isOpen);
      } else {
        setPortalOpen(true);
      }
      setLoadingPortal(false);
    });
    return () => unsubSettings();
  }, []);

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
              {loadingPortal ? (
                <div className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">Checking portal status...</p>
                </div>
              ) : !portalOpen ? (
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 shadow-inner">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Portal is Currently Closed</h2>
                  <p className="text-gray-600 text-lg">We are not accepting any new applications at this time. Please check back later.</p>
                </div>
              ) : !isAuthenticated ? (
                <Login onLoginSuccess={handleLoginSuccess} />
              ) : (
                <ApplicationForm userData={userData} />
              )}
            </main>
            
            <footer className="mt-12 text-center text-gray-500 text-sm space-y-4">
              <p>&copy; {new Date().getFullYear()} Army Public School, Old Cantt, Prayagraj. All rights reserved.</p>
              <div className="flex justify-center space-x-6 text-green-700">
                <Link to="/contact" className="hover:underline">Contact Us</Link>
                <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
                <Link to="/refunds" className="hover:underline">Refunds & Cancellations</Link>
              </div>
            </footer>
          </div>
        } />

        {/* Admin Dashboard Route */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Policy Pages */}
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/refunds" element={<RefundsCancellations />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
