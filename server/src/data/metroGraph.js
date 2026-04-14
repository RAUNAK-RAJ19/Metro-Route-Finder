const lineColors = {
  Red: '#d34242',
  Yellow: '#f2c200',
  Blue: '#1f64d6',
  Green: '#19a15f',
  Violet: '#7a4fd9',
  Airport: '#f28a2b',
  Pink: '#e35ba6',
  Magenta: '#d9538f',
  Grey: '#7a7f89'
};

const lineDefinitions = [
  {
    line: 'Red',
    timePerHop: 3,
    stations: [
      'Shaheed Sthal (New Bus Adda)',
      'Hindon River',
      'Arthala',
      'Mohan Nagar',
      'Shyam Park',
      'Major Mohit Sharma Rajendra Nagar',
      'Raj Bagh',
      'Shaheed Nagar',
      'Dilshad Garden',
      'Jhilmil',
      'Mansarovar Park',
      'Shahdara',
      'Welcome',
      'Seelampur',
      'Shastri Park',
      'Kashmere Gate',
      'Tis Hazari',
      'Pulbangash',
      'Pratap Nagar',
      'Shastri Nagar',
      'Inderlok',
      'Kanhaiya Nagar',
      'Keshav Puram',
      'Netaji Subhash Place',
      'Kohat Enclave',
      'Pitampura',
      'Rohini East',
      'Rohini West',
      'Rithala'
    ]
  },
  {
    line: 'Yellow',
    timePerHop: 3,
    stations: [
      'Samaypur Badli',
      'Rohini Sector 18, 19',
      'Haiderpur Badli Mor',
      'Jahangirpuri',
      'Adarsh Nagar',
      'Azadpur',
      'Model Town',
      'Guru Tegh Bahadur Nagar',
      'Vishwavidyalaya',
      'Vidhan Sabha',
      'Civil Lines',
      'Kashmere Gate',
      'Chandni Chowk',
      'Chawri Bazar',
      'New Delhi',
      'Rajiv Chowk',
      'Patel Chowk',
      'Central Secretariat',
      'Seva Teerth',
      'Lok Kalyan Marg',
      'Jor Bagh',
      'INA',
      'AIIMS',
      'Green Park',
      'Hauz Khas',
      'Malviya Nagar',
      'Saket',
      'Qutab Minar',
      'Chhatarpur',
      'Sultanpur',
      'Ghitorni',
      'Arjan Garh',
      'Guru Dronacharya',
      'Sikanderpur',
      'MG Road',
      'IFFCO Chowk',
      'Millennium City Centre Gurugram'
    ]
  },
  {
    line: 'Blue',
    timePerHop: 3,
    stations: [
      'Dwarka Sector 21',
      'Dwarka Sector 8',
      'Dwarka Sector 9',
      'Dwarka Sector 10',
      'Dwarka Sector 11',
      'Dwarka Sector 12',
      'Dwarka Sector 13',
      'Dwarka Sector 14',
      'Dwarka',
      'Dwarka Mor',
      'Nawada',
      'Uttam Nagar West',
      'Uttam Nagar East',
      'Janakpuri West',
      'Janakpuri East',
      'Tilak Nagar',
      'Subhash Nagar',
      'Tagore Garden',
      'Rajouri Garden',
      'Ramesh Nagar',
      'Moti Nagar',
      'Kirti Nagar',
      'Shadipur',
      'Patel Nagar',
      'Rajendra Place',
      'Karol Bagh',
      'Jhandewalan',
      'Ramakrishna Ashram Marg',
      'Rajiv Chowk',
      'Barakhamba Road',
      'Mandi House',
      'Supreme Court',
      'Indraprastha',
      'Yamuna Bank',
      'Akshardham',
      'Mayur Vihar-I',
      'Mayur Vihar Extension',
      'New Ashok Nagar',
      'Noida Sector 15',
      'Noida Sector 16',
      'Noida Sector 18',
      'Botanical Garden',
      'Noida Sector 34',
      'Noida Sector 52',
      'Noida Sector 61',
      'Noida Sector 59',
      'Noida Sector 62',
      'Noida Electronic City'
    ]
  },
  {
    line: 'Blue',
    timePerHop: 3,
    stations: [
      'Yamuna Bank',
      'Laxmi Nagar',
      'Nirman Vihar',
      'Preet Vihar',
      'Karkarduma',
      'Anand Vihar',
      'Kaushambi',
      'Vaishali'
    ]
  },
  {
    line: 'Green',
    timePerHop: 3,
    stations: [
      'Kirti Nagar',
      'Satguru Ram Singh Marg',
      'Shivaji Park',
      'Punjabi Bagh West',
      'Madipur',
      'Paschim Vihar East',
      'Paschim Vihar West',
      'Peeragarhi',
      'Udyog Nagar',
      'Maharaja Surajmal Stadium',
      'Nangloi',
      'Nangloi Railway Station',
      'Rajdhani Park',
      'Mundka',
      'Mundka Industrial Area',
      'Ghevra',
      'Tikri Kalan',
      'Tikri Border',
      'Pandit Shree Ram Sharma',
      'Bahadurgarh City',
      'Brigadier Hoshiyar Singh'
    ]
  },
  {
    line: 'Green',
    timePerHop: 3,
    stations: [
      'Inderlok',
      'Ashok Park Main',
      'Punjabi Bagh West',
      'Madipur',
      'Paschim Vihar East',
      'Paschim Vihar West',
      'Peeragarhi',
      'Udyog Nagar',
      'Maharaja Surajmal Stadium',
      'Nangloi',
      'Nangloi Railway Station',
      'Rajdhani Park',
      'Mundka',
      'Mundka Industrial Area',
      'Ghevra',
      'Tikri Kalan',
      'Tikri Border',
      'Pandit Shree Ram Sharma',
      'Bahadurgarh City',
      'Brigadier Hoshiyar Singh'
    ]
  },
  {
    line: 'Violet',
    timePerHop: 3,
    stations: [
      'Kashmere Gate',
      'Lal Qila',
      'Jama Masjid',
      'Delhi Gate',
      'ITO',
      'Mandi House',
      'Janpath',
      'Central Secretariat',
      'Khan Market',
      'Jawaharlal Nehru Stadium',
      'Jangpura',
      'Lajpat Nagar',
      'Moolchand',
      'Kailash Colony',
      'Nehru Place',
      'Kalkaji Mandir',
      'Govindpuri',
      'Harkesh Nagar Okhla',
      'Jasola Apollo',
      'Sarita Vihar',
      'Mohan Estate',
      'Tughlakabad Station',
      'Badarpur Border',
      'Sarai',
      'NHPC Chowk',
      'Mewla Maharajpur',
      'Sector 28',
      'Badkhal Mor',
      'Escorts Mujesar',
      'Sant Surdas (Sihi)',
      'Raja Nahar Singh (Ballabhgarh)'
    ]
  },
  {
    line: 'Airport',
    timePerHop: 4,
    stations: [
      'Dwarka Sector 21',
      'Yashobhoomi Dwarka Sector - 25',
      'Delhi Aerocity',
      'Dhaula Kuan',
      'Shivaji Stadium',
      'New Delhi'
    ]
  },
  {
    line: 'Pink',
    timePerHop: 4,
    stations: [
      'Majlis Park',
      'Azadpur',
      'Shalimar Bagh',
      'Netaji Subhash Place',
      'Punjabi Bagh West',
      'ESI - Basaidarapur',
      'Rajouri Garden',
      'Mayapuri',
      'Naraina Vihar',
      'Delhi Cantt',
      'Durgabai Deshmukh South Campus',
      'Sir M. Vishweshwaraiah Moti Bagh',
      'Bhikaji Cama Place',
      'Dilli Haat - INA',
      'South Extension',
      'Lajpat Nagar',
      'Vinobapuri',
      'Ashram',
      'Sarai Kale Khan - Nizamuddin',
      'Mayur Vihar-I',
      'Mayur Vihar Pocket 1',
      'Trilokpuri Sanjay Lake',
      'East Vinod Nagar - Mayur Vihar-II',
      'Mandawali - West Vinod Nagar',
      'Karkarduma',
      'Anand Vihar',
      'Karkarduma Court',
      'Krishna Nagar',
      'East Azad Nagar',
      'Welcome',
      'Jaffrabad',
      'Maujpur - Babarpur'
    ]
  },
  {
    line: 'Pink',
    timePerHop: 4,
    stations: [
      'Maujpur - Babarpur',
      'Gokulpuri',
      'Johri Enclave',
      'Shiv Vihar'
    ]
  },
  {
    line: 'Magenta',
    timePerHop: 3,
    stations: [
      'Janakpuri West',
      'Dabri Mor - Janakpuri South',
      'Dashrathpuri',
      'Palam',
      'Sadar Bazar Cantonment',
      'Terminal 1-IGI Airport',
      'Shankar Vihar',
      'Vasant Vihar',
      'Munirka',
      'R. K. Puram',
      'IIT',
      'Hauz Khas',
      'Panchsheel Park',
      'Chirag Delhi',
      'Greater Kailash',
      'Nehru Enclave',
      'Kalkaji Mandir',
      'Okhla NSIC',
      'Sukhdev Vihar',
      'Jamia Millia Islamia',
      'Okhla Vihar',
      'Jasola Vihar Shaheen Bagh',
      'Kalindi Kunj',
      'Okhla Bird Sanctuary',
      'Botanical Garden'
    ]
  },
  {
    line: 'Magenta',
    timePerHop: 3,
    stations: [
      'Janakpuri West',
      'Krishna Park Extension'
    ]
  },
  {
    line: 'Grey',
    timePerHop: 3,
    stations: [
      'Dwarka',
      'Nangli',
      'Najafgarh',
      'Dhansa Bus Stand'
    ]
  }
];

