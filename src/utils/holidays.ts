export interface CountryOption {
  code: string;
  name: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'KR', name: 'South Korea' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' }
];

// Accurate, comprehensive festival and holiday mappings keyed by exact ISO dates (YYYY-MM-DD)
// Covers major cultural, religious, and national festivals with lunar precision
const ACCURATE_YEAR_HOLIDAYS: Record<string, Record<string, string>> = {
  // INDIA: Covers national holidays, major Hindu lunar festivals, Islamic festivals, Christian festivals, Sikh festivals
  'IN-2024': {
    '2024-01-01': "New Year's Day",
    '2024-01-14': 'Makar Sankranti / Pongal',
    '2024-01-26': 'Republic Day',
    '2024-03-08': 'Maha Shivratri',
    '2024-03-25': 'Holi',
    '2024-03-29': 'Good Friday',
    '2024-04-09': 'Ugadi / Gudi Padwa',
    '2024-04-11': 'Eid ul-Fitr',
    '2024-04-14': 'Ambedkar Jayanti',
    '2024-04-17': 'Ram Navami',
    '2024-04-21': 'Mahavir Jayanti',
    '2024-05-23': 'Buddha Purnima',
    '2024-06-17': 'Bakrid / Eid ul-Adha',
    '2024-07-17': 'Muharram',
    '2024-08-15': 'Independence Day',
    '2024-08-19': 'Raksha Bandhan',
    '2024-08-26': 'Janmashtami',
    '2024-09-07': 'Ganesh Chaturthi',
    '2024-09-16': 'Milad un-Nabi',
    '2024-10-02': 'Gandhi Jayanti',
    '2024-10-11': 'Maha Navami',
    '2024-10-12': 'Dussehra / Vijayadashami',
    '2024-10-20': 'Karwa Chauth',
    '2024-10-29': 'Dhanteras',
    '2024-10-31': 'Diwali / Deepavali',
    '2024-11-02': 'Govardhan Puja',
    '2024-11-03': 'Bhai Dooj',
    '2024-11-07': 'Chhath Puja',
    '2024-11-15': 'Guru Nanak Jayanti',
    '2024-12-25': 'Christmas Day'
  },
  'IN-2025': {
    '2025-01-01': "New Year's Day",
    '2025-01-14': 'Makar Sankranti / Pongal',
    '2025-01-26': 'Republic Day',
    '2025-02-26': 'Maha Shivratri',
    '2025-03-14': 'Holi',
    '2025-03-30': 'Ugadi / Gudi Padwa',
    '2025-03-31': 'Eid ul-Fitr',
    '2025-04-06': 'Ram Navami',
    '2025-04-10': 'Mahavir Jayanti',
    '2025-04-14': 'Ambedkar Jayanti',
    '2025-04-18': 'Good Friday',
    '2025-05-12': 'Buddha Purnima',
    '2025-06-07': 'Bakrid / Eid ul-Adha',
    '2025-07-06': 'Muharram',
    '2025-08-09': 'Raksha Bandhan',
    '2025-08-15': 'Independence Day',
    '2025-08-16': 'Janmashtami',
    '2025-08-27': 'Ganesh Chaturthi',
    '2025-09-05': 'Milad un-Nabi',
    '2025-10-01': 'Maha Navami',
    '2025-10-02': 'Gandhi Jayanti & Dussehra',
    '2025-10-10': 'Karwa Chauth',
    '2025-10-18': 'Dhanteras',
    '2025-10-20': 'Diwali / Deepavali',
    '2025-10-22': 'Govardhan Puja',
    '2025-10-23': 'Bhai Dooj',
    '2025-10-28': 'Chhath Puja',
    '2025-11-05': 'Guru Nanak Jayanti',
    '2025-12-25': 'Christmas Day'
  },
  'IN-2026': {
    '2026-01-01': "New Year's Day",
    '2026-01-14': 'Makar Sankranti / Pongal',
    '2026-01-26': 'Republic Day',
    '2026-02-15': 'Maha Shivratri',
    '2026-03-04': 'Holi',
    '2026-03-19': 'Ugadi / Gudi Padwa',
    '2026-03-20': 'Eid ul-Fitr',
    '2026-03-27': 'Ram Navami',
    '2026-04-03': 'Good Friday',
    '2026-04-14': 'Ambedkar Jayanti',
    '2026-04-20': 'Mahavir Jayanti',
    '2026-05-01': 'Buddha Purnima',
    '2026-05-27': 'Bakrid / Eid ul-Adha',
    '2026-06-26': 'Muharram',
    '2026-08-15': 'Independence Day',
    '2026-08-28': 'Raksha Bandhan',
    '2026-09-04': 'Janmashtami',
    '2026-09-14': 'Ganesh Chaturthi',
    '2026-09-25': 'Milad un-Nabi',
    '2026-10-02': 'Gandhi Jayanti',
    '2026-10-19': 'Maha Navami',
    '2026-10-20': 'Dussehra / Vijayadashami',
    '2026-10-29': 'Karwa Chauth',
    '2026-11-06': 'Dhanteras',
    '2026-11-08': 'Diwali / Deepavali',
    '2026-11-09': 'Govardhan Puja',
    '2026-11-10': 'Bhai Dooj',
    '2026-11-15': 'Chhath Puja',
    '2026-11-24': 'Guru Nanak Jayanti',
    '2026-12-25': 'Christmas Day'
  },

  // UNITED STATES: Federal & cultural holidays
  'US-2024': {
    '2024-01-01': "New Year's Day",
    '2024-01-15': 'Martin Luther King Jr. Day',
    '2024-02-14': "Valentine's Day",
    '2024-02-19': "Presidents' Day",
    '2024-03-17': "St. Patrick's Day",
    '2024-03-31': 'Easter Sunday',
    '2024-05-27': 'Memorial Day',
    '2024-06-19': 'Juneteenth',
    '2024-07-04': 'Independence Day',
    '2024-09-02': 'Labor Day',
    '2024-10-14': 'Columbus Day',
    '2024-10-31': 'Halloween',
    '2024-11-11': 'Veterans Day',
    '2024-11-28': 'Thanksgiving Day',
    '2024-12-25': 'Christmas Day',
    '2024-12-31': "New Year's Eve"
  },
  'US-2025': {
    '2025-01-01': "New Year's Day",
    '2025-01-20': 'Martin Luther King Jr. Day',
    '2025-02-14': "Valentine's Day",
    '2025-02-17': "Presidents' Day",
    '2025-03-17': "St. Patrick's Day",
    '2025-04-20': 'Easter Sunday',
    '2025-05-26': 'Memorial Day',
    '2025-06-19': 'Juneteenth',
    '2025-07-04': 'Independence Day',
    '2025-09-01': 'Labor Day',
    '2025-10-13': 'Columbus Day',
    '2025-10-31': 'Halloween',
    '2025-11-11': 'Veterans Day',
    '2025-11-27': 'Thanksgiving Day',
    '2025-12-25': 'Christmas Day',
    '2025-12-31': "New Year's Eve"
  },
  'US-2026': {
    '2026-01-01': "New Year's Day",
    '2026-01-19': 'Martin Luther King Jr. Day',
    '2026-02-14': "Valentine's Day",
    '2026-02-16': "Presidents' Day",
    '2026-03-17': "St. Patrick's Day",
    '2026-04-05': 'Easter Sunday',
    '2026-05-25': 'Memorial Day',
    '2026-06-19': 'Juneteenth',
    '2026-07-04': 'Independence Day',
    '2026-09-07': 'Labor Day',
    '2026-10-12': 'Columbus Day',
    '2026-10-31': 'Halloween',
    '2026-11-11': 'Veterans Day',
    '2026-11-26': 'Thanksgiving Day',
    '2026-12-25': 'Christmas Day',
    '2026-12-31': "New Year's Eve"
  },

  // UNITED KINGDOM
  'GB-2024': {
    '2024-01-01': "New Year's Day",
    '2024-03-29': 'Good Friday',
    '2024-04-01': 'Easter Monday',
    '2024-05-06': 'Early May Bank Holiday',
    '2024-05-27': 'Spring Bank Holiday',
    '2024-08-26': 'Summer Bank Holiday',
    '2024-12-25': 'Christmas Day',
    '2024-12-26': 'Boxing Day'
  },
  'GB-2025': {
    '2025-01-01': "New Year's Day",
    '2025-04-18': 'Good Friday',
    '2025-04-21': 'Easter Monday',
    '2025-05-05': 'Early May Bank Holiday',
    '2025-05-26': 'Spring Bank Holiday',
    '2025-08-25': 'Summer Bank Holiday',
    '2025-12-25': 'Christmas Day',
    '2025-12-26': 'Boxing Day'
  },
  'GB-2026': {
    '2026-01-01': "New Year's Day",
    '2026-04-03': 'Good Friday',
    '2026-04-06': 'Easter Monday',
    '2026-05-04': 'Early May Bank Holiday',
    '2026-05-25': 'Spring Bank Holiday',
    '2026-08-31': 'Summer Bank Holiday',
    '2026-12-25': 'Christmas Day',
    '2026-12-26': 'Boxing Day'
  }
};

