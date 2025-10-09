// Location utilities for attendance tracking
export interface Location {
  latitude: number;
  longitude: number;
}

export interface CompanyLocation extends Location {
  name: string;
  address: string;
  radius: number; // in meters
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(pos1: Location, pos2: Location): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = pos1.latitude * Math.PI/180;
  const φ2 = pos2.latitude * Math.PI/180;
  const Δφ = (pos2.latitude-pos1.latitude) * Math.PI/180;
  const Δλ = (pos2.longitude-pos1.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Get current user location
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

// Check if user is within company location range
export function isWithinRange(userLocation: Location, companyLocation: CompanyLocation): boolean {
  const distance = calculateDistance(userLocation, companyLocation);
  return distance <= companyLocation.radius;
}

// Default company locations
export const COMPANY_LOCATIONS: CompanyLocation[] = [
  {
    name: 'Brands Elevate Solutions - Main Office',
    address: '123 Business Street, Tech City, TC 12345',
    latitude: 40.7128, // Example coordinates (New York)
    longitude: -74.0060,
    radius: 500, // 500 meters
  },
  {
    name: 'Brands Elevate Solutions - Branch Office',
    address: '456 Innovation Ave, Tech City, TC 12346',
    latitude: 40.7589,
    longitude: -73.9851,
    radius: 300, // 300 meters
  },
];