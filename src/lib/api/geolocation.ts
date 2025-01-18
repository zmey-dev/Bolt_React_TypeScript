import { CountryCode, COUNTRY_CODES } from '../constants/countries';

interface GeolocationResponse {
  country_code: string;
}

export async function detectUserCountry(): Promise<CountryCode | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data: GeolocationResponse = await response.json();
    
    const countryCode = COUNTRY_CODES.find(
      country => country.code === data.country_code
    );

    return countryCode || null;
  } catch (error) {
    console.warn('Failed to detect user country:', error);
    return null;
  }
}