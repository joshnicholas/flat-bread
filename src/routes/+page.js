export async function load({ fetch }) {
  try {
    const sheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1CSi77xtaTLy7SewVBbYxxje96VjdNx61ljrVpmYVCAl7wJa3faWB3WI5GsM0AsPaBU3OcXSveOiX/pub?gid=399960736&single=true&output=csv';
    
    const response = await fetch(sheetsUrl);
    const csvText = await response.text();
    
    // console.log('CSV response:', csvText); // Debug line
    
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { data: [] };
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      return row;
    });
    
    // console.log('Parsed data:', data); // Debug line
    
    return { data };
  } catch (error) {
    console.error('Load error:', error);
    return { data: [] };
  }
}