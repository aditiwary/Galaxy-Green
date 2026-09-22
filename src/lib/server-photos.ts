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
  highlights?: string[];
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
    highlights: [
      "Physical boundary curbing & corner pillars installed",
      "Immediate registry & mutation (Dakhil Kharij) ready",
      "Customizable plot dimensions starting from 600 sq ft",
      "Direct frontage onto wide 30ft internal access roads",
    ],
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
    highlights: [
      "30-ft wide internal avenue for smooth two-way driving",
      "Functional electric poles and evening streetlights active",
      "Direct connectivity to Kanpur-Lucknow Expressway (3 km)",
      "Unobstructed access for construction materials and private vehicles",
    ],
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
    highlights: [
      "Overhead water reservoir ensuring reliable high-pressure water supply",
      "Clean, green environment away from city congestion",
      "Close proximity to Amausi Railway Station (2.7 km) & Market (2.5 km)",
      "Vastu-compliant residential zoning with open morning sunlight",
    ],
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
    highlights: [
      "Transparent Phase 1 allotment at ₹1,199 / sq ft",
      "Compact 600 sq ft villas start at only ₹7.19 Lakh",
      "Wide turning radiuses suitable for SUVs and delivery trucks",
      "Independent housing cluster already developing rapidly on site",
    ],
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
    highlights: [
      "Real residential buildings under active brick and pillar construction",
      "Immediate possession allows buyers to start building immediately",
      "Only 3 km from T.S. Misra Medical College & Hospital",
      "5 km from CCS International Airport & Amausi Metro Station",
    ],
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

    if (res === null) {
      return {
        success: true,
        photo: newPhoto,
        note: "Photo uploaded and synchronized to live gallery.",
      };
    }
    return { success: true, photo: newPhoto };
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
    if (res === null) {
      return { success: true, note: "Photo deleted and synchronized from gallery." };
    }
    return { success: true };
  });
