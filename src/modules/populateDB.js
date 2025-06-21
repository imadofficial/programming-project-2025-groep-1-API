// Load bedrijvenlijst.json
let bedrijven = require('../../data/bedrijvenlijst.json');
const { addBedrijfToEvent } = require('../sql/event');

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

function getRandomSkills() {
  const skillIds = [1, 2, 3, 4, 5, 6, 7, 8];
  const numSkills = Math.floor(Math.random() * 8) + 1; // 1 to 8
  const shuffled = skillIds.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numSkills);
}

// Function to get functies from bedrijvenlijst
function getOpleidingen(bedrijf) {
  // Take list of aanbiedingen and assign correct functie IDs by comparing everything after first space
  if (!bedrijf.doelgroep_opleiding || !Array.isArray(bedrijf.doelgroep_opleiding)) {
    return [];
  }
  const opleidingen = bedrijf.doelgroep_opleiding || [];
  return opleidingen.map(opleiding => {
    const parts = opleiding.split(' ');
    const opleidingNaam = parts.slice(1).join(' '); // Join everything after the first space
    const opleidingIds = [
      ['Toegepaste Informatica', 1],
      ['Multimedia & Creative Technologies', 2],
      ['Programmeren', 3],
      ['Systeem- & Netwerkbeheer', 4],
      ['Internet of Things', 5],
      ['Elektromechanische Systemen', 6],
    ];
    const opleidingId = opleidingIds.find(([name]) => opleidingNaam.startsWith(name));
    return opleidingId ? opleidingId[1] : null; // Return the ID or null
  });
}

function getFuncties(bedrijf) {
  if (!bedrijf.aanbiedingen || !Array.isArray(bedrijf.aanbiedingen)) {
    return [];
  }
  const functies = bedrijf.aanbiedingen || [];
  return functies.map(functie => {
    const functieIds = [
      ['Job(s)', Math.floor(Math.random() * 2) + 1], // Random ID for Job(s)
      ['Stage(s)', 3],
      ['Studentenjob(s)', 4],
      ['Bachelorproef', 5],
    ];
    const functieId = functieIds.find(([name]) => functie.startsWith(name));
    return functieId ? functieId[1] : null; // Return the ID or null
  });
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
      addSkills(result.Id); // Add skills after registration

      addOpleidingen(bedrijf, result.Id); // Add opleidingen after registration

      addFuncties(bedrijf, result.Id); // Add functies after registration

      addEvents(result.Id); // Add events after registration
    } catch (error) {
      console.error(`Error registering ${bedrijf.name}:`, error);
    }
  }
}

const apiKEY = process.env.SCRIPT_API_KEY;

async function addSkills(bedrijfId) {
  const skills = await getRandomSkills();
  if (skills.length > 0) {
    try {
      const response = await fetch(`https://api.ehb-match.me/bedrijven/${bedrijfId}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKEY}` },
        body: JSON.stringify({ skills: skills })
      });
      const result = await response.json();
      console.log(`Added skills for ${bedrijfId}:`, result);
    } catch (error) {
      console.error(`Error adding skills for ${bedrijfId}:`, error);
    }
  }
}

async function addOpleidingen(bedrijf, bedrijfId) {
  const opleidingen = await getOpleidingen(bedrijf);
  if (opleidingen.length > 0) {
    try {
      const response = await fetch(`https://api.ehb-match.me/bedrijven/${bedrijfId}/opleidingen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKEY}` },
        body: JSON.stringify({ opleidingen: opleidingen })
      });
      const result = await response.json();
      console.log(`Added opleidingen for ${bedrijfId}:`, result);
    } catch (error) {
      console.error(`Error adding opleidingen for ${bedrijfId}:`, error);
    }
  }

}

async function addFuncties(bedrijf, bedrijfId) {
  const functies = await getFuncties(bedrijf);
  if (functies.length > 0) {
    try {
      const response = await fetch(`https://api.ehb-match.me/bedrijven/${bedrijfId}/functies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKEY}` },
        body: JSON.stringify({ functies: functies })
      });
      const result = await response.json();
      console.log(`Added functies for ${bedrijfId}:`, result);
    } catch (error) {
      console.error(`Error adding functies for ${bedrijfId}:`, error);
    }
  }
}

async function addEvents(bedrijfId) {
  const eventIds = [2];
  try {
    const response = await fetch(`https://api.ehb-match.me/bedrijven/${bedrijfId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKEY}` },
      body: JSON.stringify({ event_ids: eventIds })
  });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log(`Added events for ${bedrijfId}:`, result);
    } catch (error) {
      console.error(`Error adding events for ${bedrijfId}:`, error);
    }
}

registerBedrijven();
