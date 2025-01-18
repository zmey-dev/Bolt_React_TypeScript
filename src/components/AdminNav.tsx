import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image, Settings, LogOut, FileText, Key } from 'lucide-react';
import { signOut } from '../lib/auth/session';

export function AdminNav() {
  const location = useLocation();
  
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
              <Settings className="w-5 h-5" />
              <span className="font-semibold">Admin Dashboard</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/admin/dashboard" 
              className={`flex items-center gap-2 hover:text-purple-400 transition-colors ${
                location.pathname === '/admin/dashboard' ? 'text-purple-400' : 'text-gray-300'
              }`}
            >
              <Image className="w-4 h-4" />
              Gallery Management
            </Link>

            <Link 
              to="/admin/access-codes" 
              className={`flex items-center gap-2 hover:text-purple-400 transition-colors ${
                location.pathname === '/admin/access-codes' ? 'text-purple-400' : 'text-gray-300'
              }`}
            >
              <Key className="w-4 h-4" />
              Access Codes
            </Link>

            <Link 
              to="/admin/quotes" 
              className={`flex items-center gap-2 hover:text-purple-400 transition-colors ${
                location.pathname === '/admin/quotes' ? 'text-purple-400' : 'text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Quote Requests
            </Link>
            
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
            >
              <Image className="w-4 h-4" />
              View Site
            </Link>
            
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}