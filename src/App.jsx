import React, { useState } from 'react';
import Login from './components/Login';
import ApplicationForm from './components/ApplicationForm';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = (data) => {
    setUserData(data);
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-emerald-50 font-sans text-gray-800 selection:bg-green-200 selection:text-green-900">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-900 tracking-tight mb-2 drop-shadow-sm">Army Public School</h1>
          <p className="text-lg md:text-xl text-green-700 font-semibold uppercase tracking-widest">Application Portal</p>
        </header>
        
        <main>
          {!isAuthenticated ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <ApplicationForm userData={userData} />
          )}
        </main>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Army Public School. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
