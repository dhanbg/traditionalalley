// ✅ PERFORMANCE: Using static images instead of heavy videos (6-9MB each)
// Videos can be re-enabled after optimization (compress to <2MB)

export const localHeroSlides = [
  {
    id: "local-1",
    documentId: "local-1",
    // ✅ Using static image instead of 6MB+ video
    media: {
      url: "/images/tafall.jpg", // Desktop image
      mime: "image/jpeg",
      ext: ".jpg",
      name: "tafall.jpg",
    },
    // Mobile image
    mobileMedia: {
      url: "/images/tamfall.jpg",
      mime: "image/jpeg",
      ext: ".jpg",
      name: "tamfall.jpg",
    },
    poster: {
      url: "/images/tafall.jpg",
    },
    alt: "hero-slide-1",
    subheading: "", // Empty - no subtitle
    heading: "", // Empty - no title
    btnText: "Shop Now",
    videoName: null,
  },
  // Second slide removed for cleaner, faster homepage
];

export default localHeroSlides;