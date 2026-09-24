import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function generateBrochure() {
  const pdfDoc = await PDFDocument.create();

  // Page setup: A4 dimensions in points: 595.28 x 841.89
  const width = 595.28;
  const height = 841.89;

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Brand Palette
  const darkGreen = rgb(7 / 255, 21 / 255, 16 / 255);       // #071510
  const emerald = rgb(16 / 255, 185 / 255, 129 / 255);      // #10b981
  const emeraldLight = rgb(236 / 255, 253 / 255, 245 / 255);// #ecfdf5
  const gold = rgb(217 / 255, 149 / 255, 33 / 255);         // #d99521
  const goldLight = rgb(254 / 255, 243 / 255, 199 / 255);   // #fef3c7
  const charcoal = rgb(30 / 255, 41 / 255, 59 / 255);       // #1e293b
  const muted = rgb(100 / 255, 116 / 255, 139 / 255);       // #64748b
  const white = rgb(1, 1, 1);
  const lightBg = rgb(248 / 255, 250 / 255, 252 / 255);     // #f8fafc
  const borderLight = rgb(226 / 255, 232 / 255, 240 / 255); // #e2e8f0

  // Load logo images if available
  const logoPath = path.resolve(process.cwd(), "public/galaxy-green-emblem.png");
  let emblemImage = null;
  if (fs.existsSync(logoPath)) {
    try {
      const emblemBytes = fs.readFileSync(logoPath);
      emblemImage = await pdfDoc.embedPng(emblemBytes);
    } catch (e) {
      console.warn("Could not embed emblem PNG:", e.message);
    }
  }

  const sitePhotoPath = path.resolve(process.cwd(), "public/site-photos/galaxy-green-actual-site-1.jpg");
  let sitePhotoImage = null;
  if (fs.existsSync(sitePhotoPath)) {
    try {
      const photoBytes = fs.readFileSync(sitePhotoPath);
      sitePhotoImage = await pdfDoc.embedJpg(photoBytes);
    } catch (e) {
      console.warn("Could not embed site photo:", e.message);
    }
  }

  // ==========================================
  // PAGE 1: Master Overview & Pricing Matrix
  // ==========================================
  const page1 = pdfDoc.addPage([width, height]);

  // Top luxury bar
  page1.drawRectangle({
    x: 0,
    y: height - 120,
    width,
    height: 120,
    color: darkGreen,
  });

  // Gold accent line under header
  page1.drawRectangle({
    x: 0,
    y: height - 123,
    width,
    height: 3,
    color: gold,
  });

  // Emblem Image in header
  if (emblemImage) {
    page1.drawImage(emblemImage, {
      x: 35,
      y: height - 95,
      width: 65,
      height: 65,
    });
  }

  // Header Title
  page1.drawText("GALAXY GREEN", {
    x: 115,
    y: height - 52,
    size: 22,
    font: fontBold,
    color: white,
  });

  page1.drawText("SAI SURAKSHA NAGAR — OFFICIAL PROJECT PROSPECTUS", {
    x: 115,
    y: height - 70,
    size: 10,
    font: fontBold,
    color: emerald,
  });

  page1.drawText("Eco-Luxury Freehold Plotted Township · Amausi, Lucknow", {
    x: 115,
    y: height - 86,
    size: 9,
    font: fontRegular,
    color: rgb(203 / 255, 213 / 255, 225 / 255),
  });

  // Badge Top Right
  page1.drawRectangle({
    x: width - 155,
    y: height - 85,
    width: 120,
    height: 36,
    color: rgb(15 / 255, 45 / 255, 34 / 255),
    borderColor: emerald,
    borderWidth: 1,
  });
  page1.drawText("PHASE 1 ALLOTMENT", {
    x: width - 147,
    y: height - 63,
    size: 8,
    font: fontBold,
    color: emerald,
  });
  page1.drawText("Rs. 1,199 / Sq. Ft.", {
    x: width - 147,
    y: height - 77,
    size: 10,
    font: fontBold,
    color: white,
  });

  // Section 1: Strategic Location & Connectivity
  let curY = height - 155;
  page1.drawText("1. STRATEGIC CONNECTIVITY & LOCATION HIGHLIGHTS", {
    x: 35,
    y: curY,
    size: 12,
    font: fontBold,
    color: darkGreen,
  });

  curY -= 6;
  page1.drawLine({
    start: { x: 35, y: curY },
    end: { x: width - 35, y: curY },
    thickness: 1,
    color: borderLight,
  });

  curY -= 20;

  // Connectivity Cards (2x2 mini grid)
  const locItems = [
    { title: "Airport Proximity", desc: "5 Mins from Chaudhary Charan Singh Int'l Airport" },
    { title: "Metro Transit", desc: "4 Mins from Amausi Metro Station (North-South Corridor)" },
    { title: "Highway Corridor", desc: "Direct 40-ft wide boulevard link to Shaheed Path / Kanpur Rd" },
    { title: "Commercial Hub", desc: "Surrounded by premium educational institutes & hospital facilities" },
  ];

  locItems.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const boxX = 35 + col * 265;
    const boxY = curY - row * 45;

    page1.drawRectangle({
      x: boxX,
      y: boxY - 32,
      width: 255,
      height: 38,
      color: lightBg,
      borderColor: borderLight,
      borderWidth: 0.8,
    });

    page1.drawText(`[+] ${item.title}`, {
      x: boxX + 8,
      y: boxY - 14,
      size: 9,
      font: fontBold,
      color: darkGreen,
    });
    page1.drawText(item.desc, {
      x: boxX + 8,
      y: boxY - 26,
      size: 7.5,
      font: fontRegular,
      color: muted,
    });
  });

  curY -= 105;

  // Section 2: Plot Specifications & Pricing Matrix
  page1.drawText("2. PHASE 1 PLOT DIMENSIONS & PRICING MATRIX", {
    x: 35,
    y: curY,
    size: 12,
    font: fontBold,
    color: darkGreen,
  });

  curY -= 6;
  page1.drawLine({
    start: { x: 35, y: curY },
    end: { x: width - 35, y: curY },
    thickness: 1,
    color: borderLight,
  });

  curY -= 24;

  // Table Header
  const tableX = 35;
  const tableWidth = width - 70;
  const colWidths = [120, 105, 150, 150];

  page1.drawRectangle({
    x: tableX,
    y: curY - 20,
    width: tableWidth,
    height: 24,
    color: darkGreen,
  });

  page1.drawText("PLOT AREA", { x: tableX + 10, y: curY - 13, size: 8.5, font: fontBold, color: white });
  page1.drawText("DIMENSIONS", { x: tableX + 130, y: curY - 13, size: 8.5, font: fontBold, color: white });
  page1.drawText("TYPOLOGY / SUITABILITY", { x: tableX + 235, y: curY - 13, size: 8.5, font: fontBold, color: white });
  page1.drawText("TOTAL VALUE (@ Rs. 1,199)", { x: tableX + 385, y: curY - 13, size: 8.5, font: fontBold, color: emerald });

  curY -= 20;

  const plotRows = [
    { area: "600 Sq. Ft.", dim: "20 ft x 30 ft", type: "Starter Compact Duplex", val: "Rs. 7,19,400" },
    { area: "800 Sq. Ft.", dim: "20 ft x 40 ft", type: "Standard Residential Plot", val: "Rs. 9,59,200" },
    { area: "1,000 Sq. Ft.", dim: "25 ft x 40 ft", type: "Most In-Demand Villa Plot", val: "Rs. 11,99,000" },
    { area: "1,200 Sq. Ft.", dim: "30 ft x 40 ft", type: "Spacious Independent Villa", val: "Rs. 14,38,800" },
    { area: "1,500 Sq. Ft.", dim: "30 ft x 50 ft", type: "Executive Luxury Estate", val: "Rs. 17,98,500" },
    { area: "2,000 Sq. Ft.", dim: "40 ft x 50 ft", type: "Grand Corner / Boulevard Estate", val: "Rs. 23,98,000" },
  ];

  plotRows.forEach((row, idx) => {
    const rowBg = idx % 2 === 0 ? white : lightBg;
    page1.drawRectangle({
      x: tableX,
      y: curY - 22,
      width: tableWidth,
      height: 22,
      color: rowBg,
      borderColor: borderLight,
      borderWidth: 0.5,
    });

    page1.drawText(row.area, { x: tableX + 10, y: curY - 14, size: 8.5, font: fontBold, color: darkGreen });
    page1.drawText(row.dim, { x: tableX + 130, y: curY - 14, size: 8.5, font: fontRegular, color: charcoal });
    page1.drawText(row.type, { x: tableX + 235, y: curY - 14, size: 8, font: fontRegular, color: muted });
    page1.drawText(row.val, { x: tableX + 385, y: curY - 14, size: 9, font: fontBold, color: darkGreen });

    curY -= 22;
  });

  curY -= 20;

  // Photo Section or Site Visual
  if (sitePhotoImage) {
    page1.drawText("3. ACTUAL ON-SITE INFRASTRUCTURE PROGRESS", {
      x: 35,
      y: curY,
      size: 12,
      font: fontBold,
      color: darkGreen,
    });

    curY -= 6;
    page1.drawLine({
      start: { x: 35, y: curY },
      end: { x: width - 35, y: curY },
      thickness: 1,
      color: borderLight,
    });

    curY -= 15;

    const imgHeight = 160;
    const imgWidth = tableWidth;
    page1.drawImage(sitePhotoImage, {
      x: tableX,
      y: curY - imgHeight,
      width: imgWidth,
      height: imgHeight,
    });

    curY -= imgHeight + 15;

    page1.drawText("* Ground reality photo: Wide demarcated asphalt boulevards, solar streetlights, and green boundary walls.", {
      x: 35,
      y: curY,
      size: 7.5,
      font: fontOblique,
      color: muted,
    });
  }

  // Page 1 Footer
  page1.drawLine({
    start: { x: 35, y: 35 },
    end: { x: width - 35, y: 35 },
    thickness: 0.8,
    color: borderLight,
  });
  page1.drawText("Galaxy Green Sai Suraksha Nagar · Official Project Prospectus", {
    x: 35,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: muted,
  });
  page1.drawText("Page 1 of 2", {
    x: width - 80,
    y: 22,
    size: 7.5,
    font: fontBold,
    color: darkGreen,
  });

  // ==========================================
  // PAGE 2: Amenities, Legal Assurances & Booking
  // ==========================================
  const page2 = pdfDoc.addPage([width, height]);

  // Page 2 Header Banner (Slim)
  page2.drawRectangle({
    x: 0,
    y: height - 60,
    width,
    height: 60,
    color: darkGreen,
  });
  page2.drawRectangle({
    x: 0,
    y: height - 63,
    width,
    height: 3,
    color: gold,
  });

  page2.drawText("GALAXY GREEN — INFRASTRUCTURE, LEGAL & BOOKING CREDENTIALS", {
    x: 35,
    y: height - 38,
    size: 11,
    font: fontBold,
    color: white,
  });
  page2.drawText("Sai Suraksha Nagar, Amausi, Lucknow · Verified Freehold Plotted Community", {
    x: 35,
    y: height - 50,
    size: 8,
    font: fontRegular,
    color: emerald,
  });

  curY = height - 90;

  // Section 4: Township Infrastructure & Amenities
  page2.drawText("4. MASTER INFRASTRUCTURE & RESIDENT AMENITIES", {
    x: 35,
    y: curY,
    size: 12,
    font: fontBold,
    color: darkGreen,
  });

  curY -= 6;
  page2.drawLine({
    start: { x: 35, y: curY },
    end: { x: width - 35, y: curY },
    thickness: 1,
    color: borderLight,
  });

  curY -= 20;

  const amenities = [
    { title: "40-ft Grand Boulevard", desc: "Main arterial boulevard paved with heavy-duty asphalt and stormwater drainage." },
    { title: "30-ft Internal Paver Lanes", desc: "Interlocking concrete paver internal avenues with underground utility corridors." },
    { title: "24/7 RFID Security Checkpoint", desc: "Grand entrance gateway with gated access control and manned security guards." },
    { title: "Perimeter Boundary & CCTV", desc: "Secured high perimeter boundary walls with continuous day/night CCTV monitoring." },
    { title: "Landscaped Central Park", desc: "Flower beds, shaded sit-outs, walking track, and manicured green spaces." },
    { title: "Dedicated Children Play Area", desc: "Safe recreational grounds with swings, slides, and non-slip safety grass." },
    { title: "Underground Utilities", desc: "Dedicated underground power conduits and pre-laid potable water supply pipelines." },
    { title: "Solar LED Streetlights", desc: "Autonomous dusk-to-dawn solar street illumination on every avenue and corner." },
  ];

  amenities.forEach((amenity, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const boxX = 35 + col * 265;
    const boxY = curY - row * 52;

    page2.drawRectangle({
      x: boxX,
      y: boxY - 42,
      width: 255,
      height: 46,
      color: lightBg,
      borderColor: borderLight,
      borderWidth: 0.8,
    });

    page2.drawText(`*  ${amenity.title}`, {
      x: boxX + 8,
      y: boxY - 16,
      size: 9,
      font: fontBold,
      color: darkGreen,
    });
    page2.drawText(amenity.desc, {
      x: boxX + 16,
      y: boxY - 30,
      size: 7.5,
      font: fontRegular,
      color: muted,
    });
  });

  curY -= 230;

  // Section 5: Legal & Title Transparency
  page2.drawText("5. 100% LEGAL TITLE & BANK APPROVAL GUARANTEES", {
    x: 35,
    y: curY,
    size: 12,
    font: fontBold,
    color: darkGreen,
  });

  curY -= 6;
  page2.drawLine({
    start: { x: 35, y: curY },
    end: { x: width - 35, y: curY },
    thickness: 1,
    color: borderLight,
  });

  curY -= 22;

  const legalAssurances = [
    { title: "100% Freehold Ownership", text: "Zero leasehold encumbrances. Complete land title is vested permanently with the buyer." },
    { title: "Immediate Registry & Dakhil Kharij", text: "Registry documentation ready on demand with official mutation (Dakhil Kharij) recorded." },
    { title: "Pre-Approved Bank Loans (Up to 80%)", text: "Verified and eligible for home and land loans with leading PSU and private banks (SBI, HDFC, PNB, ICICI)." },
    { title: "Physically Demarcated Boundaries", text: "Every plot is pre-demarcated with solid concrete boundary corner pillars on site." },
  ];

  legalAssurances.forEach((item) => {
    page2.drawRectangle({
      x: 35,
      y: curY - 30,
      width: width - 70,
      height: 32,
      color: goldLight,
      borderColor: rgb(251 / 255, 191 / 255, 36 / 255),
      borderWidth: 0.8,
    });

    page2.drawText(`[CONFIRMED]  ${item.title}:`, {
      x: 45,
      y: curY - 14,
      size: 8.5,
      font: fontBold,
      color: rgb(146 / 255, 64 / 255, 14 / 255),
    });
    page2.drawText(item.text, {
      x: 45,
      y: curY - 24,
      size: 8,
      font: fontRegular,
      color: charcoal,
    });

    curY -= 38;
  });

  curY -= 15;

  // Section 6: Contact & Site Office Booking
  page2.drawRectangle({
    x: 35,
    y: curY - 130,
    width: width - 70,
    height: 135,
    color: darkGreen,
  });

  page2.drawRectangle({
    x: 40,
    y: curY - 125,
    width: width - 80,
    height: 125,
    borderColor: emerald,
    borderWidth: 1,
  });

  page2.drawText("BOOK YOUR SITE VISIT & PRIORITY PLOT ALLOTMENT", {
    x: 60,
    y: curY - 24,
    size: 12,
    font: fontBold,
    color: gold,
  });

  page2.drawText("Developer & Managing Director: Vishal Singh", {
    x: 60,
    y: curY - 45,
    size: 10,
    font: fontBold,
    color: white,
  });

  page2.drawText("Direct Hotline & WhatsApp: +91 90444 12642", {
    x: 60,
    y: curY - 62,
    size: 10,
    font: fontBold,
    color: emerald,
  });

  page2.drawText("Site Office Address: QR4X+39W, Sai Suraksha Nagar, Amausi, Lucknow, UP 226008", {
    x: 60,
    y: curY - 78,
    size: 8.5,
    font: fontRegular,
    color: rgb(203 / 255, 213 / 255, 225 / 255),
  });

  page2.drawText("Official Web Portal: https://galaxygreen.in", {
    x: 60,
    y: curY - 94,
    size: 8.5,
    font: fontRegular,
    color: rgb(203 / 255, 213 / 255, 225 / 255),
  });

  page2.drawText("Visiting Hours: Monday to Sunday, 09:00 AM – 06:30 PM (Free Pickup & Drop Available)", {
    x: 60,
    y: curY - 110,
    size: 8,
    font: fontOblique,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  // Page 2 Footer
  page2.drawLine({
    start: { x: 35, y: 35 },
    end: { x: width - 35, y: 35 },
    thickness: 0.8,
    color: borderLight,
  });
  page2.drawText("Galaxy Green Sai Suraksha Nagar · Official Project Prospectus 2026", {
    x: 35,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: muted,
  });
  page2.drawText("Page 2 of 2", {
    x: width - 80,
    y: 22,
    size: 7.5,
    font: fontBold,
    color: darkGreen,
  });

  // Save the PDF bytes
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.resolve(process.cwd(), "public/Galaxy_Green_Sai_Suraksha_Nagar_Brochure.pdf");
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`[SUCCESS] PDF generated at: ${outputPath} (${pdfBytes.length} bytes)`);
}

generateBrochure().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
