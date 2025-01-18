import React, { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSupabase } from "./hooks/useSupabase";
import { loadGalleryImages, getGalleryTypes } from "./lib/api/gallery";
import { getTags } from "./lib/api/tags";
import { submitQuoteRequest } from "./lib/api/quotes";
import { PasswordEntry } from "./components/PasswordEntry";
import { ImageGrid } from "./components/ImageGrid";
import { WishlistGrid } from "./components/WishlistGrid";
import { Header } from "./components/Header";
import { AdminHeader } from "./components/AdminHeader";
import { AdminLogin } from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import { AccessCodes } from "./pages/admin/AccessCodes";
import { QuoteRequests } from "./pages/admin/QuoteRequests";
import { QuoteSuccess } from "./pages/QuoteSuccess";
import { AdminRoute } from "./components/AdminRoute";
import ImageModal from "./components/ImageModal";
import type { Image, WishlistItem, QuoteRequest } from "./types";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const { initialized, error } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [imageModalIndex, setImageModalIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGalleryType, setSelectedGalleryType] = useState<string | null>(
    null
  );
  const [galleryTypes, setGalleryTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const auth = localStorage.getItem("authenticated");
    if (auth === "true") {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialized && authenticated) {
      Promise.all([loadGalleryImages(), getGalleryTypes(), getTags()]).then(
        ([imagesData, typesData, tagsData]) => {
          setImages(imagesData);
          setGalleryTypes(typesData);
          setTags(tagsData);
          // Set first gallery type as default if available
          if (typesData.length > 0) {
            setSelectedGalleryType(typesData[0]);
          }
        }
      );
    }
  }, [initialized, authenticated]);

  const handleLogout = useCallback(() => {
    setAuthenticated(false);
    localStorage.removeItem("authenticated");
  }, []);

  const handleAccess = useCallback(() => {
    setAuthenticated(true);
    localStorage.setItem("authenticated", "true");
  }, []);

  const handleAddToWishlist = useCallback((image: Image) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === image.id);
      if (!exists) {
        const newItem: WishlistItem = { ...image, notes: "" };
        return [...prev, newItem];
      }
      return prev;
    });
  }, []);

  const handleRemoveFromWishlist = useCallback((id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateNotes = useCallback((id: string, notes: string) => {
    setWishlistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  }, []);

  const handleQuoteSubmit = useCallback(async (data: QuoteRequest) => {
    try {
      await submitQuoteRequest(data);
    } catch (error) {
      console.error("Error submitting quote:", error);
      throw error;
    }
  }, []);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
          <p className="text-red-200">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin">
            <Route path="login" element={<AdminLogin />} />
            <Route
              path="dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="access-codes"
              element={
                <AdminRoute>
                  <AccessCodes />
                </AdminRoute>
              }
            />
            <Route
              path="quotes"
              element={
                <AdminRoute>
                  <QuoteRequests />
                </AdminRoute>
              }
            />
          </Route>

          {/* Public Routes */}
          <Route
            path="/"
            element={
              authenticated ? (
                <>
                  <Header
                    wishlistCount={wishlistItems.length}
                    galleryTypes={galleryTypes}
                    selectedGalleryType={selectedGalleryType}
                    onSelectGalleryType={setSelectedGalleryType}
                  />
                  <AdminHeader />
                  <main className="pt-[72px] max-w-[1400px] mx-auto">
                    <ImageGrid
                      images={images}
                      wishlistIds={wishlistItems.map((item) => item.id)}
                      galleryTypes={galleryTypes}
                      selectedGalleryType={selectedGalleryType}
                      tags={tags}
                      selectedTags={selectedTags}
                      onAddToWishlist={handleAddToWishlist}
                      onRemoveFromWishlist={handleRemoveFromWishlist}
                      onLoadMore={() => {}}
                      setImageUrl={(url: string) => {
                        const index = images.findIndex(
                          (img) => img.url === url
                        );
                        if (index !== -1) {
                          setImageModalIndex(index);
                          setIsOpen(true);
                        }
                      }}
                      setIsOpen={setIsOpen}
                      onSelectGalleryType={setSelectedGalleryType}
                      onSelectTags={setSelectedTags}
                    />
                    <ImageModal
                      images={images}
                      index={imageModalIndex}
                      setIndex={setImageModalIndex}
                      isOpen={isOpen}
                      onClose={() => setIsOpen(false)}
                      wishlistIds={wishlistItems.map((item) => item.id)}
                      onAddToWishlist={handleAddToWishlist}
                      onRemoveFromWishlist={handleRemoveFromWishlist}
                    />
                  </main>
                </>
              ) : (
                <PasswordEntry onAccess={handleAccess} />
              )
            }
          />
          <Route
            path="/wishlist"
            element={
              authenticated ? (
                <>
                  <Header
                    wishlistCount={wishlistItems.length}
                    galleryTypes={galleryTypes}
                    selectedGalleryType={selectedGalleryType}
                    onSelectGalleryType={setSelectedGalleryType}
                  />
                  <AdminHeader />
                  <main className="pt-[72px] max-w-[1400px] mx-auto">
                    <WishlistGrid
                      items={wishlistItems}
                      onReorder={setWishlistItems}
                      onRemove={handleRemoveFromWishlist}
                      onUpdateNotes={handleUpdateNotes}
                      onQuoteSubmit={handleQuoteSubmit}
                    />
                  </main>
                </>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/quote-success" element={<QuoteSuccess />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}