/**
 * Countries and Cities API Service
 * Provides comprehensive country and city data for shipping destinations
 */

// Comprehensive countries list with shipping-relevant information
export const countries = [
  // Asia-Pacific
  { code: 'AF', name: 'Afghanistan', region: 'Asia', continent: 'Asia' },
  { code: 'AU', name: 'Australia', region: 'Oceania', continent: 'Australia' },
  { code: 'BD', name: 'Bangladesh', region: 'Asia', continent: 'Asia' },
  { code: 'BT', name: 'Bhutan', region: 'Asia', continent: 'Asia' },
  { code: 'BN', name: 'Brunei', region: 'Asia', continent: 'Asia' },
  { code: 'KH', name: 'Cambodia', region: 'Asia', continent: 'Asia' },
  { code: 'CN', name: 'China', region: 'Asia', continent: 'Asia' },
  { code: 'FJ', name: 'Fiji', region: 'Oceania', continent: 'Australia' },
  { code: 'HK', name: 'Hong Kong', region: 'Asia', continent: 'Asia' },
  { code: 'IN', name: 'India', region: 'Asia', continent: 'Asia' },
  { code: 'ID', name: 'Indonesia', region: 'Asia', continent: 'Asia' },
  { code: 'JP', name: 'Japan', region: 'Asia', continent: 'Asia' },
  { code: 'KZ', name: 'Kazakhstan', region: 'Asia', continent: 'Asia' },
  { code: 'KR', name: 'South Korea', region: 'Asia', continent: 'Asia' },
  { code: 'KG', name: 'Kyrgyzstan', region: 'Asia', continent: 'Asia' },
  { code: 'LA', name: 'Laos', region: 'Asia', continent: 'Asia' },
  { code: 'MO', name: 'Macau', region: 'Asia', continent: 'Asia' },
  { code: 'MY', name: 'Malaysia', region: 'Asia', continent: 'Asia' },
  { code: 'MV', name: 'Maldives', region: 'Asia', continent: 'Asia' },
  { code: 'MN', name: 'Mongolia', region: 'Asia', continent: 'Asia' },
  { code: 'MM', name: 'Myanmar', region: 'Asia', continent: 'Asia' },
  { code: 'NP', name: 'Nepal', region: 'Asia', continent: 'Asia' },
  { code: 'NZ', name: 'New Zealand', region: 'Oceania', continent: 'Australia' },
  { code: 'PK', name: 'Pakistan', region: 'Asia', continent: 'Asia' },
  { code: 'PG', name: 'Papua New Guinea', region: 'Oceania', continent: 'Australia' },
  { code: 'PH', name: 'Philippines', region: 'Asia', continent: 'Asia' },
  { code: 'SG', name: 'Singapore', region: 'Asia', continent: 'Asia' },
  { code: 'LK', name: 'Sri Lanka', region: 'Asia', continent: 'Asia' },
  { code: 'TW', name: 'Taiwan', region: 'Asia', continent: 'Asia' },
  { code: 'TJ', name: 'Tajikistan', region: 'Asia', continent: 'Asia' },
  { code: 'TH', name: 'Thailand', region: 'Asia', continent: 'Asia' },
  { code: 'TL', name: 'Timor-Leste', region: 'Asia', continent: 'Asia' },
  { code: 'TM', name: 'Turkmenistan', region: 'Asia', continent: 'Asia' },
  { code: 'UZ', name: 'Uzbekistan', region: 'Asia', continent: 'Asia' },
  { code: 'VN', name: 'Vietnam', region: 'Asia', continent: 'Asia' },

  // Europe
  { code: 'AL', name: 'Albania', region: 'Europe', continent: 'Europe' },
  { code: 'AD', name: 'Andorra', region: 'Europe', continent: 'Europe' },
  { code: 'AM', name: 'Armenia', region: 'Europe', continent: 'Europe' },
  { code: 'AT', name: 'Austria', region: 'Europe', continent: 'Europe' },
  { code: 'AZ', name: 'Azerbaijan', region: 'Europe', continent: 'Europe' },
  { code: 'BY', name: 'Belarus', region: 'Europe', continent: 'Europe' },
  { code: 'BE', name: 'Belgium', region: 'Europe', continent: 'Europe' },
  { code: 'BA', name: 'Bosnia and Herzegovina', region: 'Europe', continent: 'Europe' },
  { code: 'BG', name: 'Bulgaria', region: 'Europe', continent: 'Europe' },
  { code: 'HR', name: 'Croatia', region: 'Europe', continent: 'Europe' },
  { code: 'CY', name: 'Cyprus', region: 'Europe', continent: 'Europe' },
  { code: 'CZ', name: 'Czech Republic', region: 'Europe', continent: 'Europe' },
  { code: 'DK', name: 'Denmark', region: 'Europe', continent: 'Europe' },
  { code: 'EE', name: 'Estonia', region: 'Europe', continent: 'Europe' },
  { code: 'FI', name: 'Finland', region: 'Europe', continent: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe', continent: 'Europe' },
  { code: 'GE', name: 'Georgia', region: 'Europe', continent: 'Europe' },
  { code: 'DE', name: 'Germany', region: 'Europe', continent: 'Europe' },
  { code: 'GR', name: 'Greece', region: 'Europe', continent: 'Europe' },
  { code: 'HU', name: 'Hungary', region: 'Europe', continent: 'Europe' },
  { code: 'IS', name: 'Iceland', region: 'Europe', continent: 'Europe' },
  { code: 'IE', name: 'Ireland', region: 'Europe', continent: 'Europe' },
  { code: 'IT', name: 'Italy', region: 'Europe', continent: 'Europe' },
  { code: 'LV', name: 'Latvia', region: 'Europe', continent: 'Europe' },
  { code: 'LI', name: 'Liechtenstein', region: 'Europe', continent: 'Europe' },
  { code: 'LT', name: 'Lithuania', region: 'Europe', continent: 'Europe' },
  { code: 'LU', name: 'Luxembourg', region: 'Europe', continent: 'Europe' },
  { code: 'MT', name: 'Malta', region: 'Europe', continent: 'Europe' },
  { code: 'MD', name: 'Moldova', region: 'Europe', continent: 'Europe' },
  { code: 'MC', name: 'Monaco', region: 'Europe', continent: 'Europe' },
  { code: 'ME', name: 'Montenegro', region: 'Europe', continent: 'Europe' },
  { code: 'NL', name: 'Netherlands', region: 'Europe', continent: 'Europe' },
  { code: 'MK', name: 'North Macedonia', region: 'Europe', continent: 'Europe' },
  { code: 'NO', name: 'Norway', region: 'Europe', continent: 'Europe' },
  { code: 'PL', name: 'Poland', region: 'Europe', continent: 'Europe' },
  { code: 'PT', name: 'Portugal', region: 'Europe', continent: 'Europe' },
  { code: 'RO', name: 'Romania', region: 'Europe', continent: 'Europe' },
  { code: 'RU', name: 'Russia', region: 'Europe', continent: 'Europe' },
  { code: 'SM', name: 'San Marino', region: 'Europe', continent: 'Europe' },
  { code: 'RS', name: 'Serbia', region: 'Europe', continent: 'Europe' },
  { code: 'SK', name: 'Slovakia', region: 'Europe', continent: 'Europe' },
  { code: 'SI', name: 'Slovenia', region: 'Europe', continent: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe', continent: 'Europe' },
  { code: 'SE', name: 'Sweden', region: 'Europe', continent: 'Europe' },
  { code: 'CH', name: 'Switzerland', region: 'Europe', continent: 'Europe' },
  { code: 'TR', name: 'Turkey', region: 'Europe', continent: 'Europe' },
  { code: 'UA', name: 'Ukraine', region: 'Europe', continent: 'Europe' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', continent: 'Europe' },
  { code: 'VA', name: 'Vatican City', region: 'Europe', continent: 'Europe' },

  // North America
  { code: 'AG', name: 'Antigua and Barbuda', region: 'North America', continent: 'North America' },
  { code: 'BS', name: 'Bahamas', region: 'North America', continent: 'North America' },
  { code: 'BB', name: 'Barbados', region: 'North America', continent: 'North America' },
  { code: 'BZ', name: 'Belize', region: 'North America', continent: 'North America' },
  { code: 'CA', name: 'Canada', region: 'North America', continent: 'North America' },
  { code: 'CR', name: 'Costa Rica', region: 'North America', continent: 'North America' },
  { code: 'CU', name: 'Cuba', region: 'North America', continent: 'North America' },
  { code: 'DM', name: 'Dominica', region: 'North America', continent: 'North America' },
  { code: 'DO', name: 'Dominican Republic', region: 'North America', continent: 'North America' },
  { code: 'SV', name: 'El Salvador', region: 'North America', continent: 'North America' },
  { code: 'GD', name: 'Grenada', region: 'North America', continent: 'North America' },
  { code: 'GT', name: 'Guatemala', region: 'North America', continent: 'North America' },
  { code: 'HT', name: 'Haiti', region: 'North America', continent: 'North America' },
  { code: 'HN', name: 'Honduras', region: 'North America', continent: 'North America' },
  { code: 'JM', name: 'Jamaica', region: 'North America', continent: 'North America' },
  { code: 'MX', name: 'Mexico', region: 'North America', continent: 'North America' },
  { code: 'NI', name: 'Nicaragua', region: 'North America', continent: 'North America' },
  { code: 'PA', name: 'Panama', region: 'North America', continent: 'North America' },
  { code: 'KN', name: 'Saint Kitts and Nevis', region: 'North America', continent: 'North America' },
  { code: 'LC', name: 'Saint Lucia', region: 'North America', continent: 'North America' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', region: 'North America', continent: 'North America' },
  { code: 'TT', name: 'Trinidad and Tobago', region: 'North America', continent: 'North America' },
  { code: 'US', name: 'United States', region: 'North America', continent: 'North America' },

  // South America
  { code: 'AR', name: 'Argentina', region: 'South America', continent: 'South America' },
  { code: 'BO', name: 'Bolivia', region: 'South America', continent: 'South America' },
  { code: 'BR', name: 'Brazil', region: 'South America', continent: 'South America' },
  { code: 'CL', name: 'Chile', region: 'South America', continent: 'South America' },
  { code: 'CO', name: 'Colombia', region: 'South America', continent: 'South America' },
  { code: 'EC', name: 'Ecuador', region: 'South America', continent: 'South America' },
  { code: 'FK', name: 'Falkland Islands', region: 'South America', continent: 'South America' },
  { code: 'GF', name: 'French Guiana', region: 'South America', continent: 'South America' },
  { code: 'GY', name: 'Guyana', region: 'South America', continent: 'South America' },
  { code: 'PY', name: 'Paraguay', region: 'South America', continent: 'South America' },
  { code: 'PE', name: 'Peru', region: 'South America', continent: 'South America' },
  { code: 'SR', name: 'Suriname', region: 'South America', continent: 'South America' },
  { code: 'UY', name: 'Uruguay', region: 'South America', continent: 'South America' },
  { code: 'VE', name: 'Venezuela', region: 'South America', continent: 'South America' },

  // Middle East
  { code: 'BH', name: 'Bahrain', region: 'Middle East', continent: 'Asia' },
  { code: 'IR', name: 'Iran', region: 'Middle East', continent: 'Asia' },
  { code: 'IQ', name: 'Iraq', region: 'Middle East', continent: 'Asia' },
  { code: 'IL', name: 'Israel', region: 'Middle East', continent: 'Asia' },
  { code: 'JO', name: 'Jordan', region: 'Middle East', continent: 'Asia' },
  { code: 'KW', name: 'Kuwait', region: 'Middle East', continent: 'Asia' },
  { code: 'LB', name: 'Lebanon', region: 'Middle East', continent: 'Asia' },
  { code: 'OM', name: 'Oman', region: 'Middle East', continent: 'Asia' },
  { code: 'PS', name: 'Palestine', region: 'Middle East', continent: 'Asia' },
  { code: 'QA', name: 'Qatar', region: 'Middle East', continent: 'Asia' },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East', continent: 'Asia' },
  { code: 'SY', name: 'Syria', region: 'Middle East', continent: 'Asia' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East', continent: 'Asia' },
  { code: 'YE', name: 'Yemen', region: 'Middle East', continent: 'Asia' },

  // Africa
  { code: 'DZ', name: 'Algeria', region: 'Africa', continent: 'Africa' },
  { code: 'AO', name: 'Angola', region: 'Africa', continent: 'Africa' },
  { code: 'BJ', name: 'Benin', region: 'Africa', continent: 'Africa' },
  { code: 'BW', name: 'Botswana', region: 'Africa', continent: 'Africa' },
  { code: 'BF', name: 'Burkina Faso', region: 'Africa', continent: 'Africa' },
  { code: 'BI', name: 'Burundi', region: 'Africa', continent: 'Africa' },
  { code: 'CV', name: 'Cape Verde', region: 'Africa', continent: 'Africa' },
  { code: 'CM', name: 'Cameroon', region: 'Africa', continent: 'Africa' },
  { code: 'CF', name: 'Central African Republic', region: 'Africa', continent: 'Africa' },
  { code: 'TD', name: 'Chad', region: 'Africa', continent: 'Africa' },
  { code: 'KM', name: 'Comoros', region: 'Africa', continent: 'Africa' },
  { code: 'CG', name: 'Congo', region: 'Africa', continent: 'Africa' },
  { code: 'CD', name: 'Democratic Republic of the Congo', region: 'Africa', continent: 'Africa' },
  { code: 'DJ', name: 'Djibouti', region: 'Africa', continent: 'Africa' },
  { code: 'EG', name: 'Egypt', region: 'Africa', continent: 'Africa' },
  { code: 'GQ', name: 'Equatorial Guinea', region: 'Africa', continent: 'Africa' },
  { code: 'ER', name: 'Eritrea', region: 'Africa', continent: 'Africa' },
  { code: 'SZ', name: 'Eswatini', region: 'Africa', continent: 'Africa' },
  { code: 'ET', name: 'Ethiopia', region: 'Africa', continent: 'Africa' },
  { code: 'GA', name: 'Gabon', region: 'Africa', continent: 'Africa' },
  { code: 'GM', name: 'Gambia', region: 'Africa', continent: 'Africa' },
  { code: 'GH', name: 'Ghana', region: 'Africa', continent: 'Africa' },
  { code: 'GN', name: 'Guinea', region: 'Africa', continent: 'Africa' },
  { code: 'GW', name: 'Guinea-Bissau', region: 'Africa', continent: 'Africa' },
  { code: 'CI', name: 'Ivory Coast', region: 'Africa', continent: 'Africa' },
  { code: 'KE', name: 'Kenya', region: 'Africa', continent: 'Africa' },
  { code: 'LS', name: 'Lesotho', region: 'Africa', continent: 'Africa' },
  { code: 'LR', name: 'Liberia', region: 'Africa', continent: 'Africa' },
  { code: 'LY', name: 'Libya', region: 'Africa', continent: 'Africa' },
  { code: 'MG', name: 'Madagascar', region: 'Africa', continent: 'Africa' },
  { code: 'MW', name: 'Malawi', region: 'Africa', continent: 'Africa' },
  { code: 'ML', name: 'Mali', region: 'Africa', continent: 'Africa' },
  { code: 'MR', name: 'Mauritania', region: 'Africa', continent: 'Africa' },
  { code: 'MU', name: 'Mauritius', region: 'Africa', continent: 'Africa' },
  { code: 'YT', name: 'Mayotte', region: 'Africa', continent: 'Africa' },
  { code: 'MA', name: 'Morocco', region: 'Africa', continent: 'Africa' },
  { code: 'MZ', name: 'Mozambique', region: 'Africa', continent: 'Africa' },
  { code: 'NA', name: 'Namibia', region: 'Africa', continent: 'Africa' },
  { code: 'NE', name: 'Niger', region: 'Africa', continent: 'Africa' },
  { code: 'NG', name: 'Nigeria', region: 'Africa', continent: 'Africa' },
  { code: 'RE', name: 'Réunion', region: 'Africa', continent: 'Africa' },
  { code: 'RW', name: 'Rwanda', region: 'Africa', continent: 'Africa' },
  { code: 'SH', name: 'Saint Helena', region: 'Africa', continent: 'Africa' },
  { code: 'ST', name: 'São Tomé and Príncipe', region: 'Africa', continent: 'Africa' },
  { code: 'SN', name: 'Senegal', region: 'Africa', continent: 'Africa' },
  { code: 'SC', name: 'Seychelles', region: 'Africa', continent: 'Africa' },
  { code: 'SL', name: 'Sierra Leone', region: 'Africa', continent: 'Africa' },
  { code: 'SO', name: 'Somalia', region: 'Africa', continent: 'Africa' },
  { code: 'ZA', name: 'South Africa', region: 'Africa', continent: 'Africa' },
  { code: 'SS', name: 'South Sudan', region: 'Africa', continent: 'Africa' },
  { code: 'SD', name: 'Sudan', region: 'Africa', continent: 'Africa' },
  { code: 'TZ', name: 'Tanzania', region: 'Africa', continent: 'Africa' },
  { code: 'TG', name: 'Togo', region: 'Africa', continent: 'Africa' },
  { code: 'TN', name: 'Tunisia', region: 'Africa', continent: 'Africa' },
  { code: 'UG', name: 'Uganda', region: 'Africa', continent: 'Africa' },
  { code: 'EH', name: 'Western Sahara', region: 'Africa', continent: 'Africa' },
  { code: 'ZM', name: 'Zambia', region: 'Africa', continent: 'Africa' },
  { code: 'ZW', name: 'Zimbabwe', region: 'Africa', continent: 'Africa' }
];

// Major cities by country with postal codes
export const citiesByCountry = {
  // Popular shipping destinations with major cities
  'US': [
    { name: 'New York', postal: '10001', state: 'NY' },
    { name: 'Los Angeles', postal: '90210', state: 'CA' },
    { name: 'Chicago', postal: '60601', state: 'IL' },
    { name: 'Houston', postal: '77001', state: 'TX' },
    { name: 'Phoenix', postal: '85001', state: 'AZ' },
    { name: 'Philadelphia', postal: '19101', state: 'PA' },
    { name: 'San Antonio', postal: '78201', state: 'TX' },
    { name: 'San Diego', postal: '92101', state: 'CA' },
    { name: 'Dallas', postal: '75201', state: 'TX' },
    { name: 'San Jose', postal: '95101', state: 'CA' },
    { name: 'Austin', postal: '73301', state: 'TX' },
    { name: 'Jacksonville', postal: '32099', state: 'FL' },
    { name: 'San Francisco', postal: '94102', state: 'CA' },
    { name: 'Columbus', postal: '43085', state: 'OH' },
    { name: 'Charlotte', postal: '28202', state: 'NC' },
    { name: 'Fort Worth', postal: '76101', state: 'TX' },
    { name: 'Indianapolis', postal: '46201', state: 'IN' },
    { name: 'Seattle', postal: '98101', state: 'WA' },
    { name: 'Denver', postal: '80201', state: 'CO' },
    { name: 'Boston', postal: '02101', state: 'MA' }
  ],
  'CA': [
    { name: 'Toronto', postal: 'M5V 3A8', state: 'ON' },
    { name: 'Montreal', postal: 'H3A 1A1', state: 'QC' },
    { name: 'Vancouver', postal: 'V6B 1A1', state: 'BC' },
    { name: 'Calgary', postal: 'T2P 2M7', state: 'AB' },
    { name: 'Ottawa', postal: 'K1A 0A6', state: 'ON' },
    { name: 'Edmonton', postal: 'T5J 0N3', state: 'AB' },
    { name: 'Mississauga', postal: 'L5B 0C1', state: 'ON' },
    { name: 'Winnipeg', postal: 'R3C 0V8', state: 'MB' },
    { name: 'Quebec City', postal: 'G1R 2L3', state: 'QC' },
    { name: 'Hamilton', postal: 'L8P 0A1', state: 'ON' }
  ],
  'GB': [
    { name: 'London', postal: 'W1A 0AX', state: 'England' },
    { name: 'Birmingham', postal: 'B1 1AA', state: 'England' },
    { name: 'Manchester', postal: 'M1 1AA', state: 'England' },
    { name: 'Leeds', postal: 'LS1 1AA', state: 'England' },
    { name: 'Liverpool', postal: 'L1 1AA', state: 'England' },
    { name: 'Sheffield', postal: 'S1 1AA', state: 'England' },
    { name: 'Bristol', postal: 'BS1 1AA', state: 'England' },
    { name: 'Glasgow', postal: 'G1 1AA', state: 'Scotland' },
    { name: 'Leicester', postal: 'LE1 1AA', state: 'England' },
    { name: 'Edinburgh', postal: 'EH1 1AA', state: 'Scotland' }
  ],
  'AU': [
    { name: 'Sydney', postal: '2000', state: 'NSW' },
    { name: 'Melbourne', postal: '3000', state: 'VIC' },
    { name: 'Brisbane', postal: '4000', state: 'QLD' },
    { name: 'Perth', postal: '6000', state: 'WA' },
    { name: 'Adelaide', postal: '5000', state: 'SA' },
    { name: 'Gold Coast', postal: '4217', state: 'QLD' },
    { name: 'Newcastle', postal: '2300', state: 'NSW' },
    { name: 'Canberra', postal: '2601', state: 'ACT' },
    { name: 'Sunshine Coast', postal: '4558', state: 'QLD' },
    { name: 'Wollongong', postal: '2500', state: 'NSW' }
  ],
  'DE': [
    { name: 'Berlin', postal: '10115', state: 'Berlin' },
    { name: 'Hamburg', postal: '20095', state: 'Hamburg' },
    { name: 'Munich', postal: '80331', state: 'Bavaria' },
    { name: 'Cologne', postal: '50667', state: 'North Rhine-Westphalia' },
    { name: 'Frankfurt', postal: '60311', state: 'Hesse' },
    { name: 'Stuttgart', postal: '70173', state: 'Baden-Württemberg' },
    { name: 'Düsseldorf', postal: '40213', state: 'North Rhine-Westphalia' },
    { name: 'Dortmund', postal: '44135', state: 'North Rhine-Westphalia' },
    { name: 'Essen', postal: '45127', state: 'North Rhine-Westphalia' },
    { name: 'Leipzig', postal: '04109', state: 'Saxony' }
  ],
  'FR': [
    { name: 'Paris', postal: '75001', state: 'Île-de-France' },
    { name: 'Marseille', postal: '13001', state: 'Provence-Alpes-Côte d\'Azur' },
    { name: 'Lyon', postal: '69001', state: 'Auvergne-Rhône-Alpes' },
    { name: 'Toulouse', postal: '31000', state: 'Occitanie' },
    { name: 'Nice', postal: '06000', state: 'Provence-Alpes-Côte d\'Azur' },
    { name: 'Nantes', postal: '44000', state: 'Pays de la Loire' },
    { name: 'Strasbourg', postal: '67000', state: 'Grand Est' },
    { name: 'Montpellier', postal: '34000', state: 'Occitanie' },
    { name: 'Bordeaux', postal: '33000', state: 'Nouvelle-Aquitaine' },
    { name: 'Lille', postal: '59000', state: 'Hauts-de-France' }
  ],
  'IN': [
    { name: 'Mumbai', postal: '400001', state: 'Maharashtra' },
    { name: 'New Delhi', postal: '110001', state: 'Delhi' },
    { name: 'Bangalore', postal: '560001', state: 'Karnataka' },
    { name: 'Hyderabad', postal: '500001', state: 'Telangana' },
    { name: 'Ahmedabad', postal: '380001', state: 'Gujarat' },
    { name: 'Chennai', postal: '600001', state: 'Tamil Nadu' },
    { name: 'Kolkata', postal: '700001', state: 'West Bengal' },
    { name: 'Surat', postal: '395001', state: 'Gujarat' },
    { name: 'Pune', postal: '411001', state: 'Maharashtra' },
    { name: 'Jaipur', postal: '302001', state: 'Rajasthan' }
  ],
  'JP': [
    { name: 'Tokyo', postal: '100-0001', state: 'Tokyo' },
    { name: 'Yokohama', postal: '231-0001', state: 'Kanagawa' },
    { name: 'Osaka', postal: '530-0001', state: 'Osaka' },
    { name: 'Nagoya', postal: '460-0001', state: 'Aichi' },
    { name: 'Sapporo', postal: '060-0001', state: 'Hokkaido' },
    { name: 'Fukuoka', postal: '810-0001', state: 'Fukuoka' },
    { name: 'Kobe', postal: '650-0001', state: 'Hyogo' },
    { name: 'Kawasaki', postal: '210-0001', state: 'Kanagawa' },
    { name: 'Kyoto', postal: '600-0001', state: 'Kyoto' },
    { name: 'Saitama', postal: '330-0001', state: 'Saitama' }
  ],
  'CN': [
    { name: 'Beijing', postal: '100000', state: 'Beijing' },
    { name: 'Shanghai', postal: '200000', state: 'Shanghai' },
    { name: 'Guangzhou', postal: '510000', state: 'Guangdong' },
    { name: 'Shenzhen', postal: '518000', state: 'Guangdong' },
    { name: 'Tianjin', postal: '300000', state: 'Tianjin' },
    { name: 'Wuhan', postal: '430000', state: 'Hubei' },
    { name: 'Dongguan', postal: '523000', state: 'Guangdong' },
    { name: 'Chengdu', postal: '610000', state: 'Sichuan' },
    { name: 'Nanjing', postal: '210000', state: 'Jiangsu' },
    { name: 'Chongqing', postal: '400000', state: 'Chongqing' }
  ],
  'SG': [
    { name: 'Singapore', postal: '018956', state: 'Singapore' }
  ],
  'MY': [
    { name: 'Kuala Lumpur', postal: '50000', state: 'Federal Territory' },
    { name: 'George Town', postal: '10000', state: 'Penang' },
    { name: 'Ipoh', postal: '30000', state: 'Perak' },
    { name: 'Shah Alam', postal: '40000', state: 'Selangor' },
    { name: 'Petaling Jaya', postal: '46000', state: 'Selangor' },
    { name: 'Johor Bahru', postal: '80000', state: 'Johor' },
    { name: 'Malacca City', postal: '75000', state: 'Malacca' },
    { name: 'Alor Setar', postal: '05000', state: 'Kedah' },
    { name: 'Miri', postal: '98000', state: 'Sarawak' },
    { name: 'Kuching', postal: '93000', state: 'Sarawak' }
  ],
  'TH': [
    { name: 'Bangkok', postal: '10100', state: 'Bangkok' },
    { name: 'Nonthaburi', postal: '11000', state: 'Nonthaburi' },
    { name: 'Pak Kret', postal: '11120', state: 'Nonthaburi' },
    { name: 'Hat Yai', postal: '90110', state: 'Songkhla' },
    { name: 'Chiang Mai', postal: '50000', state: 'Chiang Mai' },
    { name: 'Phuket', postal: '83000', state: 'Phuket' },
    { name: 'Pattaya', postal: '20150', state: 'Chonburi' },
    { name: 'Nakhon Ratchasima', postal: '30000', state: 'Nakhon Ratchasima' },
    { name: 'Udon Thani', postal: '41000', state: 'Udon Thani' },
    { name: 'Surat Thani', postal: '84000', state: 'Surat Thani' }
  ],
  // Add more countries as needed
  'BD': [
    { name: 'Dhaka', postal: '1000', state: 'Dhaka' },
    { name: 'Chittagong', postal: '4000', state: 'Chittagong' },
    { name: 'Sylhet', postal: '3100', state: 'Sylhet' },
    { name: 'Rajshahi', postal: '6000', state: 'Rajshahi' },
    { name: 'Khulna', postal: '9000', state: 'Khulna' }
  ],
  'LK': [
    { name: 'Colombo', postal: '00100', state: 'Western' },
    { name: 'Kandy', postal: '20000', state: 'Central' },
    { name: 'Galle', postal: '80000', state: 'Southern' },
    { name: 'Jaffna', postal: '40000', state: 'Northern' },
    { name: 'Negombo', postal: '11500', state: 'Western' }
  ],
  'PK': [
    { name: 'Karachi', postal: '74000', state: 'Sindh' },
    { name: 'Lahore', postal: '54000', state: 'Punjab' },
    { name: 'Islamabad', postal: '44000', state: 'Islamabad Capital Territory' },
    { name: 'Rawalpindi', postal: '46000', state: 'Punjab' },
    { name: 'Faisalabad', postal: '38000', state: 'Punjab' }
  ],
  'AE': [
    { name: 'Dubai', postal: '00000', state: 'Dubai' },
    { name: 'Abu Dhabi', postal: '00000', state: 'Abu Dhabi' },
    { name: 'Sharjah', postal: '00000', state: 'Sharjah' },
    { name: 'Al Ain', postal: '00000', state: 'Abu Dhabi' },
    { name: 'Ajman', postal: '00000', state: 'Ajman' }
  ],
  'QA': [
    { name: 'Doha', postal: '00000', state: 'Ad Dawhah' },
    { name: 'Al Rayyan', postal: '00000', state: 'Al Rayyan' },
    { name: 'Umm Salal', postal: '00000', state: 'Umm Salal' }
  ],
  'ZA': [
    { name: 'Johannesburg', postal: '2000', state: 'Gauteng' },
    { name: 'Cape Town', postal: '8000', state: 'Western Cape' },
    { name: 'Durban', postal: '4000', state: 'KwaZulu-Natal' },
    { name: 'Pretoria', postal: '0001', state: 'Gauteng' },
    { name: 'Port Elizabeth', postal: '6000', state: 'Eastern Cape' }
  ],
  'KE': [
    { name: 'Nairobi', postal: '00100', state: 'Nairobi' },
    { name: 'Mombasa', postal: '80100', state: 'Mombasa' },
    { name: 'Kisumu', postal: '40100', state: 'Kisumu' },
    { name: 'Nakuru', postal: '20100', state: 'Nakuru' },
    { name: 'Eldoret', postal: '30100', state: 'Uasin Gishu' }
  ],

  // Expanded cities for all major countries
  'BR': [
    { name: 'São Paulo', postal: '01000-000', state: 'São Paulo' },
    { name: 'Rio de Janeiro', postal: '20000-000', state: 'Rio de Janeiro' },
    { name: 'Brasília', postal: '70000-000', state: 'Federal District' },
    { name: 'Salvador', postal: '40000-000', state: 'Bahia' },
    { name: 'Fortaleza', postal: '60000-000', state: 'Ceará' },
    { name: 'Belo Horizonte', postal: '30000-000', state: 'Minas Gerais' },
    { name: 'Manaus', postal: '69000-000', state: 'Amazonas' },
    { name: 'Curitiba', postal: '80000-000', state: 'Paraná' },
    { name: 'Recife', postal: '50000-000', state: 'Pernambuco' },
    { name: 'Porto Alegre', postal: '90000-000', state: 'Rio Grande do Sul' }
  ],
  'MX': [
    { name: 'Mexico City', postal: '01000', state: 'Mexico City' },
    { name: 'Guadalajara', postal: '44100', state: 'Jalisco' },
    { name: 'Monterrey', postal: '64000', state: 'Nuevo León' },
    { name: 'Puebla', postal: '72000', state: 'Puebla' },
    { name: 'Tijuana', postal: '22000', state: 'Baja California' },
    { name: 'León', postal: '37000', state: 'Guanajuato' },
    { name: 'Juárez', postal: '32000', state: 'Chihuahua' },
    { name: 'Torreón', postal: '27000', state: 'Coahuila' },
    { name: 'Querétaro', postal: '76000', state: 'Querétaro' },
    { name: 'Mérida', postal: '97000', state: 'Yucatán' }
  ],
  'RU': [
    { name: 'Moscow', postal: '101000', state: 'Moscow' },
    { name: 'Saint Petersburg', postal: '190000', state: 'Saint Petersburg' },
    { name: 'Novosibirsk', postal: '630000', state: 'Novosibirsk Oblast' },
    { name: 'Yekaterinburg', postal: '620000', state: 'Sverdlovsk Oblast' },
    { name: 'Nizhny Novgorod', postal: '603000', state: 'Nizhny Novgorod Oblast' },
    { name: 'Kazan', postal: '420000', state: 'Tatarstan' },
    { name: 'Chelyabinsk', postal: '454000', state: 'Chelyabinsk Oblast' },
    { name: 'Omsk', postal: '644000', state: 'Omsk Oblast' },
    { name: 'Samara', postal: '443000', state: 'Samara Oblast' },
    { name: 'Rostov-on-Don', postal: '344000', state: 'Rostov Oblast' }
  ],
  'IT': [
    { name: 'Rome', postal: '00100', state: 'Lazio' },
    { name: 'Milan', postal: '20100', state: 'Lombardy' },
    { name: 'Naples', postal: '80100', state: 'Campania' },
    { name: 'Turin', postal: '10100', state: 'Piedmont' },
    { name: 'Palermo', postal: '90100', state: 'Sicily' },
    { name: 'Genoa', postal: '16100', state: 'Liguria' },
    { name: 'Bologna', postal: '40100', state: 'Emilia-Romagna' },
    { name: 'Florence', postal: '50100', state: 'Tuscany' },
    { name: 'Bari', postal: '70100', state: 'Apulia' },
    { name: 'Catania', postal: '95100', state: 'Sicily' }
  ],
  'ES': [
    { name: 'Madrid', postal: '28001', state: 'Madrid' },
    { name: 'Barcelona', postal: '08001', state: 'Catalonia' },
    { name: 'Valencia', postal: '46001', state: 'Valencia' },
    { name: 'Seville', postal: '41001', state: 'Andalusia' },
    { name: 'Zaragoza', postal: '50001', state: 'Aragon' },
    { name: 'Málaga', postal: '29001', state: 'Andalusia' },
    { name: 'Murcia', postal: '30001', state: 'Murcia' },
    { name: 'Palma', postal: '07001', state: 'Balearic Islands' },
    { name: 'Las Palmas', postal: '35001', state: 'Canary Islands' },
    { name: 'Bilbao', postal: '48001', state: 'Basque Country' }
  ],
  'KR': [
    { name: 'Seoul', postal: '03000', state: 'Seoul' },
    { name: 'Busan', postal: '48000', state: 'Busan' },
    { name: 'Incheon', postal: '21000', state: 'Incheon' },
    { name: 'Daegu', postal: '41000', state: 'Daegu' },
    { name: 'Daejeon', postal: '34000', state: 'Daejeon' },
    { name: 'Gwangju', postal: '61000', state: 'Gwangju' },
    { name: 'Suwon', postal: '16000', state: 'Gyeonggi' },
    { name: 'Ulsan', postal: '44000', state: 'Ulsan' },
    { name: 'Changwon', postal: '51000', state: 'South Gyeongsang' },
    { name: 'Goyang', postal: '10000', state: 'Gyeonggi' }
  ],
  'TR': [
    { name: 'Istanbul', postal: '34000', state: 'Istanbul' },
    { name: 'Ankara', postal: '06000', state: 'Ankara' },
    { name: 'Izmir', postal: '35000', state: 'Izmir' },
    { name: 'Bursa', postal: '16000', state: 'Bursa' },
    { name: 'Adana', postal: '01000', state: 'Adana' },
    { name: 'Gaziantep', postal: '27000', state: 'Gaziantep' },
    { name: 'Konya', postal: '42000', state: 'Konya' },
    { name: 'Antalya', postal: '07000', state: 'Antalya' },
    { name: 'Kayseri', postal: '38000', state: 'Kayseri' },
    { name: 'Mersin', postal: '33000', state: 'Mersin' }
  ],
  'ID': [
    { name: 'Jakarta', postal: '10110', state: 'Jakarta' },
    { name: 'Surabaya', postal: '60111', state: 'East Java' },
    { name: 'Bandung', postal: '40111', state: 'West Java' },
    { name: 'Bekasi', postal: '17112', state: 'West Java' },
    { name: 'Medan', postal: '20111', state: 'North Sumatra' },
    { name: 'Tangerang', postal: '15111', state: 'Banten' },
    { name: 'Depok', postal: '16411', state: 'West Java' },
    { name: 'Semarang', postal: '50711', state: 'Central Java' },
    { name: 'Palembang', postal: '30111', state: 'South Sumatra' },
    { name: 'Makassar', postal: '90111', state: 'South Sulawesi' }
  ],
  'PH': [
    { name: 'Manila', postal: '1000', state: 'Metro Manila' },
    { name: 'Quezon City', postal: '1100', state: 'Metro Manila' },
    { name: 'Caloocan', postal: '1400', state: 'Metro Manila' },
    { name: 'Davao', postal: '8000', state: 'Davao del Sur' },
    { name: 'Cebu City', postal: '6000', state: 'Cebu' },
    { name: 'Zamboanga', postal: '7000', state: 'Zamboanga del Sur' },
    { name: 'Antipolo', postal: '1870', state: 'Rizal' },
    { name: 'Pasig', postal: '1600', state: 'Metro Manila' },
    { name: 'Taguig', postal: '1630', state: 'Metro Manila' },
    { name: 'Cagayan de Oro', postal: '9000', state: 'Misamis Oriental' }
  ],
  'VN': [
    { name: 'Ho Chi Minh City', postal: '70000', state: 'Ho Chi Minh City' },
    { name: 'Hanoi', postal: '10000', state: 'Hanoi' },
    { name: 'Da Nang', postal: '50000', state: 'Da Nang' },
    { name: 'Hai Phong', postal: '18000', state: 'Hai Phong' },
    { name: 'Can Tho', postal: '90000', state: 'Can Tho' },
    { name: 'Bien Hoa', postal: '76000', state: 'Dong Nai' },
    { name: 'Hue', postal: '53000', state: 'Thua Thien Hue' },
    { name: 'Nha Trang', postal: '65000', state: 'Khanh Hoa' },
    { name: 'Buon Ma Thuot', postal: '63000', state: 'Dak Lak' },
    { name: 'Vung Tau', postal: '78000', state: 'Ba Ria-Vung Tau' }
  ],
  'EG': [
    { name: 'Cairo', postal: '11511', state: 'Cairo' },
    { name: 'Alexandria', postal: '21500', state: 'Alexandria' },
    { name: 'Giza', postal: '12511', state: 'Giza' },
    { name: 'Shubra El Kheima', postal: '13511', state: 'Qalyubia' },
    { name: 'Port Said', postal: '42511', state: 'Port Said' },
    { name: 'Suez', postal: '43511', state: 'Suez' },
    { name: 'Luxor', postal: '85511', state: 'Luxor' },
    { name: 'Mansoura', postal: '35511', state: 'Dakahlia' },
    { name: 'El Mahalla El Kubra', postal: '31511', state: 'Gharbia' },
    { name: 'Tanta', postal: '31511', state: 'Gharbia' }
  ],
  'NG': [
    { name: 'Lagos', postal: '100001', state: 'Lagos' },
    { name: 'Kano', postal: '700001', state: 'Kano' },
    { name: 'Ibadan', postal: '200001', state: 'Oyo' },
    { name: 'Abuja', postal: '900001', state: 'Federal Capital Territory' },
    { name: 'Port Harcourt', postal: '500001', state: 'Rivers' },
    { name: 'Benin City', postal: '300001', state: 'Edo' },
    { name: 'Maiduguri', postal: '600001', state: 'Borno' },
    { name: 'Zaria', postal: '810001', state: 'Kaduna' },
    { name: 'Aba', postal: '450001', state: 'Abia' },
    { name: 'Jos', postal: '930001', state: 'Plateau' }
  ],

  // Add default cities for countries without specific data
  'AF': [{ name: 'Kabul', postal: '1001', state: 'Kabul' }, { name: 'Kandahar', postal: '3801', state: 'Kandahar' }, { name: 'Herat', postal: '3001', state: 'Herat' }],
  'AL': [{ name: 'Tirana', postal: '1001', state: 'Tirana' }, { name: 'Durrës', postal: '2001', state: 'Durrës' }, { name: 'Vlorë', postal: '9401', state: 'Vlorë' }],
  'DZ': [{ name: 'Algiers', postal: '16000', state: 'Algiers' }, { name: 'Oran', postal: '31000', state: 'Oran' }, { name: 'Constantine', postal: '25000', state: 'Constantine' }],
  'AD': [{ name: 'Andorra la Vella', postal: 'AD500', state: 'Andorra la Vella' }],
  'AO': [{ name: 'Luanda', postal: '1000', state: 'Luanda' }, { name: 'Huambo', postal: '2000', state: 'Huambo' }],
  'AG': [{ name: 'Saint John\'s', postal: '00000', state: 'Saint John' }],
  'AR': [{ name: 'Buenos Aires', postal: 'C1000', state: 'Buenos Aires' }, { name: 'Córdoba', postal: 'X5000', state: 'Córdoba' }, { name: 'Rosario', postal: 'S2000', state: 'Santa Fe' }],
  'AM': [{ name: 'Yerevan', postal: '0001', state: 'Yerevan' }],
  'AT': [{ name: 'Vienna', postal: '1010', state: 'Vienna' }, { name: 'Salzburg', postal: '5020', state: 'Salzburg' }, { name: 'Innsbruck', postal: '6020', state: 'Tyrol' }],
  'AZ': [{ name: 'Baku', postal: 'AZ1000', state: 'Baku' }],
  'BS': [{ name: 'Nassau', postal: '00000', state: 'New Providence' }],
  'BH': [{ name: 'Manama', postal: '317', state: 'Capital' }],
  'BY': [{ name: 'Minsk', postal: '220000', state: 'Minsk' }],
  'BE': [{ name: 'Brussels', postal: '1000', state: 'Brussels' }, { name: 'Antwerp', postal: '2000', state: 'Antwerp' }, { name: 'Ghent', postal: '9000', state: 'East Flanders' }],
  'BZ': [{ name: 'Belize City', postal: '00000', state: 'Belize' }],
  'BJ': [{ name: 'Cotonou', postal: '01000', state: 'Littoral' }],
  'BT': [{ name: 'Thimphu', postal: '11001', state: 'Thimphu' }],
  'BO': [{ name: 'La Paz', postal: '0000', state: 'La Paz' }, { name: 'Santa Cruz', postal: '0000', state: 'Santa Cruz' }],
  'BA': [{ name: 'Sarajevo', postal: '71000', state: 'Federation of Bosnia and Herzegovina' }],
  'BW': [{ name: 'Gaborone', postal: '00000', state: 'South-East' }],
  'BG': [{ name: 'Sofia', postal: '1000', state: 'Sofia City' }, { name: 'Plovdiv', postal: '4000', state: 'Plovdiv' }],
  'BF': [{ name: 'Ouagadougou', postal: '01000', state: 'Centre' }],
  'BI': [{ name: 'Bujumbura', postal: '00000', state: 'Bujumbura Mairie' }],
  'KH': [{ name: 'Phnom Penh', postal: '12000', state: 'Phnom Penh' }],
  'CM': [{ name: 'Yaoundé', postal: '00000', state: 'Centre' }, { name: 'Douala', postal: '00000', state: 'Littoral' }],
  'CV': [{ name: 'Praia', postal: '7600', state: 'Santiago' }],
  'CF': [{ name: 'Bangui', postal: '00000', state: 'Bangui' }],
  'TD': [{ name: 'N\'Djamena', postal: '00000', state: 'Chari-Baguirmi' }],
  'CL': [{ name: 'Santiago', postal: '8320000', state: 'Santiago Metropolitan' }, { name: 'Valparaíso', postal: '2340000', state: 'Valparaíso' }],
  'CO': [{ name: 'Bogotá', postal: '110111', state: 'Bogotá D.C.' }, { name: 'Medellín', postal: '050001', state: 'Antioquia' }, { name: 'Cali', postal: '760001', state: 'Valle del Cauca' }],
  'KM': [{ name: 'Moroni', postal: '00000', state: 'Grande Comore' }],
  'CG': [{ name: 'Brazzaville', postal: '00000', state: 'Brazzaville' }],
  'CD': [{ name: 'Kinshasa', postal: '00000', state: 'Kinshasa' }],
  'CR': [{ name: 'San José', postal: '10101', state: 'San José' }],
  'CI': [{ name: 'Abidjan', postal: '00000', state: 'Lagunes' }, { name: 'Yamoussoukro', postal: '00000', state: 'Lacs' }],
  'HR': [{ name: 'Zagreb', postal: '10000', state: 'Zagreb' }],
  'CU': [{ name: 'Havana', postal: '10100', state: 'Havana' }],
  'CY': [{ name: 'Nicosia', postal: '1010', state: 'Nicosia' }],
  'CZ': [{ name: 'Prague', postal: '11000', state: 'Prague' }, { name: 'Brno', postal: '60200', state: 'South Moravian' }],
  'DK': [{ name: 'Copenhagen', postal: '1050', state: 'Capital Region' }, { name: 'Aarhus', postal: '8000', state: 'Central Denmark' }],
  'DJ': [{ name: 'Djibouti', postal: '00000', state: 'Djibouti' }],
  'DM': [{ name: 'Roseau', postal: '00000', state: 'Saint George' }],
  'DO': [{ name: 'Santo Domingo', postal: '10101', state: 'Distrito Nacional' }],
  'EC': [{ name: 'Quito', postal: '170515', state: 'Pichincha' }, { name: 'Guayaquil', postal: '090313', state: 'Guayas' }],
  'SV': [{ name: 'San Salvador', postal: '01101', state: 'San Salvador' }],
  'GQ': [{ name: 'Malabo', postal: '00000', state: 'Bioko Norte' }],
  'ER': [{ name: 'Asmara', postal: '00000', state: 'Maekel' }],
  'EE': [{ name: 'Tallinn', postal: '10111', state: 'Harju' }],
  'SZ': [{ name: 'Mbabane', postal: 'H100', state: 'Hhohho' }],
  'ET': [{ name: 'Addis Ababa', postal: '1000', state: 'Addis Ababa' }],
  'FJ': [{ name: 'Suva', postal: '00000', state: 'Central' }],
  'FI': [{ name: 'Helsinki', postal: '00100', state: 'Uusimaa' }, { name: 'Tampere', postal: '33100', state: 'Pirkanmaa' }],
  'GA': [{ name: 'Libreville', postal: '00000', state: 'Estuaire' }],
  'GM': [{ name: 'Banjul', postal: '00000', state: 'Banjul' }],
  'GE': [{ name: 'Tbilisi', postal: '0108', state: 'Tbilisi' }],
  'GH': [{ name: 'Accra', postal: '00233', state: 'Greater Accra' }, { name: 'Kumasi', postal: '00233', state: 'Ashanti' }],
  'GR': [{ name: 'Athens', postal: '10431', state: 'Attica' }, { name: 'Thessaloniki', postal: '54621', state: 'Central Macedonia' }],
  'GD': [{ name: 'Saint George\'s', postal: '00000', state: 'Saint George' }],
  'GT': [{ name: 'Guatemala City', postal: '01001', state: 'Guatemala' }],
  'GN': [{ name: 'Conakry', postal: '00000', state: 'Conakry' }],
  'GW': [{ name: 'Bissau', postal: '1000', state: 'Bissau' }],
  'GY': [{ name: 'Georgetown', postal: '00000', state: 'Demerara-Mahaica' }],
  'HT': [{ name: 'Port-au-Prince', postal: 'HT6110', state: 'Ouest' }],
  'HN': [{ name: 'Tegucigalpa', postal: '11101', state: 'Francisco Morazán' }],
  'HK': [{ name: 'Hong Kong', postal: '00000', state: 'Hong Kong Island' }],
  'HU': [{ name: 'Budapest', postal: '1011', state: 'Budapest' }],
  'IS': [{ name: 'Reykjavik', postal: '101', state: 'Capital Region' }],
  'IE': [{ name: 'Dublin', postal: 'D01', state: 'Leinster' }, { name: 'Cork', postal: 'T12', state: 'Munster' }],
  'IL': [{ name: 'Jerusalem', postal: '9100001', state: 'Jerusalem' }, { name: 'Tel Aviv', postal: '6100001', state: 'Tel Aviv' }],
  'IQ': [{ name: 'Baghdad', postal: '10001', state: 'Baghdad' }],
  'IR': [{ name: 'Tehran', postal: '1111111111', state: 'Tehran' }],
  'JM': [{ name: 'Kingston', postal: '01', state: 'Surrey' }],
  'JO': [{ name: 'Amman', postal: '11118', state: 'Amman' }],
  'KZ': [{ name: 'Almaty', postal: '050000', state: 'Almaty' }, { name: 'Nur-Sultan', postal: '010000', state: 'Nur-Sultan' }],
  'KW': [{ name: 'Kuwait City', postal: '13001', state: 'Al Asimah' }],
  'KG': [{ name: 'Bishkek', postal: '720000', state: 'Chuy' }],
  'LA': [{ name: 'Vientiane', postal: '01000', state: 'Vientiane Prefecture' }],
  'LV': [{ name: 'Riga', postal: 'LV-1010', state: 'Riga' }],
  'LB': [{ name: 'Beirut', postal: '1107 2020', state: 'Beirut' }],
  'LS': [{ name: 'Maseru', postal: '100', state: 'Maseru' }],
  'LR': [{ name: 'Monrovia', postal: '1000', state: 'Montserrado' }],
  'LY': [{ name: 'Tripoli', postal: '00000', state: 'Tripoli' }],
  'LI': [{ name: 'Vaduz', postal: '9490', state: 'Vaduz' }],
  'LT': [{ name: 'Vilnius', postal: 'LT-01001', state: 'Vilnius' }],
  'LU': [{ name: 'Luxembourg', postal: 'L-1009', state: 'Luxembourg' }],
  'MO': [{ name: 'Macau', postal: '00000', state: 'Macau' }],
  'MK': [{ name: 'Skopje', postal: '1000', state: 'Skopje' }],
  'MG': [{ name: 'Antananarivo', postal: '101', state: 'Analamanga' }],
  'MW': [{ name: 'Lilongwe', postal: '00000', state: 'Central Region' }],
  'MV': [{ name: 'Malé', postal: '20026', state: 'Kaafu' }],
  'ML': [{ name: 'Bamako', postal: '00000', state: 'Bamako' }],
  'MT': [{ name: 'Valletta', postal: 'VLT 1000', state: 'South Eastern' }],
  'MR': [{ name: 'Nouakchott', postal: '00000', state: 'Nouakchott' }],
  'MU': [{ name: 'Port Louis', postal: '11328', state: 'Port Louis' }],
  'MD': [{ name: 'Chișinău', postal: 'MD-2001', state: 'Chișinău' }],
  'MC': [{ name: 'Monaco', postal: '98000', state: 'Monaco' }],
  'MN': [{ name: 'Ulaanbaatar', postal: '14200', state: 'Ulaanbaatar' }],
  'ME': [{ name: 'Podgorica', postal: '81000', state: 'Podgorica' }],
  'MA': [{ name: 'Rabat', postal: '10000', state: 'Rabat-Salé-Kénitra' }, { name: 'Casablanca', postal: '20000', state: 'Casablanca-Settat' }],
  'MZ': [{ name: 'Maputo', postal: '1100', state: 'Maputo' }],
  'MM': [{ name: 'Yangon', postal: '11181', state: 'Yangon' }, { name: 'Naypyidaw', postal: '15011', state: 'Naypyidaw' }],
  'NA': [{ name: 'Windhoek', postal: '10001', state: 'Khomas' }],
  'NR': [{ name: 'Yaren', postal: '00000', state: 'Yaren' }],
  'NP': [{ name: 'Kathmandu', postal: '44600', state: 'Bagmati' }, { name: 'Pokhara', postal: '33700', state: 'Gandaki' }],
  'NL': [{ name: 'Amsterdam', postal: '1011', state: 'North Holland' }, { name: 'Rotterdam', postal: '3011', state: 'South Holland' }],
  'NZ': [{ name: 'Auckland', postal: '1010', state: 'Auckland' }, { name: 'Wellington', postal: '6011', state: 'Wellington' }],
  'NI': [{ name: 'Managua', postal: '12066', state: 'Managua' }],
  'NE': [{ name: 'Niamey', postal: '8001', state: 'Niamey' }],
  'NO': [{ name: 'Oslo', postal: '0001', state: 'Oslo' }, { name: 'Bergen', postal: '5003', state: 'Vestland' }],
  'OM': [{ name: 'Muscat', postal: '100', state: 'Muscat' }],
  'PA': [{ name: 'Panama City', postal: '0801', state: 'Panamá' }],
  'PG': [{ name: 'Port Moresby', postal: '121', state: 'National Capital District' }],
  'PY': [{ name: 'Asunción', postal: '1536', state: 'Asunción' }],
  'PE': [{ name: 'Lima', postal: '15001', state: 'Lima' }],
  'PL': [{ name: 'Warsaw', postal: '00-001', state: 'Masovian' }, { name: 'Krakow', postal: '30-001', state: 'Lesser Poland' }],
  'PT': [{ name: 'Lisbon', postal: '1000-001', state: 'Lisbon' }, { name: 'Porto', postal: '4000-001', state: 'Porto' }],
  'RO': [{ name: 'Bucharest', postal: '010011', state: 'Bucharest' }],
  'RW': [{ name: 'Kigali', postal: '00000', state: 'Kigali' }],
  'KN': [{ name: 'Basseterre', postal: '00000', state: 'Saint George Basseterre' }],
  'LC': [{ name: 'Castries', postal: '00000', state: 'Castries' }],
  'VC': [{ name: 'Kingstown', postal: '00000', state: 'Saint George' }],
  'WS': [{ name: 'Apia', postal: '00000', state: 'Tuamasaga' }],
  'SM': [{ name: 'San Marino', postal: '47890', state: 'San Marino' }],
  'ST': [{ name: 'São Tomé', postal: '00000', state: 'Água Grande' }],
  'SN': [{ name: 'Dakar', postal: '12500', state: 'Dakar' }],
  'RS': [{ name: 'Belgrade', postal: '11000', state: 'Belgrade' }],
  'SC': [{ name: 'Victoria', postal: '00000', state: 'Mahé' }],
  'SL': [{ name: 'Freetown', postal: '00000', state: 'Western Area' }],
  'SK': [{ name: 'Bratislava', postal: '81101', state: 'Bratislava' }],
  'SI': [{ name: 'Ljubljana', postal: '1000', state: 'Ljubljana' }],
  'SB': [{ name: 'Honiara', postal: '00000', state: 'Guadalcanal' }],
  'SO': [{ name: 'Mogadishu', postal: '00000', state: 'Banaadir' }],
  'SS': [{ name: 'Juba', postal: '00000', state: 'Central Equatoria' }],
  'SD': [{ name: 'Khartoum', postal: '11111', state: 'Khartoum' }],
  'SR': [{ name: 'Paramaribo', postal: '00000', state: 'Paramaribo' }],
  'SE': [{ name: 'Stockholm', postal: '11120', state: 'Stockholm' }, { name: 'Gothenburg', postal: '41103', state: 'Västra Götaland' }],
  'CH': [{ name: 'Zurich', postal: '8001', state: 'Zurich' }, { name: 'Geneva', postal: '1200', state: 'Geneva' }, { name: 'Bern', postal: '3011', state: 'Bern' }],
  'SY': [{ name: 'Damascus', postal: '00000', state: 'Damascus' }],
  'TW': [{ name: 'Taipei', postal: '100', state: 'Taipei' }],
  'TJ': [{ name: 'Dushanbe', postal: '734025', state: 'Dushanbe' }],
  'TZ': [{ name: 'Dar es Salaam', postal: '11101', state: 'Dar es Salaam' }],
  'TG': [{ name: 'Lomé', postal: '01000', state: 'Maritime' }],
  'TO': [{ name: 'Nuku\'alofa', postal: '00000', state: 'Tongatapu' }],
  'TT': [{ name: 'Port of Spain', postal: '100101', state: 'Port of Spain' }],
  'TN': [{ name: 'Tunis', postal: '1000', state: 'Tunis' }],
  'TM': [{ name: 'Ashgabat', postal: '744000', state: 'Ahal' }],
  'TV': [{ name: 'Funafuti', postal: '00000', state: 'Funafuti' }],
  'UG': [{ name: 'Kampala', postal: '00000', state: 'Central Region' }],
  'UA': [{ name: 'Kyiv', postal: '01001', state: 'Kyiv' }],
  'UY': [{ name: 'Montevideo', postal: '11000', state: 'Montevideo' }],
  'UZ': [{ name: 'Tashkent', postal: '100000', state: 'Tashkent' }],
  'VU': [{ name: 'Port Vila', postal: '00000', state: 'Shefa' }],
  'VA': [{ name: 'Vatican City', postal: '00120', state: 'Vatican City' }],
  'VE': [{ name: 'Caracas', postal: '1010', state: 'Capital District' }],
  'YE': [{ name: 'Sana\'a', postal: '00000', state: 'Amanat Al Asimah' }],
  'ZM': [{ name: 'Lusaka', postal: '10101', state: 'Lusaka' }],
  'ZW': [{ name: 'Harare', postal: '00263', state: 'Harare' }]
};

/**
 * Get countries grouped by region
 */
export function getCountriesByRegion() {
  const grouped = {};
  countries.forEach(country => {
    if (!grouped[country.region]) {
      grouped[country.region] = [];
    }
    grouped[country.region].push(country);
  });
  
  // Sort countries within each region
  Object.keys(grouped).forEach(region => {
    grouped[region].sort((a, b) => a.name.localeCompare(b.name));
  });
  
  return grouped;
}

/**
 * Get cities for a specific country
 */
export function getCitiesForCountry(countryCode) {
  return citiesByCountry[countryCode] || [];
}

/**
 * Search countries by name
 */
export function searchCountries(query) {
  if (!query) return countries;
  
  const lowerQuery = query.toLowerCase();
  return countries.filter(country => 
    country.name.toLowerCase().includes(lowerQuery) ||
    country.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Search cities within a country
 */
export function searchCities(countryCode, query) {
  const cities = getCitiesForCountry(countryCode);
  if (!query) return cities;
  
  const lowerQuery = query.toLowerCase();
  return cities.filter(city => 
    city.name.toLowerCase().includes(lowerQuery) ||
    city.postal.toLowerCase().includes(lowerQuery) ||
    city.state.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get country by code
 */
export function getCountryByCode(code) {
  return countries.find(country => country.code === code);
}

/**
 * Validate postal code format for specific countries
 */
export function validatePostalCode(countryCode, postalCode) {
  const patterns = {
    'US': /^\d{5}(-\d{4})?$/,
    'CA': /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/,
    'GB': /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/,
    'DE': /^\d{5}$/,
    'FR': /^\d{5}$/,
    'AU': /^\d{4}$/,
    'IN': /^\d{6}$/,
    'JP': /^\d{3}-\d{4}$/,
    'CN': /^\d{6}$/,
    'SG': /^\d{6}$/,
    'MY': /^\d{5}$/,
    'TH': /^\d{5}$/
  };
  
  const pattern = patterns[countryCode];
  return pattern ? pattern.test(postalCode) : true; // Default to valid for unlisted countries
}

export default {
  countries,
  citiesByCountry,
  getCountriesByRegion,
  getCitiesForCountry,
  searchCountries,
  searchCities,
  getCountryByCode,
  validatePostalCode
}; 