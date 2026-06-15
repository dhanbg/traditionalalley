const URL = "https://traditionalalley.com.np/api/nps-process-success";

async function run() {
  try {
    const payload = {
      merchantTxnId: "TXN-1780551762085-qhnoug45b",
      paymentData: {
        provider: "nps",
        merchantTxnId: "TXN-1780551762085-qhnoug45b",
        processId: "100010522164",
        status: "Success",
        amount: 10,
        recoveredUserBagId: "ei7z170bfkv6ag9h2gwe0uu7",
        timestamp: "2026-06-04T05:43:04.047Z"
      }
    };

    console.log(`Sending POST request to ${URL}...`);
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
