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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <ApplicationForm userData={userData} />
        )}
      </div>
    </div>
  );
}

export default App;
