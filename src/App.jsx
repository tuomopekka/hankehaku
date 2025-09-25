import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Building, User, ExternalLink, FileText, Download, Loader, ChevronDown } from 'lucide-react';

// Google Fonts import for Noto Sans and Roboto Condensed
if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&family=Roboto+Condensed:wght@300;400;500;600;700&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
}

// Apply fonts
document.body.style.fontFamily = '"Noto Sans", sans-serif';

// Add CSS for headings
if (!document.querySelector('#custom-font-styles')) {
  const style = document.createElement('style');
  style.id = 'custom-font-styles';
  style.textContent = `
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Roboto Condensed', sans-serif !important;
    }
  `;
  document.head.appendChild(style);
}

// Toimiva staattinen data 4 hankkeella testausta varten
const allProjects = [
  {
    id: "LVM031:00/2019",
    title: "Suurten raidehankkeiden edistäminen",
    ministry: "Liikenne- ja viestintäministeriö",
    ministryCode: "LVM",
    status: "Valmis",
    startDate: "2019-09-10",
    endDate: "2021-12-31",
    description: "Joulukuussa 2020 perustettiin Suomi-rata Oy ja Turun Tunnin Juna Oy suunnittelemaan Suomi-rataa ja tunnin Helsinki-Turku -raideyhteyttä. Valtion osuus yhtiöissä on 51 prosenttia.",
    phase: "Toteutettu",
    category: "Kehittämishankkeet",
    caseNumbers: ["LVM/235/01/2019", "VN/7618/2019"],
    governmentProgramme: "Marin",
    strategicAreas: ["Dynaaminen ja vireä Suomi", "Liikenneverkkojen kehittäminen"],
    contacts: [{ name: "Jääskeläinen, Mikko", role: "Erityisasiantuntija", period: "29.6. – 31.12.2021" }]
  },
  {
    id: "VNK007:00/2024",
    title: "Valtioneuvoston turvallisuusjohtamisen toimintamallin kehittäminen",
    ministry: "Valtioneuvoston kanslia",
    ministryCode: "VNK",
    status: "Käynnissä",
    startDate: "2024-03-20",
    endDate: "2024-12-31",
    description: "Hankkeen tehtävänä on valmistella ehdotukset valtioneuvostotason turvallisuusjohtamisen rakenteisiin, resursseihin ja hallintoon sekä poliittisen ohjauksen muotoihin.",
    phase: "Valmistelu",
    category: "Selonteot",
    caseNumbers: ["VNK007:00/2024"],
    governmentProgramme: "Orpo",
    strategicAreas: ["Turvallinen Suomi"],
    contacts: [{ name: "Martikainen, Harri", role: "Osastopäällikkö", period: "20.3.2024 –" }]
  },
  {
    id: "STM040:00/2024",
    title: "Sosiaali- ja terveystietojen toissijaisen käytön lain muuttaminen",
    ministry: "Sosiaali- ja terveysministeriö",
    ministryCode: "STM",
    status: "Lausuntokierros",
    startDate: "2024-02-15",
    endDate: "2025-06-30",
    description: "Hankkeen tarkoituksena on mahdollistaa hyvä toimintaympäristö sekä kotimaisille että kansainvälisille TKI-alan toimijoille kansalaisten oikeuksia ja yksityisyyttä kunnioittaen.",
    phase: "Lausuntokierros",
    category: "Lainvalmistelu",
    caseNumbers: ["STM040:00/2024"],
    governmentProgramme: "Orpo",
    strategicAreas: ["Terveydenhuollon digitalisaatio"],
    contacts: [{ name: "Komulainen, Joni", role: "Neuvotteleva virkamies", period: "15.2.2024 –" }]
  },
  {
    id: "SM015:00/2024",
    title: "Passien voimassaoloajan pidentäminen 10 vuoteen",
    ministry: "Sisäministeriö",
    ministryCode: "SM",
    status: "Käynnissä",
    startDate: "2024-01-15",
    endDate: "2026-06-30",
    description: "Hankkeen tavoitteena on pidentää passien voimassaoloaika 10 vuoteen nykyisestä 5 vuodesta. Hallituksen esitys tutkii voimassaoloaikojen pidentämisen turvallisuusvaikutuksia.",
    phase: "Lainvalmistelu",
    category: "Lainvalmistelu",
    caseNumbers: ["SM015:00/2024"],
    governmentProgramme: "Orpo",
    strategicAreas: ["Hallinnon keventäminen"],
    contacts: [{ name: "Kivinen, Marja", role: "Lainsäädäntöneuvos", period: "15.1.2024 –" }]
  }
];