const aliasToCanonical = {
  'HUDA City Centre': 'Millennium City Centre Gurugram',
  'Udyog Bhawan': 'Seva Teerth',
  'INA': 'Dilli Haat - INA',
  'Metro Museum': 'Supreme Court',
  'New Bus Adda': 'Shaheed Sthal (New Bus Adda)',
  'IICC - Dwarka Sector -25': 'Yashobhoomi Dwarka Sector - 25',
  'Terminal 1 IGI Airport': 'Terminal 1-IGI Airport',
  'R K Puram': 'R. K. Puram',
  'Moti Bagh': 'Sir M. Vishweshwaraiah Moti Bagh',
  'Ballabhgarh': 'Raja Nahar Singh (Ballabhgarh)',
  'Badarpur': 'Badarpur Border',
  'Maujpur': 'Maujpur - Babarpur',
  'Kashmiri Gate': 'Kashmere Gate',
  'Vishwa Vidyalaya': 'Vishwavidyalaya',
  'Jawaharlal Nehru Stadium': 'Jawaharlal Nehru Stadium'
};

function normalizeStationName(name) {
  if (!name) {
    return '';
  }

  const trimmed = String(name).trim();
  return aliasToCanonical[trimmed] || trimmed;
}

function addBidirectionalEdge(graph, from, to, line, time) {
  graph[from].push({ station: to, time, line });
  graph[to].push({ station: from, time, line });
}

const graph = {};
const uniqueStations = new Set();

for (const definition of lineDefinitions) {
  for (const station of definition.stations) {
    uniqueStations.add(station);
  }
}

for (const station of uniqueStations) {
  graph[station] = [];
}

for (const definition of lineDefinitions) {
  for (let index = 0; index < definition.stations.length - 1; index += 1) {
    const from = definition.stations[index];
    const to = definition.stations[index + 1];
    addBidirectionalEdge(graph, from, to, definition.line, definition.timePerHop);
  }
}

const stationNames = [...uniqueStations].sort((a, b) => a.localeCompare(b));

module.exports = {
  lineColors,
  lineDefinitions,
  aliasToCanonical,
  normalizeStationName,
  stationNames,
  graph
};
