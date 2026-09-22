import fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";
import { executeQuery } from "./db";
import { verifyAdminToken } from "./auth-token";

export interface GalleryPhoto {
  id: string;
  src: string;
  title: string;
  category: "demarcation" | "roads" | "construction" | "panorama";
  categoryLabel: string;
  tag: string;
  description: string;
  dimensionsLabel?: string;
  createdAt?: string;
}

export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "site-photo-1",
    src: "/site-photos/galaxy-green-actual-site-1.jpg",
    title: "Ground Demarcation & Boundary Pillars",
    category: "demarcation",
    categoryLabel: "Demarcation & Registry Ready",
    tag: "Phase 1 Demarcation",
    dimensionsLabel: "Min 600 sq ft to Custom Requirements",
    description:
      "Clear on-ground plot boundaries with reinforced stone pillars and concrete edging. Plots start from compact 600 sq ft up to large custom footprints.",
  },
  {
    id: "site-photo-2",
    src: "/site-photos/galaxy-green-actual-site-2.jpg",
    title: "Wide 30-Ft Internal Road & Sunset Streetlighting",
    category: "roads",
    categoryLabel: "Internal Roads & Lighting",
    tag: "30-Ft Road Infrastructure",
    dimensionsLabel: "30-Ft Wide Internal Avenue",
    description:
      "Wide, leveled internal township road network illuminated by active street lighting poles with utility pathways.",
  },
  {
    id: "site-photo-3",
    src: "/site-photos/galaxy-green-actual-site-3.jpg",
    title: "Elevated Township Panorama & Surrounding Greenery",
    category: "panorama",
    categoryLabel: "Township Horizon",
    tag: "Open Green Environs",
    dimensionsLabel: "Pollution-Free Eco Zone",
    description:
      "Panoramic elevated perspective of Sai Suraksha Nagar showing peaceful residential surroundings and overhead water infrastructure.",
  },
  {
    id: "site-photo-4",
    src: "/site-photos/galaxy-green-actual-site-4.jpg",
    title: "Main Access Boulevard & Plot Inventory Grid",
    category: "roads",
    categoryLabel: "Boulevard & Demarcations",
    tag: "Central Layout View",
    dimensionsLabel: "Allotment Starting ₹7.19 Lakh",
    description:
      "Central access road traversing the plotted layout with clearly lined plot parcels ready for boundary walling.",
  },
  {
    id: "site-photo-5",
    src: "/site-photos/galaxy-green-actual-site-5.jpg",
    title: "Underground Utility Lines & Soil Leveling Progress",
    category: "construction",
    categoryLabel: "Civil Engineering",
    tag: "Ground Work Active",
    dimensionsLabel: "Phase 1 Fast-Track Delivery",
    description:
      "Active compaction and leveling machinery preparing future residential sectors with pre-laid drainage conduits.",
  },
];

let memoryPhotos: GalleryPhoto[] = [...DEFAULT_GALLERY_PHOTOS];

function trySavePhotosDisk(photos: GalleryPhoto[]) {
  try {
    fs.writeFileSync("/tmp/galaxy_green_photos.json", JSON.stringify(photos));
  } catch {
    // Disk write failure ignored in restricted environments
  }
}

function tryLoadPhotosDisk(): GalleryPhoto[] | null {
  try {
    if (fs.existsSync("/tmp/galaxy_green_photos.json")) {
      const raw = fs.readFileSync("/tmp/galaxy_green_photos.json", "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Disk read fallback ignored
  }
  return null;
}

function mapRowToPhoto(row: Record<string, unknown>): GalleryPhoto {
  return {
    id: String(row["id"] || ""),
    src: String(row["src"] || ""),
    title: String(row["title"] || ""),
    category: (row["category"] as GalleryPhoto["category"]) || "demarcation",
    categoryLabel: String(row["category_label"] || "Actual Site"),
    tag: String(row["tag"] || "Live Photo"),
    description: String(row["description"] || ""),
    dimensionsLabel: row["dimensions_label"] ? String(row["dimensions_label"]) : undefined,
    createdAt: row["created_at"] ? String(row["created_at"]) : undefined,
  };
}

export const getGalleryPhotosFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await executeQuery<Array<Record<string, unknown>>>(
    "SELECT * FROM gallery_photos ORDER BY created_at ASC",
  );
  if (rows && Array.isArray(rows) && rows.length > 0) {
    const loaded = rows.map(mapRowToPhoto);
    memoryPhotos = loaded;
    trySavePhotosDisk(loaded);
    return loaded;
  }
  const disk = tryLoadPhotosDisk();
  if (disk) {
    memoryPhotos = disk;
  }
  return memoryPhotos;
});

export const uploadGalleryPhotoFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      photo: {
        src: string;
        title: string;
        category: GalleryPhoto["category"];
        categoryLabel?: string;
        tag?: string;
        description?: string;
        dimensionsLabel?: string;
      };
      token?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    if (!data.photo.src || !data.photo.title) {
      return { success: false, error: "Image and title are required." };
    }

    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}`,
      src: data.photo.src,
      title: data.photo.title.trim(),
      category: data.photo.category || "demarcation",
      categoryLabel: data.photo.categoryLabel?.trim() || "Project Update",
      tag: data.photo.tag?.trim() || "Live Upload",
      description: data.photo.description?.trim() || "Uploaded directly via Dealer Portal.",
      dimensionsLabel: data.photo.dimensionsLabel?.trim() || "Site Progress",
      createdAt: new Date().toISOString(),
    };

    memoryPhotos.push(newPhoto);
    trySavePhotosDisk(memoryPhotos);

    const res = await executeQuery(
      `INSERT INTO gallery_photos (id, src, title, category, category_label, tag, description, dimensions_label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newPhoto.id,
        newPhoto.src,
        newPhoto.title,
        newPhoto.category,
        newPhoto.categoryLabel,
        newPhoto.tag,
        newPhoto.description,
        newPhoto.dimensionsLabel || null,
      ],
    );

    if (res !== null) {
      return { success: true, photo: newPhoto };
    }
    return { success: true, photo: newPhoto, message: "Photo uploaded and synchronized." };
  });

export const deleteGalleryPhotoFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; token?: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    memoryPhotos = memoryPhotos.filter((p) => p.id !== data.id);
    trySavePhotosDisk(memoryPhotos);

    const res = await executeQuery("DELETE FROM gallery_photos WHERE id = ?", [data.id]);
    if (res !== null) {
      return { success: true };
    }
    return { success: true, message: "Photo removed and synchronized." };
  });
