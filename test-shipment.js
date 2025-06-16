const http = require('http');

const testShipmentData = {
  plannedShippingDate: '2024-01-15',
  productCode: 'P',
  shipper: {
    companyName: 'Test Company',
    fullName: 'John Doe',
    email: 'john@test.com',
    phone: '+977-1-1234567'
  },
  recipient: {
    companyName: 'Recipient Company',
    fullName: 'Jane Smith',
    email: 'jane@recipient.com',
    phone: '+61-2-9876543'
  },
  originAddress: {
    countryCode: 'NP',
    cityName: 'Kathmandu',
    postalCode: '44600',
    addressLine1: '123 Test Street'
  },
  destinationAddress: {
    countryCode: 'AU',
    cityName: 'Sydney',
    postalCode: '2000',
    addressLine1: '456 Recipient Street'
  },
  packages: [{
    weight: 1.5,
    length: 20,
    width: 15,
    height: 10,
    description: 'Test Package',
    declaredValue: 100
  }]
};

const postData = JSON.stringify(testShipmentData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/dhl/shipments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end(); 