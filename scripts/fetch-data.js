import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function scrapeProjects() {
  try {
    console.log('Scrapetaan hankkeita valtioneuvosto.fi:stä...');
    
    const response = await fetch('https://valtioneuvosto.fi/hankkeet', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    console.log(`Ladattiin ${html.length} merkkiä HTML:ää`);
    
    const $ = cheerio.load(html);
    const projects = [];
    
    // Debug: analysoidaan sivun rakennetta
    console.log('Analysoidaan sivun rakennetta...');
    
    // Etsitään kaikki linkit jotka sisältävät "hanke" tai "project"
    $('a[href*="project"], a[href*="hanke"]').each((i, el) => {
      const link = $(el).attr('href');
      const text = $(el).text().trim();
      console.log(`Löytyi hankelinkki: ${text} -> ${link}`);
    });
    
    // Etsitään otsikoita jotka voivat olla hanke-otsikoita
    $('h1, h2, h3, h4, .title, [class*="title"], [class*="heading"]').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 10 && text.length < 200) {
        const parent = $(el).parent();
        const ministry = parent.find('[class*="ministry"], [class*="ministeri"], [class*="org"]').text().trim();
        
        if (text.includes('lain') || text.includes('hanke') || text.includes('selvitys') || 
            text.includes('uudistus') || text.includes('kehittäminen')) {
          
          console.log(`Mahdollinen hanke: ${text}`);
          console.log(`Ministeriö: ${ministry}`);
          
          projects.push({
            id: `SCRAPED${String(projects.length + 1).padStart(3, '0')}:00/2025`,
            title: text,
            ministry: ministry || "Tuntematon ministeriö",
            ministryCode: getMinistryCode(ministry || text),
            status: "Käynnissä",
            startDate: new Date().toISOString().split('T')[0],
            endDate: "2025-12-31",
            description: `Scrapettu hanke: ${text}`,
            phase: "Selvitystyö",
            category: "Lainvalmistelu",
            caseNumbers: [`SCRAPED/${projects.length + 1}/2025`],
            governmentProgramme: "Orpo",
            strategicAreas: ["Web scraping"],
            contacts: [{ name: "Automaatti", role: "Järjestelmä", period: "2025 –" }]
          });
        }
      }
    });
    
    // Jos ei löytynyt mitään, luo testi-hanke
    if (projects.length === 0) {
      projects.push({
        id: `DEBUG001:00/2025`,
        title: `Debug: HTML-analyysi ${new Date().toLocaleDateString('fi-FI')}`,
        ministry: "Debug-ministeriö",
        ministryCode: "DBG",
        status: "Analysoidaan",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "2025-12-31",
        description: `HTML ladattiin onnistuneesti (${html.length} merkkiä), mutta ei löydetty tunnistettavia hanke-elementtejä.`,
        phase: "Debug",
        category: "Kehittämishankkeet",
        caseNumbers: ["DBG/001/2025"],
        governmentProgramme: "Orpo",
        strategicAreas: ["Debugging"],
        contacts: [{ name: "Debug Bot", role: "Analysoija", period: "2025 –" }]
      });
    }
    
    fs.writeFileSync('./public/data/projects.json', JSON.stringify(projects, null, 2));
    console.log(`Tallennettu ${projects.length} hanketta`);
    
  } catch (error) {
    console.error('Scraping epäonnistui:', error);
    // Fallback-koodi pysyy samana
  }
}

function getMinistryCode(text) {
  const codes = {
    'liikenne': 'LVM', 'sisä': 'SM', 'sosiaali': 'STM', 'valtiovarain': 'VM',
    'ympäristö': 'YM', 'oikeus': 'OM', 'opetus': 'OKM', 'työ': 'TEM',
    'ulko': 'UM', 'valtioneuvoston': 'VNK'
  };
  
  const lower = text.toLowerCase();
  for (const [key, code] of Object.entries(codes)) {
    if (lower.includes(key)) return code;
  }
  return 'UNK';
}

scrapeProjects();
