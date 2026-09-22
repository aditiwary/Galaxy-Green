import {
  getGalleryPhotosFn,
  uploadGalleryPhotoFn,
  deleteGalleryPhotoFn,
  DEFAULT_GALLERY_PHOTOS,
  type GalleryPhoto,
} from "./server-photos";

export type { GalleryPhoto };

const PHOTOS_STORAGE_KEY = "galaxy_green_photos_v1";

export async function fetchLiveGalleryPhotos(): Promise<GalleryPhoto[]> {
  try {
    const serverPhotos = await getGalleryPhotosFn();
    if (Array.isArray(serverPhotos) && serverPhotos.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(serverPhotos));
      }
      return serverPhotos;
    }
  } catch (err) {
    console.warn("Using local storage fallback for photos:", err);
  }

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as GalleryPhoto[];
      } catch {
        // ignore
      }
    }
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(DEFAULT_GALLERY_PHOTOS));
  }

  return DEFAULT_GALLERY_PHOTOS;
}

export async function uploadLivePhoto(
  photoInput: {
    src: string;
    title: string;
    category: GalleryPhoto["category"];
    categoryLabel?: string;
    tag?: string;
    description?: string;
    dimensionsLabel?: string;
  },
  token?: string,
): Promise<GalleryPhoto | null> {
  try {
    const res = await uploadGalleryPhotoFn({
      data: { photo: photoInput, ...(token ? { token } : {}) },
    });
    if (res?.success && res.photo) {
      if (typeof window !== "undefined") {
        try {
          const current = await fetchLiveGalleryPhotos();
          const updated = [res.photo, ...current.filter((p) => p.id !== res.photo.id)];
          localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent("gallery-updated"));
        } catch {
          // ignore
        }
      }
      return res.photo;
    }
    if (res?.error) {
      console.error("Failed to upload photo to database:", res.error);
    }
  } catch (err) {
    console.error("Server photo upload error:", err);
  }

  return null;
}

export async function removeLivePhoto(id: string, token?: string): Promise<boolean> {
  try {
    const res = await deleteGalleryPhotoFn({ data: { id, ...(token ? { token } : {}) } });
    if (res?.success) {
      if (typeof window !== "undefined") {
        try {
          const current = await fetchLiveGalleryPhotos();
          const updated = current.filter((p) => p.id !== id);
          localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent("gallery-updated"));
        } catch {
          // ignore
        }
      }
      return true;
    }
  } catch (err) {
    console.error("Server photo deletion error:", err);
  }

  return false;
}
