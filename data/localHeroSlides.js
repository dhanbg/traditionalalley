// ✅ PERFORMANCE: Using static images instead of heavy videos (6-9MB each)
// Videos can be re-enabled after optimization (compress to <2MB)

export const localHeroSlides = [
  {
    id: "local-1",
    documentId: "local-1",
    media: {
      url: "/images/jersey_teaser.png", // Teaser Campaign Image
      mime: "image/png",
      ext: ".png",
      name: "jersey_teaser.png",
    },
    mobileMedia: {
      url: "/images/jersey_teaser_mobile.png",
      mime: "image/png",
      ext: ".png",
      name: "jersey_teaser_mobile.png",
    },
    poster: {
      url: "/images/jersey_teaser_mobile.png",
    },
    alt: "World Cup Corset Jersey Teaser",
    subheading: "A NEW MATCHDAY ERA",
    heading: "SOMETHING\nICONIC\nIS COMING",
    description: "A bold new drop is on the horizon.\nDesigned for moments that matter.",
    btnText: "Notify Me",
    videoName: null,
    isTeaser: true, // Custom campaign trigger
  },
];

export default localHeroSlides;