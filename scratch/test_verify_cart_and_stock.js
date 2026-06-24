const checkHomepageStatus = async () => {
  const url = "http://localhost:3000/";
  console.log("Checking Next.js dev server status at:", url);
  try {
    const res = await fetch(url);
    console.log("Response status:", res.status);
    if (res.ok) {
      console.log("✅ Next.js server compiled successfully and returned 200 OK!");
    } else {
      console.log("❌ Server returned non-OK status:", res.status);
    }
  } catch (error) {
    console.error("❌ Failed to reach Next.js server:", error.message);
  }
};

checkHomepageStatus();
