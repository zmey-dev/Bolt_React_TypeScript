import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image, Settings, LogOut, FileText, Key, Sparkles, Eye, Users } from 'lucide-react';
import { signOut } from '../lib/auth/session';
import { useAuth } from '../hooks/useAuth';

export function AdminNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  return (
    <nav className="bg-[#260000]/90 backdrop-blur-sm border-b border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20"> {/* Changed h-16 to h-20 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-yellow-400 hover:text-yellow-500">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Admin Dashboard</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/admin/dashboard" 
              className={`flex items-center gap-2 hover:text-yellow-400 transition-colors ${
                location.pathname === '/admin/dashboard' ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              <Image className="w-4 h-4" />
              Gallery Management
            </Link>

            {isAdmin && (
              <Link 
                to="/admin/affiliates" 
                className={`flex items-center gap-2 hover:text-yellow-400 transition-colors ${
                  location.pathname === '/admin/affiliates' ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Manage Affiliates
              </Link>
            )}

            <Link 
              to="/admin/access-codes" 
              className={`flex items-center gap-2 hover:text-yellow-400 transition-colors ${
                location.pathname === '/admin/access-codes' ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              <Key className="w-4 h-4" />
              Access Codes
            </Link>

            <Link 
              to="/admin/quotes" 
              className={`flex items-center gap-2 hover:text-yellow-400 transition-colors ${
                location.pathname === '/admin/quotes' ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Quote Requests
            </Link>
            
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Site
            </Link>
            
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors"
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