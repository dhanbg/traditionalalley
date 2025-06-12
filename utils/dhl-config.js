/**
 * DHL Express API Configuration
 * Uses environment variables for credentials
 */

const DHLConfig = {
    // === API CREDENTIALS ===
    // These are loaded from environment variables
    accountNumber: process.env.DHL_ACCOUNT_NUMBER || process.env.NEXT_PUBLIC_DHL_ACCOUNT_NUMBER,
    username: process.env.DHL_USERNAME || process.env.NEXT_PUBLIC_DHL_USERNAME,
    password: process.env.DHL_PASSWORD || process.env.NEXT_PUBLIC_DHL_PASSWORD,
    
    // === ENVIRONMENT ===
    production: (process.env.DHL_PRODUCTION || process.env.NEXT_PUBLIC_DHL_PRODUCTION) === 'true',
    
    // === API SETTINGS ===
    version: '2.12.0',
    timeout: 30000,
    
    // === DEFAULT VALUES ===
    defaults: {
        unitOfMeasurement: 'metric',
        currency: 'USD',
        countryCode: 'US',
        packageType: '3BX',
        serviceType: 'business',
        
        defaultDimensions: {
            length: 10,
            width: 10,
            height: 10
        },
        
        pickup: {
            closeTime: '18:00',
            location: 'reception',
            locationType: 'business'
        },
        
        labelSettings: {
            encodingFormat: 'pdf',
            templateName: 'ECOM26_84_001',
            printDPI: 300,
            numberOfCopies: 1
        }
    },
    
    // === COMMON PRODUCT CODES ===
    productCodes: {
        EXPRESS_WORLDWIDE: 'D',
        EXPRESS_12_00: 'T',
        EXPRESS_10_30: 'K',
        EXPRESS_DOMESTIC: 'N',
        ECONOMY_SELECT: 'W',
        BREAKBULK_EXPRESS: 'C',
        MEDICAL_EXPRESS: 'M',
        EXPRESS_ENVELOPE: 'X'
    },
    
    // === COMMON SERVICE CODES ===
    serviceCodes: {
        INSURANCE: 'II',
        SIGNATURE_ON_DELIVERY: 'SX',
        SATURDAY_DELIVERY: 'YK',
        DANGEROUS_GOODS: 'HB',
        PAPERLESS_TRADE: 'WY',
        WAYBILL_MESSAGE: 'WM',
        DELIVERY_SIGNATURE: 'SA'
    },
    
    // === PACKAGE TYPE CODES ===
    packageTypes: {
        BOX: '3BX',
        PIECE: 'PI',
        PALLET: 'PA',
        DOCUMENT: 'DOC',
        ENVELOPE: 'ENV',
        TUBE: 'TU',
        PARCEL: 'PC'
    },
    
    // === COUNTRY CODES (Sample) ===
    countryCodes: {
        'United States': 'US',
        'United Kingdom': 'GB',
        'Germany': 'DE',
        'France': 'FR',
        'Italy': 'IT',
        'Spain': 'ES',
        'Netherlands': 'NL',
        'Belgium': 'BE',
        'Canada': 'CA',
        'Australia': 'AU',
        'Japan': 'JP',
        'China': 'CN',
        'India': 'IN',
        'Brazil': 'BR',
        'Mexico': 'MX',
        'Czech Republic': 'CZ',
        'Poland': 'PL',
        'Sweden': 'SE',
        'Norway': 'NO',
        'Denmark': 'DK'
    },
    
    // === VALIDATION RULES ===
    validation: {
        maxWeight: 70,
        maxDimensions: {
            length: 120,
            width: 80,
            height: 80
        },
        maxDeclaredValue: 50000,
        minWeight: 0.1,
        
        address: {
            maxAddressLineLength: 45,
            maxCityNameLength: 45,
            maxCompanyNameLength: 100,
            maxFullNameLength: 255,
            maxPostalCodeLength: 12
        }
    },
    
    // === ERROR CODES ===
    errorCodes: {
        AUTHENTICATION_FAILED: 'AUTH001',
        INVALID_ACCOUNT: 'ACC001',
        INVALID_ADDRESS: 'ADDR001',
        INVALID_PACKAGE: 'PKG001',
        SERVICE_NOT_AVAILABLE: 'SVC001',
        RATE_LIMIT_EXCEEDED: 'RATE001',
        SYSTEM_ERROR: 'SYS001'
    }
};

export default DHLConfig; 