/**
 * UIC campus buildings – events can only be added at these locations.
 * Address data from UIC FIMWeb Campus Visitor Map (fimweb.fim.uic.edu).
 * Zip codes: East Campus 60607 | West Campus/Medical 60612 | Law/Downtown 60604 | 5525 Pulaski 60632
 */

/** Full address for a UIC building. */
export type UicBuildingAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

/** UIC building with name and full address. */
export type UicBuilding = {
  name: string;
  address: UicBuildingAddress;
};

/** Suggestion item for the building autocomplete dropdown. */
export type UicBuildingSuggestion = { id: string; name: string; address?: string };

/** Format address for display or geocoding. */
export function formatAddress(addr: UicBuildingAddress): string {
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
}

const UIC_BUILDINGS: UicBuilding[] = [
  // East Campus (60607)
  { name: "Academic & Residential Complex", address: { street: "940 W. Harrison St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Addams Hall", address: { street: "830 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Architecture and Design Studios", address: { street: "845 W. Harrison St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Art and Exhibition Hall", address: { street: "400 S. Peoria St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Behavioral Sciences Building", address: { street: "1007 W. Harrison St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Burnham Hall", address: { street: "828 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Chemical Engineering Building", address: { street: "810 S. Clinton St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Co-Generation Facility", address: { street: "1120 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "College of Urban Planning & Public Affairs Hall", address: { street: "412 S. Peoria St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Computer Design Research and Learning Center", address: { street: "900 W. Taylor St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Credit Union 1 Arena", address: { street: "525 S. Racine Ave.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Douglass Hall", address: { street: "705 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Education, Theatre, Music and Social Work", address: { street: "1040 W. Harrison St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Engineering Innovation Building", address: { street: "929 W. Taylor St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Engineering Research Facility", address: { street: "842 W. Taylor St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Flames Athletic Center", address: { street: "839 W. Roosevelt Rd.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Grant Hall", address: { street: "703 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Henry Hall", address: { street: "935 W. Harrison St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Jane Addams Hull-House Museum", address: { street: "800 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Jane Addams' Hull-House Dining Hall", address: { street: "800 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Jefferson Hall", address: { street: "929 W. Harrison St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Lecture Center Building A", address: { street: "805 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Lecture Center Building B", address: { street: "803 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Lecture Center Building C", address: { street: "802 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Lecture Center Building D", address: { street: "804 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Lecture Center Building E", address: { street: "806 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Lecture Center Building F", address: { street: "807 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Lincoln Hall", address: { street: "707 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Maxwell Street Parking Structure", address: { street: "701 W. Maxwell St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Physical Education Building", address: { street: "901 W. Roosevelt Rd.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Physical Plant Building", address: { street: "1140 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Plant Research Laboratory", address: { street: "1020 S. Union St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Richard J. Daley Library", address: { street: "801 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Roosevelt Road Building", address: { street: "728 W. Roosevelt Rd.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Science & Engineering Laboratory East", address: { street: "950 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Science & Engineering Laboratory West", address: { street: "900 W. Taylor St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Science & Engineering Offices", address: { street: "851 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Science & Engineering South", address: { street: "845 W. Taylor St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Stevenson Hall", address: { street: "701 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Student Recreation Facility", address: { street: "737 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Student Residence and Commons Courtyard", address: { street: "600 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Student Residence and Commons North", address: { street: "650 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Student Residence and Commons South", address: { street: "700 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Student Residence and Commons West", address: { street: "901 W. Harrison St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Student Services Building", address: { street: "1200 W. Harrison St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Taft Hall", address: { street: "826 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Taylor Street Building", address: { street: "1101 W. Taylor St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Teaching Excellence Building", address: { street: "924 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Transportation Facility", address: { street: "1351 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "UIC Police Station", address: { street: "943 W. Maxwell St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "UIC Student Center East", address: { street: "750 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "UIC Student Center East Tower", address: { street: "710 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "UIC Theatre", address: { street: "1044 W. Harrison St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "University Hall", address: { street: "601 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Utilities Building", address: { street: "1100 S. Morgan St.", city: "Chicago", state: "IL", zip: "60607" } },
  // West Campus (60612)
  { name: "2242 West Harrison", address: { street: "2242 W. Harrison St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "5525 South Pulaski Road Building", address: { street: "5525 S. Pulaski Rd.", city: "Chicago", state: "IL", zip: "60632" } },
  { name: "Administrative Office Building", address: { street: "1737 W. Polk St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Applied Health Sciences Building", address: { street: "1919 W. Taylor St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Benjamin Goldberg Research Center", address: { street: "1940 W. Taylor St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Biologic Resources Laboratory", address: { street: "1840 W. Taylor St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Center for Structural Biology", address: { street: "1100 S. Ashland Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Clinical Sciences Building", address: { street: "840 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Clinical Sciences North", address: { street: "820 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "College of Dentistry", address: { street: "801 S. Paulina St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "College of Medicine East Tower", address: { street: "808 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "College of Medicine Research Building", address: { street: "909 S. Wolcott Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "College of Medicine West", address: { street: "1819 W. Polk St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "College of Medicine West Tower", address: { street: "1853 W. Polk St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "College of Nursing", address: { street: "845 S. Damen Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "College of Pharmacy", address: { street: "833 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Disability, Health and Social Policy Building", address: { street: "1640 W. Roosevelt Rd.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Environmental Health and Safety Offices", address: { street: "1129 S. Hermitage Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Eye and Ear Infirmary", address: { street: "1855 W. Taylor St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Human Resources Building", address: { street: "715 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Incubator Laboratory Facility", address: { street: "2211 W. Campbell Park Dr.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Laflin Warehouse Building", address: { street: "1515 W. 15th St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Library of the Health Sciences", address: { street: "1705 W. Polk St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Lions of Illinois Eye Research Institute", address: { street: "1905 W. Taylor St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Marshfield Avenue Building", address: { street: "809 S. Marshfield Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Medical Center Administration Building", address: { street: "914 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Medical Sciences Building", address: { street: "835 S. Wolcott Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Mile Square Health Center", address: { street: "1220 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Molecular Biology Research Building", address: { street: "900 S. Ashland Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "NMR Laboratories", address: { street: "830 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Neuropsychiatric Institute", address: { street: "912 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "On the Mall", address: { street: "1717 W. Polk St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Outpatient Care Center", address: { street: "1801 W. Taylor St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Paulina Street Building", address: { street: "1140 S. Paulina St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Polk Street Residence Hall", address: { street: "1933 W. Polk St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "School of Public Health and Psychiatric Institute", address: { street: "1601 W. Taylor St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "School of Public Health-West", address: { street: "2121 W. Taylor St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Single Student Residence", address: { street: "809 S. Damen Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Student Residence Hall", address: { street: "818 S. Wolcott Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "UI Health Specialty Care Building", address: { street: "1009 S. Wood St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "UIC Sport and Fitness Center", address: { street: "829 S. Damen Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "UIC Student Center West", address: { street: "828 S. Wolcott Ave.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "University of Illinois Hospital", address: { street: "1740 W. Taylor St.", city: "Chicago", state: "IL", zip: "60612" } },
  { name: "Westside Research Office Building", address: { street: "1747 W. Roosevelt Rd.", city: "Chicago", state: "IL", zip: "60612" } },
  // South (60607)
  { name: "1253 South Halsted Street", address: { street: "1253 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "1309 South Halsted Street", address: { street: "1309 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "1333 South Halsted Street", address: { street: "1333 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "722 West Maxwell Street", address: { street: "722 W. Maxwell St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Curtis Granderson Stadium", address: { street: "900 W. Maxwell St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Isadore and Sadie Dorin Forum", address: { street: "725 W. Roosevelt Rd.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "James J. Stukel Towers", address: { street: "718 W. Rockford St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Marie Robinson Hall", address: { street: "811 W. Maxwell St.", city: "Chicago", state: "IL", zip: "60607" } },
  { name: "Thomas Beckham Hall", address: { street: "1250 S. Halsted St.", city: "Chicago", state: "IL", zip: "60607" } },
  // UIC Law (60604)
  { name: "19 West Jackson Blvd", address: { street: "19 W. Jackson Blvd.", city: "Chicago", state: "IL", zip: "60604" } },
  { name: "300 South State Street", address: { street: "300 S. State St.", city: "Chicago", state: "IL", zip: "60604" } },
  { name: "315 South Plymouth Court", address: { street: "315 S. Plymouth Ct.", city: "Chicago", state: "IL", zip: "60604" } },
  { name: "321 South Plymouth Court", address: { street: "321 S. Plymouth Ct.", city: "Chicago", state: "IL", zip: "60604" } },
];

const normalizedNames = UIC_BUILDINGS.map((b) => b.name.toLowerCase().trim());

/**
 * Returns UIC buildings whose names or addresses match the query (case-insensitive).
 * Search is limited to the UIC building list only—no external address lookup.
 */
export function searchUicBuildings(query: string): UicBuildingSuggestion[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return UIC_BUILDINGS.filter((b) => {
    const nameMatch = b.name.toLowerCase().includes(q);
    const addr = formatAddress(b.address).toLowerCase();
    const addressMatch = addr.includes(q);
    return nameMatch || addressMatch;
  })
    .slice(0, 25)
    .map((b, i) => ({
      id: `uic-${i}-${b.name}`,
      name: b.name,
      address: formatAddress(b.address),
    }));
}

/**
 * Returns the full building data for a given name, or undefined.
 */
export function getUicBuildingByName(name: string): UicBuilding | undefined {
  const n = name.toLowerCase().trim();
  return UIC_BUILDINGS.find((b) => b.name.toLowerCase() === n);
}

/**
 * Returns true if the given address/place name matches a known UIC building.
 */
export function isUicBuilding(placeName: string): boolean {
  const normalized = placeName.toLowerCase().trim();
  return normalizedNames.some((building) => normalized.includes(building));
}
