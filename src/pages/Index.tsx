import React from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <header className="w-full py-6 bg-blue-600 text-white text-center">
        <h1 className="text-4xl font-bold">FocusFlare</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Welcome to FocusFlare</h2>
        <p className="text-xl text-gray-600 mb-6">
          Your ultimate task management solution. Start organizing your tasks efficiently and boost your productivity!
        </p>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700"
          onClick={handleGetStarted}
        >
          Get Started
        </button>
      </main>
      <footer className="w-full py-4 bg-gray-200 text-center">
        <p className="text-gray-600">&copy; 2025 FocusFlare. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
