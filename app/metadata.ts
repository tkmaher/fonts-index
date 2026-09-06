import { Metadata } from "next";

export const staticMetadata: Metadata = {
    metadataBase: new URL("https://tkmaher.github.io/fonts-index/"),
    applicationName: "fonts index",
    title: {
      template: 'fonts index | %s',
      default: 'fonts index',
    },
    description: "A comprehensive survey of the fonts used by modern websites.",
    keywords: ["design", "font", "web", "application", "tech"],
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      googleBot: "index, follow"
    },
    openGraph: {
      locale: "en_US",
      siteName: "fonts index",
      url: "https://tkmaher.github.io/fonts-index/",
      type: "website",
      images: [
        {
          url: "https://tkmaher.github.io/fonts-index/ogimage.png",
          width: 1200,
          height: 630,
          alt: "fonts index"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "fonts index",
      
      images: [
        {
          url: "https://tkmaher.github.io/fonts-index/ogimage.png",
          width: 1200,
          height: 630,
          alt: "fonts index"
        }
      ]
    }
    
  };

  export const viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    interactiveWidget: "resizes-content",
  };