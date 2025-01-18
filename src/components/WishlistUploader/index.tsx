// ... existing imports ...

export function WishlistUploader({ onUpload }: WishlistUploaderProps) {
  // ... existing state ...

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Generate UUID for the image
      const imageId = uuidv4();
      const image = await uploadWishlistImage(file, imageId);

      // Create wishlist item with all required fields
      const wishlistItem: WishlistItem = {
        id: imageId,
        url: image.url,
        title: file.name.split(".")[0] || "Custom Upload",
        description: "",
        width: 800,
        height: 600,
        notes: "",
        isCustomUpload: true,
      };

      onUpload(wishlistItem);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // ... rest of the component stays the same ...
}
