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
    subheading: "New Collection",
    heading: "Discover Traditional\nElegance",
    btnText: "Shop Now",
    videoName: null,
  },
  {
    id: "local-2",
    documentId: "local-2",
    // Using slider image
    media: {
      url: "/images/slider/slider-women2.jpg",
      mime: "image/jpeg",
      ext: ".jpg",
      name: "slider-women2.jpg",
    },
    mobileMedia: {
      url: "/images/slider/slider-women2.jpg",
      mime: "image/jpeg",
      ext: ".jpg",
      name: "slider-women2.jpg",
    },
    poster: {
      url: "/images/slider/slider-women2.jpg",
    },
    alt: "hero-slide-2",
    subheading: "Premium Quality",
    heading: "Authentic Nepali\nFashion",
    btnText: "Explore",
    videoName: null,
  },
];

export default localHeroSlides;