// Suodatinvalikot
const ministryOptions = [
  { code: "all", name: "Kaikki ministeriöt" },
  { code: "LVM", name: "Liikenne- ja viestintäministeriö" },
  { code: "SM", name: "Sisäministeriö" },
  { code: "STM", name: "Sosiaali- ja terveysministeriö" },
  { code: "VM", name: "Valtiovarainministeriö" },
  { code: "YM", name: "Ympäristöministeriö" },
  { code: "VNK", name: "Valtioneuvoston kanslia" },
  { code: "UM", name: "Ulkoministeriö" },
  { code: "OM", name: "Oikeusministeriö" },
  { code: "OKM", name: "Opetus- ja kulttuuriministeriö" },
  { code: "TEM", name: "Työ- ja elinkeinoministeriö" }
];

const statusOptions = [
  { code: "all", name: "Kaikki vaiheet" },
  { code: "Käynnissä", name: "Käynnissä" },
  { code: "Lausuntokierros", name: "Lausuntokierroksella" },
  { code: "Valmis", name: "Valmis" },
  { code: "Suunnittelu", name: "Suunnittelu" },
  { code: "Selvitystyö", name: "Selvitystyö" }
];

const categoryOptions = [
  { code: "all", name: "Kaikki tyypit" },
  { code: "Lainvalmistelu", name: "Lainvalmistelu" },
  { code: "Selonteot", name: "Selonteot" },
  { code: "Kehittämishankkeet", name: "Kehittämishankkeet" },
  { code: "Työryhmät", name: "Työryhmät" }
];

