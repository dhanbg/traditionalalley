// Local hero slides configuration using videos from public/images/video
// Each slide provides desktop `media` and mobile `mobileMedia` sources.

export const localHeroSlides = [
  {
    id: "local-1",
    documentId: "local-1",
    // Desktop video
    media: {
      url: "/images/video/tavideo1.mp4",
      mime: "video/mp4",
      ext: ".mp4",
      name: "tavideo1.mp4",
    },
    // Mobile video
    mobileMedia: {
      url: "/images/video/tam1.mp4",
      mime: "video/mp4",
      ext: ".mp4",
      name: "tam1.mp4",
    },
    // Optional poster fallback image (can be any local image)
    poster: {
      url: "/images/slider/slider-women2.jpg",
    },
    alt: "hero-video-1",
    subheading: "",
    heading: "",
    btnText: "Shop Now",
    // Use mobileMedia name as videoName per your schema
    videoName: "tam1.mp4",
  },
  {
    id: "local-2",
    documentId: "local-2",
    media: {
      url: "/images/video/tavideo2.mp4",
      mime: "video/mp4",
      ext: ".mp4",
      name: "tavideo2.mp4",
    },
    mobileMedia: {
      url: "/images/video/tam2.mp4",
      mime: "video/mp4",
      ext: ".mp4",
      name: "tam2.mp4",
    },
    poster: {
  url: "/images/slider/slider-women2.jpg",
    },
    alt: "hero-video-2",
    subheading: "",
    heading: "",
    btnText: "Shop Now",
    videoName: "tam2.mp4",
  },
];

export default localHeroSlides;