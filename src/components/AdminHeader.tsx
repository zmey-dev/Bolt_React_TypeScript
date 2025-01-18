import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

export function AdminHeader() {
  return (
    <div className="fixed top-0 right-0 z-50 p-4">
      <Link 
        to="/admin/login" 
        className="flex items-center gap-2 bg-gray-900/80 hover:bg-gray-800 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span>Admin</span>
      </Link>
    </div>
  );
}