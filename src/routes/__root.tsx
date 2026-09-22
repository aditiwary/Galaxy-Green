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
  name: "Galaxy Green Sai Suraksha Nagar - Freehold Plots Near Lucknow Airport",
  description:
    "Eco-luxury plotted township featuring freehold residential plots in Amausi, Lucknow near CCS International Airport. Immediate registry, 100% mutation (Dakhil Kharij), 30ft wide roads, and round-the-clock security.",
  url: "https://galaxygreenlucknow.com/",
  image:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=630&q=80",
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
      streetAddress: "Amausi, Near CCS International Airport",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      postalCode: "226008",
      addressCountry: "IN",
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
  image:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=630&q=80",
  telephone: "+91-90444-12642",
  url: "https://galaxygreenlucknow.com/",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Amausi, Near CCS International Airport",
    addressLocality: "Lucknow",
    addressRegion: "Uttar Pradesh",
    postalCode: "226008",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 26.7592,
    longitude: 80.8791,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
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
      item: "https://galaxygreenlucknow.com/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Lucknow Real Estate",
      item: "https://galaxygreenlucknow.com/#plots",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Plots in Amausi",
      item: "https://galaxygreenlucknow.com/#location",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Galaxy Green Sai Suraksha Nagar",
      item: "https://galaxygreenlucknow.com/",
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
        text: "Galaxy Green Sai Suraksha Nagar is located in Amausi, Lucknow — just 2.7 km from Amausi Railway Station, 3 km from T.S. Misra Medical College & Hospital, 3 km from Kanpur-Lucknow Expressway, 2.5 km from Main Market, and 5 km from CCS International Airport & Amausi Metro Station.",
      },
    },
    {
      "@type": "Question",
      name: "What is the plot rate per sq ft at Galaxy Green Sai Suraksha Nagar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plot prices start from ₹1,199 per sq ft for standard plots. Preferred location charges (PLC) apply for corner and park-facing plots. Plot sizes range from 1,000 sq ft to 2,000+ sq ft.",
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "Galaxy Green Sai Suraksha Nagar | Freehold Plots Near Lucknow Airport (Amausi)",
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
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      
      // Geographic SEO
      { name: "geo.region", content: "IN-UP" },
      { name: "geo.placename", content: "Lucknow" },
      { name: "geo.position", content: "26.7592;80.8791" },
      { name: "ICBM", content: "26.7592, 80.8791" },

      // OpenGraph
      { property: "og:site_name", content: "Galaxy Green Sai Suraksha Nagar" },
      {
        property: "og:title",
        content:
          "Galaxy Green Sai Suraksha Nagar | Freehold Plots Near Lucknow Airport",
      },
      {
        property: "og:description",
        content:
          "Eco-luxury freehold plots in Amausi, Lucknow with immediate registry, 30ft wide roads, 24/7 security & verified clear land titles.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://galaxygreenlucknow.com/" },
      { property: "og:locale", content: "en_IN" },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=630&q=80",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content:
          "Galaxy Green Sai Suraksha Nagar plotted township entrance and landscaped green boulevards",
      },

      // Twitter Cards
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content:
          "Galaxy Green Sai Suraksha Nagar | Plots Near Lucknow Airport",
      },
      {
        name: "twitter:description",
        content:
          "Freehold residential plots in Amausi, Lucknow. Immediate registry, 30ft roads, bank loan assistance & instant legal mutation.",
      },
      {
        name: "twitter:image",
        content:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=630&q=80",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://galaxygreenlucknow.com/",
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
