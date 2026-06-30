const URL = "https://traditionalalley.com.np/api/nps-process-success";

async function run() {
  try {
    const payload = {
      merchantTxnId: "TXN-1782258781379-lxg33pubh",
      paymentData: {
        provider: "nps",
        merchantTxnId: "TXN-1782258781379-lxg33pubh",
        processId: "100010522164",
        status: "Success",
        amount: 10,
        recoveredUserBagId: "uenzdhr6orpj67y7s5kuqs5t",
        timestamp: "2026-06-24T05:39:20.528Z"
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
