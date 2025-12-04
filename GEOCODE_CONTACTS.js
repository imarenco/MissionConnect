// Quick test script to geocode all your existing contacts
// Run this in your browser console on the map page or call the endpoint directly

// Step 1: Get your auth token (check localStorage)
const token = localStorage.getItem('@missionconnect:token');
console.log('Token found:', !!token);

// Step 2: Call the geocode endpoint
if (token) {
  fetch('http://localhost:3001/api/contacts/geocode/all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log('✅ Geocoding result:', data);
    alert(`Geocoded ${data.geocodedCount} contacts out of ${data.totalCount}`);
    // Refresh the page to see the map
    window.location.reload();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    alert('Error geocoding contacts. Check console for details.');
  });
} else {
  alert('No auth token found. Please log in first.');
}
