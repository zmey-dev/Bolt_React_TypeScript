import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRY_CODES } from '../../lib/constants/countries';
import { CountryFlag } from './CountryFlag';
import { detectUserCountry } from '../../lib/api/geolocation';

interface PhoneInputProps {
  name?: string;
  required?: boolean;
}

export function PhoneInput({ name = 'phone', required = false }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  // Detect user's country on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      detectUserCountry().then(country => {
        if (country) {
          setSelectedCountry(country);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = `${selectedCountry.prefix} ${phoneNumber}`.trim();
    }
  }, [selectedCountry, phoneNumber]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.prefix.includes(searchQuery)
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Phone Number
      </label>
      <div className="flex">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-[50px] flex items-center gap-2 bg-[#1f1f1f] border-2 border-yellow-400/20 rounded-l-lg px-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 hover:bg-[#2a2a2a] transition-colors min-w-[120px]"
          >
            <CountryFlag countryCode={selectedCountry.code} />
            <span className="text-white text-sm">{selectedCountry.prefix}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search countries..."
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(country);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-700 transition-colors text-left"
                  >
                    <CountryFlag countryCode={country.code} />
                    <div className="flex-1">
                      <span className="text-white text-sm">{country.name}</span>
                      <span className="text-gray-400 text-xs block">{country.prefix}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{country.prefix}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="flex-1 h-[50px] bg-[#1f1f1f] text-white border-2 border-l-0 border-yellow-400/20 rounded-r-lg px-4 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20"
          placeholder="(555) 123-4567"
        />

        <input
          ref={hiddenInputRef}
          type="hidden"
          name={name}
          required={required}
        />
      </div>
    </div>
  );
}