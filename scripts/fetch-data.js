import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function scrapeProjects() {
  try {
    console.log('=== DEBUG: Aloitetaan scraping ===');
    
    const response = await fetch('https://valtioneuvosto.fi/hankkeet', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    console.log(`HTML ladattu: ${html.length} merkkiä`);
    
    const $ = cheerio.load(html);
    const projects = [];
    
    console.log('=== Etsitään linkkejä ===');
    let linkCount = 0;
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && (href.includes('project') || href.includes('hanke')) && text.length > 10) {
        console.log(`Linkki ${++linkCount}: "${text}" -> ${href}`);
      }
    });
    
    console.log('=== Etsitään otsikoita ===');
    let titleCount = 0;
    $('h1, h2, h3, h4').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 15) {
        console.log(`Otsikko ${++titleCount}: "${text}"`);
        
        if (text.toLowerCase().includes('lain') || 
            text.toLowerCase().includes('hanke') || 
            text.toLowerCase().includes('selvitys')) {
          console.log('  ^^ HANKE LÖYTYI!');
          
          projects.push({
            id: `FOUND${String(projects.length + 1).padStart(3, '0')}:00/2025`,
            title: text,
            ministry: "Scrapettu ministeriö",
            ministryCode: "FOUND",
            status: "Löydetty",
            startDate: new Date().toISOString().split('T')[0],
            endDate: "2025-12-31",
            description: `Automaattisesti löydetty hanke web scrapingillä: ${text}`,
            phase: "Löydetty",
            category: "Lainvalmistelu", 
            caseNumbers: [`FOUND/${projects.length + 1}/2025`],
            governmentProgramme: "Orpo",
            strategicAreas: ["Web scraping success"],
            contacts: [{ name: "Scraper", role: "Finder", period: "2025 –" }]
          });
        }
      }
    });
    
    console.log(`=== YHTEENVETO: ${linkCount} linkkiä, ${titleCount} otsikkoa, ${projects.length} hanketta ===`);
    
    if (projects.length === 0) {
      projects.push({
        id: `NOFOUND001:00/2025`,
        title: `Ei hankkeita: ${linkCount} linkkiä, ${titleCount} otsikkoa`,
        ministry: "Debug",
        ministryCode: "NO",
        status: "Debug",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "2025-12-31",
        description: `Scraping debug: Analysoitiin ${html.length} merkkiä HTML:ää, löydettiin ${linkCount} linkkiä ja ${titleCount} otsikkoa, mutta ei tunnistettavia hankkeita.`,
        phase: "Debug",
        category: "Debug",
        caseNumbers: ["DEBUG/001/2025"],
        governmentProgramme: "Orpo",
        strategicAreas: ["Debugging"],
        contacts: [{ name: "Debug", role: "Tester", period: "2025 –" }]
      });
    }
    
    fs.writeFileSync('./public/data/projects.json', JSON.stringify(projects, null, 2));
    console.log(`=== VALMIS: Tallennettu ${projects.length} hanketta ===`);
    
  } catch (error) {
    console.error('VIRHE:', error);
    process.exit(1);
  }
}

scrapeProjects();