// Generic month-day fallback for other countries and other years
const GENERIC_RECURRING_HOLIDAYS: Record<string, Record<string, string>> = {
  IN: {
    '01-01': "New Year's Day",
    '01-14': 'Makar Sankranti',
    '01-26': 'Republic Day',
    '04-14': 'Ambedkar Jayanti',
    '08-15': 'Independence Day',
    '10-02': 'Gandhi Jayanti',
    '12-25': 'Christmas Day'
  },
  US: {
    '01-01': "New Year's Day",
    '06-19': 'Juneteenth',
    '07-04': 'Independence Day',
    '10-31': 'Halloween',
    '11-11': 'Veterans Day',
    '12-25': 'Christmas Day'
  },
  GB: {
    '01-01': "New Year's Day",
    '12-25': 'Christmas Day',
    '12-26': 'Boxing Day'
  },
  CA: {
    '01-01': "New Year's Day",
    '07-01': 'Canada Day',
    '09-30': 'Truth & Reconciliation Day',
    '11-11': 'Remembrance Day',
    '12-25': 'Christmas Day',
    '12-26': 'Boxing Day'
  },
  AU: {
    '01-01': "New Year's Day",
    '01-26': 'Australia Day',
    '04-25': 'Anzac Day',
    '12-25': 'Christmas Day',
    '12-26': 'Boxing Day'
  },
  DE: {
    '01-01': "New Year's Day",
    '05-01': 'Labour Day',
    '10-03': 'German Unity Day',
    '12-25': 'Christmas Day',
    '12-26': "St. Stephen's Day"
  },
  JP: {
    '01-01': "New Year's Day",
    '02-11': 'National Foundation Day',
    '02-23': "Emperor's Birthday",
    '04-29': 'Showa Day',
    '05-03': 'Constitution Memorial Day',
    '05-05': "Children's Day",
    '08-11': 'Mountain Day',
    '11-03': 'Culture Day',
    '11-23': 'Labor Thanksgiving Day'
  },
  SG: {
    '01-01': "New Year's Day",
    '05-01': 'Labour Day',
    '08-09': 'National Day',
    '12-25': 'Christmas Day'
  }
};

