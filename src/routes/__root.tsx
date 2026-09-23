import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportAppError } from "../lib/error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportAppError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const realEstateSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  name: "Galaxy Green Sai Suraksha Nagar - Freehold Plots Near Lucknow Airport, Uttar Pradesh, India",
  description:
    "Eco-luxury plotted township featuring freehold residential plots in Amausi, Lucknow, Uttar Pradesh, India near CCS International Airport. Immediate registry, 100% mutation (Dakhil Kharij), 30ft wide roads, and round-the-clock security.",
  url: "https://galaxygreen.in/",
  logo: "https://galaxygreen.in/galaxy-green-logo.jpg",
  image: "https://galaxygreen.in/galaxy-green-logo.jpg",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "INR",
    lowPrice: "719400",
    highPrice: "3500000",
    offerCount: "118",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "1199",
      priceCurrency: "INR",
      unitText: "SQFT",
    },
  },
  contentLocation: {
    "@type": "Place",
    name: "Galaxy Green Sai Suraksha Nagar",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Sai Suraksha Nagar, QR4X+39W, Amausi, Near Chaudhary Charan Singh International Airport",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      postalCode: "226008",
      addressCountry: "India",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 26.7592,
      longitude: 80.8791,
    },
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Galaxy Green Sai Suraksha Nagar Sales Office",
  logo: "https://galaxygreen.in/galaxy-green-logo.jpg",
  image: "https://galaxygreen.in/galaxy-green-logo.jpg",
  telephone: "+91-90444-12642",
  url: "https://galaxygreen.in/",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Sai Suraksha Nagar, QR4X+39W, Amausi, Near Chaudhary Charan Singh International Airport",
    addressLocality: "Lucknow",
    addressRegion: "Uttar Pradesh",
    postalCode: "226008",
    addressCountry: "India",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 26.7592,
    longitude: 80.8791,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://galaxygreen.in/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "India Real Estate",
      item: "https://galaxygreen.in/#about",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Uttar Pradesh Properties",
      item: "https://galaxygreen.in/#location",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Lucknow Freehold Plots",
      item: "https://galaxygreen.in/#masterplan",
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Amausi Plotted Township",
      item: "https://galaxygreen.in/#pricing",
    },
    {
      "@type": "ListItem",
      position: 6,
      name: "Galaxy Green Sai Suraksha Nagar",
      item: "https://galaxygreen.in/",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where is Galaxy Green Sai Suraksha Nagar located in Lucknow?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Galaxy Green Sai Suraksha Nagar is located in Amausi, Lucknow — just 2.7 km from Amausi Railway Station, 3 km from T.S. Mishra Medical College & Hospital, 3 km from Kanpur-Lucknow Expressway, 2.5 km from Main Market, and 5 km from CCS International Airport & Amausi Metro Station.",
      },
    },
    {
      "@type": "Question",
      name: "What is the plot rate per sq ft at Galaxy Green Sai Suraksha Nagar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plot prices start from ₹1,199 per sq ft for standard plots. Preferred location charges (PLC) apply for corner and park-facing plots. Plot sizes range from 600 sq ft to 2,000+ sq ft (with custom layouts available on buyer wish).",
      },
    },
    {
      "@type": "Question",
      name: "Are the plots freehold with immediate registry and mutation (Dakhil Kharij)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, 100% of the plots at Galaxy Green are freehold with immediate registry and clear Dakhil Kharij mutation. All legal documentation is completely transparent.",
      },
    },
    {
      "@type": "Question",
      name: "Is bank loan assistance available for plot purchase?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, our sales desk provides end-to-end loan assistance with major nationalized and private banking partners, offering flexible EMI financing options.",
      },
    },
    {
      "@type": "Question",
      name: "How can I schedule a personal site visit to Galaxy Green?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can schedule a personalized site tour directly on our website or by calling our sales office at +91 90444 12642. Our team is available 7 days a week from 9:00 AM to 6:30 PM to walk you through available plots and legal documentation.",
      },
    },
  ],
};

