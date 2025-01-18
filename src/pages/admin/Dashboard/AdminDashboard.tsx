import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { AdminNav } from '../../../components/AdminNav';
import { SortableGalleryGrid } from '../../../components/admin/SortableGalleryGrid';
import { TagManager } from '../../../components/admin/TagManager';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useGalleryData } from './hooks/useGalleryData';
import { useImageUpload } from './hooks/useImageUpload';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { loading: authLoading } = useAdminAuth(navigate);
  const { images, tags, loading: dataLoading, error, reloadData } = useGalleryData();
  const { uploading, handleUpload } = useImageUpload(images, reloadData);

  const loading = authLoading || dataLoading;

  return (
    <div className="min-h-screen bg-black">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TagManager 
              tags={tags} 
              onTagsChange={reloadData}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-white">Gallery Management</h1>
              
              <label className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                  multiple
                />
              </label>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-center gap-3 text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {uploading && (
              <div className="mb-8 p-4 bg-purple-900/30 border border-purple-500 rounded-lg flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading images...
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No images uploaded yet</p>
                <p className="text-sm">Upload your first image to get started</p>
              </div>
            ) : (
              <SortableGalleryGrid
                images={images}
                onReorder={reloadData}
                onDelete={reloadData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}