const ProjectListItem = ({ project, onSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Käynnissä': return 'bg-green-100 text-green-800';
      case 'Lausuntokierros': return 'bg-blue-100 text-blue-800';
      case 'Valmis': return 'bg-gray-100 text-gray-800';
      case 'Suunnittelu': return 'bg-yellow-100 text-yellow-800';
      case 'Selvitystyö': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fi-FI');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(project)}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 hover:text-gray-700 mb-2 leading-tight" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>
              {project.title}
            </h3>
            <div className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
              {project.id}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)} ml-4 flex-shrink-0`}>
            {project.status}
          </span>
        </div>
        
        <div className="text-gray-700 mb-4 leading-relaxed">
          {project.description}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t border-gray-100 pt-4">
          <div className="flex items-center text-gray-600">
            <Building className="w-4 h-4 mr-2" style={{ color: '#002f6c' }} />
            <span className="font-medium">{project.ministry}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" style={{ color: '#002f6c' }} />
            <span>{formatDate(project.startDate)} – {formatDate(project.endDate)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2" style={{ color: '#002f6c' }} />
            <span>{project.contacts?.[0]?.name || 'Ei määritetty'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectDetail = ({ project, onBack }) => {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fi-FI');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Käynnissä': return 'bg-green-100 text-green-800';
      case 'Lausuntokierros': return 'bg-blue-100 text-blue-800';
      case 'Valmis': return 'bg-gray-100 text-gray-800';
      case 'Suunnittelu': return 'bg-yellow-100 text-yellow-800';
      case 'Selvitystyö': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#002f6c', fontFamily: '"Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-white hover:text-gray-300 mb-6 font-medium"
        >
          ← Takaisin hakutuloksiin
        </button>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>
                  {project.title}
                </h1>
                <div className="text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded inline-block">
                  {project.id}
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(project.status)} ml-6`}>
                {project.status}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-4 text-lg" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Perustiedot</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="font-semibold text-gray-700">Asettava taho:</dt>
                    <dd className="text-gray-900">{project.ministry}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-700">Määräaika:</dt>
                    <dd className="text-gray-900">{formatDate(project.startDate)} – {formatDate(project.endDate)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-700">Asettamispäivä:</dt>
                    <dd className="text-gray-900">{formatDate(project.startDate)}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-4 text-lg" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Luokittelu</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="font-semibold text-gray-700">Kategoria:</dt>
                    <dd className="text-gray-900">{project.category}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-700">Vaihe:</dt>
                    <dd className="text-gray-900">{project.phase}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-700">Hallitusohjelma:</dt>
                    <dd className="text-gray-900">{project.governmentProgramme}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-4 text-lg" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Hankkeen kuvaus</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed text-lg">{project.description}</p>
              </div>
            </div>

            {project.strategicAreas && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Strategiset kokonaisuudet</h3>
                <div className="flex flex-wrap gap-3">
                  {project.strategicAreas.map((area, index) => (
                    <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.caseNumbers && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Diaari- ja asiakaskoodi</h3>
                <div className="flex flex-wrap gap-3">
                  {project.caseNumbers.map((number, index) => (
                    <span key={index} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-mono text-sm">
                      {number}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.contacts && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Yhteyshenkilöt</h3>
                <div className="bg-blue-50 rounded-lg p-6">
                  {project.contacts.map((contact, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{contact.name}</div>
                        <div className="text-gray-700">{contact.role}</div>
                        <div className="text-sm text-gray-600 mt-1">{contact.period}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <a 
                href={`https://valtioneuvosto.fi/projects-and-legislation/project?tunnus=${encodeURIComponent(project.id)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
              >
                <ExternalLink className="w-5 h-5" />
                Avaa alkuperäinen hanke valtioneuvosto.fi:ssä
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ValtioneuvostoHaku() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(allProjects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ministry: 'all',
    status: 'all',
    category: 'all'
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setFilteredProjects(allProjects);
      setLoading(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (loading) return;
    
    let results = allProjects;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(project =>
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.id.toLowerCase().includes(term) ||
        project.ministry.toLowerCase().includes(term)
      );
    }

    if (filters.ministry !== 'all') {
      results = results.filter(project => project.ministryCode === filters.ministry);
    }
    if (filters.status !== 'all') {
      results = results.filter(project => project.status === filters.status);
    }
    if (filters.category !== 'all') {
      results = results.filter(project => project.category === filters.category);
    }

    setFilteredProjects(results);
  }, [searchTerm, filters, loading]);

  if (selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#002f6c', fontFamily: '"Noto Sans", sans-serif' }}>
      {/* Main header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>
              Valtioneuvoston hankkeet
            </h1>
            <p className="text-lg text-gray-700 max-w-4xl">
              Selaa valtioneuvoston hankkeita ja löydä tietoa lainvalmisteluista, uudistuksista ja selvityksistä. Rajaa hakua ministeriön tai hankkeen vaiheen mukaan.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Hae hankkeita</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Syötä hakusana..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ministeriö</label>
                  <div className="relative">
                    <select 
                      value={filters.ministry}
                      onChange={(e) => setFilters(prev => ({ ...prev, ministry: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white appearance-none"
                      style={{ paddingRight: '3rem' }}
                    >
                      {ministryOptions.map(option => (
                        <option key={option.code} value={option.code}>{option.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hankkeen vaihe</label>
                  <div className="relative">
                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white appearance-none"
                      style={{ paddingRight: '3rem' }}
                    >
                      {statusOptions.map(option => (
                        <option key={option.code} value={option.code}>{option.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hankkeen tyyppi</label>
                  <div className="relative">
                    <select 
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white appearance-none"
                      style={{ paddingRight: '3rem' }}
                    >
                      {categoryOptions.map(option => (
                        <option key={option.code} value={option.code}>{option.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader className="w-6 h-6 animate-spin" />
              <span className="text-lg">Ladataan hankkeita...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-white">
                <strong>{filteredProjects.length}</strong> hanketta löytyi {allProjects.length}:sta
              </div>
              <div className="text-sm text-gray-300">
                Päivitetty viimeksi: {new Date().toLocaleDateString('fi-FI')}
              </div>
            </div>
            
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Ei hakutuloksia</h3>
                <p className="text-gray-600 text-lg">Kokeile eri hakusanoja tai muuta suodattimia.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    onSelect={setSelectedProject}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <footer className="text-white mt-16" style={{ backgroundColor: '#002f6c' }}>
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Valtioneuvosto</h3>
              <div className="space-y-2 text-sm text-gray-200">
                <p>Valtioneuvoston kanslia</p>
                <p>PL 23, 00023 Valtioneuvosto</p>
                <p>Puh. 0295 16001</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Hankeikkuna</h3>
              <div className="space-y-2 text-sm text-gray-200">
                <p>Tiedot perustuvat Hankeikkuna API:in</p>
                <p>Staattinen demo-versio • {allProjects.length} hanketta</p>
                <p>Päivitetty: {new Date().toLocaleDateString('fi-FI')}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>Linkit</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <a 
                    href="https://valtioneuvosto.fi/hankkeet" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 hover:text-white underline"
                  >
                    Alkuperäinen hankehaku
                  </a>
                </div>
                <div>
                  <a 
                    href="https://api.hankeikkuna.fi" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 hover:text-white underline"
                  >
                    Hankeikkuna API
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-6" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-200">
              <div>© 2025 Valtioneuvoston kanslia</div>
              <div className="mt-2 md:mt-0">
                <span className="mr-4">Saavutettavuus</span>
                <span className="mr-4">Tietosuoja</span>
                <span>Evästeet</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
          
