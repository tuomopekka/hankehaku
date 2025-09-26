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
    
    console.log('=== DEBUG: Analysoidaan sivun rakennetta ===');
    
    // Etsitään linkkejä
    let linkCount = 0;
    $('a[href*="project"], a[href*="hanke"]').each((i, el) => {
      const link = $(el).attr('href');
      const text = $(el).text().trim();
      if (text.length > 5) {
        console.log(`Hankelinkki ${++linkCount}: "${text}" -> ${link}`);
      }
    });
    console.log(`Löytyi ${linkCount} hankelinkkiä`);
    
    // Etsitään otsikoita  
    let titleCount = 0;
    $('h1, h2, h3, h4').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 10 && text.length < 200) {
        console.log(`Otsikko ${++titleCount}: "${text}"`);
        
        if (text.includes('lain') || text.includes('hanke') || text.includes('selvitys')) {
          console.log('  -> Tämä näyttää hankkeelta!');
          projects.push({
            id: `SCRAPED${String(projects.length + 1).padStart(3, '0')}:00/2025`,
            title: text,
            ministry: "Scrapettu ministeriö",
            ministryCode: "SCR",
            status: "Käynnissä",
            startDate: new Date().toISOString().split('T')[0],
            endDate: "2025-12-31",
            description: `Automaattisesti scrapettu hanke: ${text}`,
            phase: "Selvitystyö",
            category: "Lainvalmistelu",
            caseNumbers: [`SCR/${projects.length + 1}/2025`],
            governmentProgramme: "Orpo",
            strategicAreas: ["Web scraping"],
            contacts: [{ name: "Scraper Bot", role: "Automaatti", period: "2025 –" }]
          });
        }
      }
    });
    console.log(`Analysoitiin ${titleCount} otsikkoa`);
    
    if (projects.length === 0) {
      console.log('DEBUG: Ei löytynyt tunnistettavia hankkeita');
      projects.push({
        id: `DEBUG001:00/2025`,
        title: `HTML-analyysi: ${linkCount} linkkiä, ${titleCount} otsikkoa`,
        ministry: "Debug-ministeriö",
        ministryCode: "DBG", 
        status: "Debug",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "2025-12-31",
        description: `Scrapettu ${html.length} merkkiä HTML:ää. Löydetty ${linkCount} hankelinkkiä ja ${titleCount} otsikkoa, mutta ei tunnistettuja hanke-elementtejä.`,
        phase: "Debug",
        category: "Kehittämishankkeet",
        caseNumbers: ["DBG/001/2025"],
        governmentProgramme: "Orpo", 
        strategicAreas: ["Debugging"],
        contacts: [{ name: "Debug Bot", role: "Analysoija", period: "2025 –" }]
      });
    }
    
    fs.writeFileSync('./public/data/projects.json', JSON.stringify(projects, null, 2));
    console.log(`=== Tallennettu ${projects.length} hanketta ===`);
    
  } catch (error) {
    console.error('Scraping epäonnistui:', error);
    process.exit(1);
  }
}

scrapeProjects();
