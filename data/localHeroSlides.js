// ✅ PERFORMANCE: Using static images instead of heavy videos (6-9MB each)
// Videos can be re-enabled after optimization (compress to <2MB)

export const localHeroSlides = [
  {
    id: "local-1",
    documentId: "local-1",
    media: {
      url: "/images/tafall.jpg",
      mime: "image/jpeg",
      ext: ".jpg",
      name: "tafall.jpg",
    },
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
    subheading: "",
    heading: "",
    btnText: "Shop Now",
    videoName: null,
  },
];

export default localHeroSlides;