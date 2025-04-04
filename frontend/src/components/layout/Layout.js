import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100" dir="rtl">
      <Navbar />
      <main className="container py-4 flex-grow-1">
        <Outlet />
      </main>
      <footer className="bg-light py-3 text-center">
        <div className="container">
          <p className="mb-0">سیستم مدیریت نگهبانان &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 