const cache: Record<string, Record<string, string>> = {};

export async function fetchCountryHolidays(countryCode: string, year: number): Promise<Record<string, string>> {
  const cacheKey = `${countryCode}-${year}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const holidayMap: Record<string, string> = {};

  // 1. Load curated high-precision accurate dataset for this year
  const specificYearData = ACCURATE_YEAR_HOLIDAYS[cacheKey];
  if (specificYearData) {
    Object.assign(holidayMap, specificYearData);
  }

  // 2. Fetch public holidays from API if country is supported
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`, {
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok && res.status === 200) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          if (item.date && item.name) {
            // Keep specific festival name if already curated, otherwise add
            if (!holidayMap[item.date]) {
              holidayMap[item.date] = item.name;
            }
          }
        });
      }
    }
  } catch {
    // Continue with curated and fallback datasets
  }

  // 3. Fallback to generic recurring holidays if map is still empty
  if (Object.keys(holidayMap).length === 0) {
    const generic = GENERIC_RECURRING_HOLIDAYS[countryCode] || GENERIC_RECURRING_HOLIDAYS['US'];
    for (const [monthDay, name] of Object.entries(generic)) {
      holidayMap[`${year}-${monthDay}`] = name;
    }
  }

  cache[cacheKey] = holidayMap;
  return holidayMap;
}
