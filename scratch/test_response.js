const URL = "https://traditionalalley.com.np/api/nps-response?MerchantTxnId=TXN-1780551762085-qhnoug45b&GatewayTxnId=100010522164&Amount=10&Status=Success";

async function run() {
  try {
    console.log(`Sending request to ${URL}...`);
    const response = await fetch(URL, {
      redirect: 'manual' // Prevent automatic redirect follow to inspect the location header
    });
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Redirect Location:`, response.headers.get('location'));
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
