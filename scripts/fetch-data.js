import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function scrapeProjects() {
  try {
    console.log('Scrapetaan hankkeita valtioneuvosto.fi:stä...');
    
    // Hae hankkeet-sivu
    const response = await fetch('https://valtioneuvosto.fi/hankkeet', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Ladattiin ${html.length} merkkiä HTML:ää`);
    
    const $ = cheerio.load(html);
    const projects = [];
    
    // Etsi hanke-elementtejä (tämä vaatii sivun rakenteen tutkimista)
    $('.hanke-item, .project-item, .list-item').each((index, element) => {
      const $el = $(element);
      
      // Poimi tiedot HTML-elementeistä
      const title = $el.find('.title, h3, h2').first().text().trim();
      const ministry = $el.find('.ministry, .ministeriö').text().trim();
      const status = $el.find('.status, .tila').text().trim();
      const description = $el.find('.description, .kuvaus').text().trim();
      
      if (title && title.length > 10) { // Vain jos löytyy oikea otsikko
        projects.push({
          id: `SCRAPED${String(index).padStart(3, '0')}:00/2025`,
          title: title,
          ministry: ministry || "Tuntematon ministeriö",
          ministryCode: getMinistryCode(ministry),
          status: status || "Käynnissä",
          startDate: new Date().toISOString().split('T')[0],
          endDate: "2025-12-31",
          description: description || "Kuvaus ei saatavilla",
          phase: status || "Selvitystyö",
          category: "Lainvalmistelu",
          caseNumbers: [`SCRAPED/${index}/2025`],
          governmentProgramme: "Orpo",
          strategicAreas: ["Web scraping"],
          contacts: [{ name: "Automaatti", role: "Järjestelmä", period: "2025 –" }]
        });
      }
    });
    
    // Jos ei löydy mitään, käytä fallback-dataa
    if (projects.length === 0) {
      console.log('Ei löytynyt hankkeita, käytetään fallback-dataa');
      projects.push({
        id: `FALLBACK001:00/2025`,
        title: `Web scraping testi ${new Date().toLocaleDateString('fi-FI')}`,
        ministry: "Testiministeriö",
        ministryCode: "TEST",
        status: "Käynnissä",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "2025-12-31",
        description: `Tämä hanke luotiin automaattisesti web scraping -testinä ${new Date().toLocaleString('fi-FI')}`,
        phase: "Testaus",
        category: "Kehittämishankkeet",
        caseNumbers: ["TEST/001/2025"],
        governmentProgramme: "Orpo",
        strategicAreas: ["Automaatio"],
        contacts: [{ name: "Scraper Bot", role: "Automaatti", period: "2025 –" }]
      });
    }
    
    // Tallenna tulokset
    fs.writeFileSync('./public/data/projects.json', JSON.stringify(projects, null, 2));
    console.log(`Tallennettu ${projects.length} hanketta`);
    
  } catch (error) {
    console.error('Web scraping epäonnistui:', error);
    
    // Fallback: tallenna ainakin yksi testi-hanke
    const fallbackProject = [{
      id: `ERROR001:00/2025`,
      title: `Scraping-virhe ${new Date().toLocaleDateString('fi-FI')}`,
      ministry: "Virheministerio", 
      ministryCode: "ERR",
      status: "Epäonnistui",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "2025-12-31",
      description: `Scraping epäonnistui: ${error.message}`,
      phase: "Virhetila",
      category: "Virheet",
      caseNumbers: ["ERR/001/2025"],
      governmentProgramme: "Orpo",
      strategicAreas: ["Virheiden käsittely"],
      contacts: [{ name: "Error Handler", role: "Virheenkäsittelijä", period: "2025 –" }]
    }];
    
    fs.writeFileSync('./public/data/projects.json', JSON.stringify(fallbackProject, null, 2));
    process.exit(1);
  }
}

function getMinistryCode(ministry) {
  const codes = {
    'liikenne': 'LVM',
    'sisäministeriö': 'SM', 
    'sosiaali': 'STM',
    'valtiovarain': 'VM',
    'ympäristö': 'YM',
    'oikeus': 'OM',
    'opetus': 'OKM',
    'työ': 'TEM',
    'ulko': 'UM',
    'valtioneuvoston kanslia': 'VNK'
  };
  
  const lower = ministry.toLowerCase();
  for (const [key, code] of Object.entries(codes)) {
    if (lower.includes(key)) return code;
  }
  return 'UNK';
}

scrapeProjects();
