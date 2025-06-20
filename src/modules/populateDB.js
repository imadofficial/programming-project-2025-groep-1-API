// Load bedrijvenlijst.json
const bedrijven = require('../../data/bedrijvenlijst.json');

// List of random cities in Belgium, Netherlands, or France
const cities = [
  'Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Mechelen',
  'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'
];

function getEmailFromUrl(url) {
  // Remove protocol
  let cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  // Only take the domain part
  const domain = cleanUrl.split('/')[0];
  // Use the domain for email
  return `contact@${domain}`;
}

function getRandomCity() {
  return cities[Math.floor(Math.random() * cities.length)];
}

function getRandomSectorId() {
  return Math.floor(Math.random() * 5) + 1; // 1 to 5
}

function getFaviconUrl(url) {
  // Remove protocol and www
  let cleanUrl = url.replace(/^https?:\/\//, '');
  // Only take the domain part
  const domain = cleanUrl.split('/')[0];
  return `https://${domain}/favicon.ico`;
}

async function isFaviconAccessible(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function registerBedrijven() {
  for (const bedrijf of bedrijven) {
    const email = getEmailFromUrl(bedrijf.url);
    const profiel_foto_url = getFaviconUrl(bedrijf.url);
    let profiel_foto = null;
    if (await isFaviconAccessible(profiel_foto_url)) {
      profiel_foto = profiel_foto_url;
    }
    const body = {
      email: email,
      password: 'password123',
      naam: bedrijf.name,
      plaats: getRandomCity(),
      contact_email: email,
      sector_id: getRandomSectorId(),
      profiel_foto: profiel_foto
    };
    try {
      const response = await fetch('https://api.ehb-match.me/auth/register/bedrijf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      console.log(`Registered ${bedrijf.name}:`, result);
    } catch (error) {
      console.error(`Error registering ${bedrijf.name}:`, error);
    }
  }
}

registerBedrijven();
