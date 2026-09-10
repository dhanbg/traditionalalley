const fetchProductDetails = async () => {
  const url = "http://localhost:1337/api/products?filters[documentId][$eq]=h2mjo6wvr5al30akjd2ckq0g&populate[product_variants][populate]=*&populate[imgSrc][populate]=*";
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || ''}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (data.data?.length > 0) {
      const product = data.data[0];
      console.log("Product Title:", product.title);
      console.log("Product documentId:", product.documentId);
      console.log("Variants count:", product.product_variants?.length);
      product.product_variants?.forEach((v, idx) => {
        console.log(`Variant ${idx + 1}:`, {
          id: v.id,
          documentId: v.documentId,
          title: v.title,
          price: v.price,
          size_stocks: v.size_stocks,
          color: v.color?.name,
          imgSrc: v.imgSrc?.url
        });
      });
    }
  } catch (error) {
    console.error("Fetch failed:", error.message);
  }
};

fetchProductDetails();
