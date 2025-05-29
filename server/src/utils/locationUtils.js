// Abbottabad coordinates boundary (approximate)
const ABBOTTABAD_BOUNDS = {
    north: 34.2500, // North boundary latitude
    south: 34.0700, // South boundary latitude
    east: 73.3000,  // East boundary longitude
    west: 73.1300   // West boundary longitude
  };
  
  // Check if coordinates are within Abbottabad region
  export const isPointInAbbottabad = (latitude, longitude) => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    return (
      lat >= ABBOTTABAD_BOUNDS.south &&
      lat <= ABBOTTABAD_BOUNDS.north &&
      lng >= ABBOTTABAD_BOUNDS.west &&
      lng <= ABBOTTABAD_BOUNDS.east
    );
  };
  
  // Calculate straight-line distance between two points (in km)
  export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  function deg2rad(deg) {
    return deg * (Math.PI/180);
  }