const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "SiteNavigationElement",
      position: 1,
      name: "About Township",
      description: "Overview of Galaxy Green Sai Suraksha Nagar plotted development",
      url: "https://galaxygreen.in/#about",
    },
    {
      "@type": "SiteNavigationElement",
      position: 2,
      name: "Master Plan & Live Inventory",
      description: "Interactive master layout and real-time plot status matrix",
      url: "https://galaxygreen.in/#masterplan",
    },
    {
      "@type": "SiteNavigationElement",
      position: 3,
      name: "Amenities & Infrastructure",
      description: "30ft wide roads, underground electrification, streetlights, gated security",
      url: "https://galaxygreen.in/#amenities",
    },
    {
      "@type": "SiteNavigationElement",
      position: 4,
      name: "Live Site Photos",
      description: "Real on-ground demarcation, boundary pillars, and road construction progress",
      url: "https://galaxygreen.in/#site-gallery",
    },
    {
      "@type": "SiteNavigationElement",
      position: 5,
      name: "Location & Connectivity",
      description: "Direct proximity to Lucknow Airport, Amausi Station, and Kanpur Expressway",
      url: "https://galaxygreen.in/#location",
    },
    {
      "@type": "SiteNavigationElement",
      position: 6,
      name: "EMI & ROI Calculator",
      description: "Calculate plot loan EMIs and conservative land value appreciation",
      url: "https://galaxygreen.in/#calculator",
    },
    {
      "@type": "SiteNavigationElement",
      position: 7,
      name: "Pricing & Registry",
      description: "Transparent plot allotment rates from ₹1,199/sq ft with immediate mutation",
      url: "https://galaxygreen.in/#pricing",
    },
    {
      "@type": "SiteNavigationElement",
      position: 8,
      name: "FAQ & Legal Trust",
      description: "Frequently asked questions regarding Dakhil Kharij, registry, and bank loans",
      url: "https://galaxygreen.in/#faq",
    },
    {
      "@type": "SiteNavigationElement",
      position: 9,
      name: "Schedule Site Visit",
      description: "Book a complimentary guided on-ground site visit with our property experts",
      url: "https://galaxygreen.in/#contact",
    },
  ],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      {
        title: "Galaxy Green | Freehold Plots Near Lucknow Airport · Amausi",
      },
      {
        name: "description",
        content:
          "Buy premium freehold residential plots at Galaxy Green Sai Suraksha Nagar, Amausi, Lucknow (near CCS International Airport). Immediate registry, 100% mutation (Dakhil Kharij), 30ft wide roads, bank loans available. Book your free site visit tour today!",
      },
      {
        name: "keywords",
        content:
          "plots in lucknow, residential plots amausi, plots near lucknow airport, galaxy green lucknow, sai suraksha nagar, freehold plots lucknow, immediate registry plots, dakhil kharij plots, buy plot kanpur road lucknow, investment plots lucknow, property near ccs airport",
      },
      { name: "author", content: "Galaxy Green Sai Suraksha Nagar" },
      {
        name: "theme-color",
        content: "#060d09",
      },
      {
        name: "msapplication-TileColor",
        content: "#060d09",
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "Galaxy Green",
      },
      {
        name: "format-detection",
        content: "telephone=no",
      },
      {
        name: "application-name",
        content: "Galaxy Green Plots Lucknow",
      },
      {
        name: "robots",
        content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      },

      // Geographic SEO - Lucknow, Uttar Pradesh, India
      { name: "geo.region", content: "IN-UP" },
      { name: "geo.placename", content: "Lucknow, Uttar Pradesh, India" },
      { name: "geo.position", content: "26.7592;80.8791" },
      { name: "ICBM", content: "26.7592, 80.8791" },
      {
        name: "address",
        content: "Sai Suraksha Nagar, QR4X+39W, Amausi, Lucknow, Uttar Pradesh 226008, India",
      },
      { name: "coverage", content: "Lucknow, Uttar Pradesh, India" },
      { name: "country", content: "India" },

      // OpenGraph
      { property: "og:site_name", content: "Galaxy Green Sai Suraksha Nagar · Lucknow, India" },
      {
        property: "og:title",
        content: "Galaxy Green | Freehold Residential Plots Near Lucknow Airport · Amausi, India",
      },
      {
        property: "og:description",
        content:
          "Eco-luxury freehold residential plots in Amausi, Lucknow, Uttar Pradesh, India (near CCS International Airport). Immediate registry, 100% Dakhil Kharij mutation, 30ft wide roads, 24/7 security & verified clear land titles.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://galaxygreen.in/" },
      { property: "og:locale", content: "en_IN" },
      {
        property: "og:image",
        content: "https://galaxygreen.in/galaxy-green-logo.jpg",
      },
      { property: "og:image:width", content: "1024" },
      { property: "og:image:height", content: "1024" },
      {
        property: "og:image:alt",
        content: "Galaxy Green Sai Suraksha Nagar Official Luxury Township Logo",
      },

      // Twitter Cards
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Galaxy Green | Plots Near Lucknow Airport · Uttar Pradesh, India",
      },
      {
        name: "twitter:description",
        content:
          "Freehold residential plots in Amausi, Lucknow, Uttar Pradesh, India. Immediate registry, 30ft roads, bank loan assistance & instant legal mutation.",
      },
      {
        name: "twitter:image",
        content: "https://galaxygreen.in/galaxy-green-logo.jpg",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://galaxygreen.in/",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(realEstateSchema),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessSchema),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(faqSchema),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(siteNavigationSchema),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
