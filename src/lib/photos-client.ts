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
  let created: GalleryPhoto | null = null;
  try {
    const res = await uploadGalleryPhotoFn({
      data: { photo: photoInput, ...(token ? { token } : {}) },
    });
    if (res?.photo) {
      created = res.photo;
    }
  } catch (err) {
    console.warn("Server photo upload fallback:", err);
  }

  if (!created) {
    created = {
      id: `photo-${Date.now()}`,
      src: photoInput.src,
      title: photoInput.title.trim(),
      category: photoInput.category,
      categoryLabel: photoInput.categoryLabel || "Actual Site",
      tag: photoInput.tag || "Live Upload",
      description: photoInput.description || "Uploaded via Dealer Portal",
      dimensionsLabel: photoInput.dimensionsLabel,
      createdAt: new Date().toISOString(),
    };
  }

  if (typeof window !== "undefined") {
    try {
      const current = await fetchLiveGalleryPhotos();
      const updated = [...current, created];
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("gallery-updated"));
    } catch {
      // ignore
    }
  }

  return created;
}

export async function removeLivePhoto(id: string, token?: string): Promise<boolean> {
  try {
    await deleteGalleryPhotoFn({ data: { id, ...(token ? { token } : {}) } });
  } catch (err) {
    console.warn("Server photo deletion fallback:", err);
  }

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
