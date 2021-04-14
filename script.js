// Declare objects and cache selectors
const player = {};
const app ={};

const $characterSheet = $('#characterSheet');
const $abilities = $('#abilities');
const $skillsList = $('#skillsList');
const $basicInfo = $('#basicInfo');
const $saveList = $('#saveList');
const $misc = $('#misc');
const $overlay = $('.overlay');
const $loading = $('.loading');


app.init = function() {
  // Set/Reset players.stats and language/skills arrays
  player.stats = {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0
  };
  player.languages = [];
  player.skillProfs = [];

  // Clear out DOM elements
  $abilities.empty();
  $skillsList.empty();
  $basicInfo.empty();
  $saveList.empty();
  $misc.empty();
  
}


// Helper function to pull a random index from an array
app.randomIndex = array => array[Math.floor(Math.random() * array.length)];

// Helper function to add + sign to positive bonuses in DOM
const addPlus = num => num >= 0 ? `+${num}` : num;



// Assign starting stats at random from standard array
player.setStats = function() {
  let array = [15,14,13,12,10,8]

  for (const prop in player.stats) {
    player.stats[prop] = app.randomIndex(array);
    
    let num = array.indexOf(player.stats[prop]);
    array.splice(num, 1);
  }
}


// Get random race object from D&D API and set it to player object
player.setRace = async function() {
  // get list of races from api
  let response = await fetch('https://www.dnd5eapi.co/api/races/');
  let raceList = await response.json();

  // choose race at random from list
  let chosen = app.randomIndex(raceList.results).index;

  // get selected race object from api and set to player object
  let response2 = await fetch(`https://www.dnd5eapi.co/api/races/${chosen}/`);
  player.raceInfo = await response2.json();
}

// Get random class object from D&D API and set it to player object
player.setClass = async function() {
  // get list of classes from api
  let response = await fetch('https://www.dnd5eapi.co/api/classes/');
  let classList = await response.json();

  // choose class at random from list
  let chosen = app.randomIndex(classList.results).index;

  // get selected class object from api and set to player object
  let response2 = await fetch(`https://www.dnd5eapi.co/api/classes/${chosen}/`);
  player.classInfo = await response2.json();
}


// Get ability bonuses from race object and set to player object
player.getRacialBonuses = function() {
  player.raceInfo.ability_bonuses.forEach( el => {
    let ability = el.ability_score.index;
    let bonus = el.bonus;

    player.stats[ability] = player.stats[ability] + bonus;
  })
}

// Take ability scores and calculate ability bonus, add to player object
player.getAbilityBonus = function() {
  
  const calcBonus = (number) => {
    if (number % 2 !=0) {
      number--;
    }
    let bonus = (number - 10) / 2;
    return bonus;
  }

  const addBonus = (stat, number) => {
    player.stats[stat] = {
      score: number,
      bonus: calcBonus(number)
    }
  }

  for (const prop in player.stats) {
    addBonus(prop, player.stats[prop]);
  }
}


// Skill proficiencies, both type and number, vary based on player class;

player.getSkills = function() {
  let array = player.classInfo.proficiency_choices;
  let profs;
  let skills;
  
  // Search arrays in proficiency_choices object for array containing skill proficiencies
  // Get list of available skills and number of skills assignable to character
  array.forEach(index => {
    if (index.from[0].name.includes('Skill:')) {
      profs = index.choose;
      skills = index.from;
    }
  })

  // Get random skills from array and assign to player object
  while (player.skillProfs.length < profs) {
    let choice = '';
    
    choice = app.randomIndex(skills).name
    formattedChoice = choice.split('Skill: ')[1];

    if (!player.skillProfs.includes(formattedChoice)) {
      player.skillProfs.push(formattedChoice);
    }
  }
}


// Calculate skill check bonuses
player.getSkillBonuses = function() {
  const skillsArray = [
    ['Acrobatics', 'dex'], ['Animal Handling', 'wis'], ['Arcana', 'int'], ['Athletics', 'str'], ['Deception', 'cha'], ['History', 'int'], ['Insight', 'wis'], ['Intimidation', 'cha'], ['Investigation', 'int'], ['Medicine', 'wis'], ['Nature', 'int'], ['Perception', 'wis'], ['Performance', 'cha'], ['Persuasion', 'cha'], ['Religion', 'int'], ['Sleight of Hand', 'dex'], ['Stealth', 'dex'], ['Survival', 'wis']
  ]

  skillsArray.forEach(skill => {
    let name = skill[0];
    // Standard skill bonus is equal to bonus for associated ability score
    let bonus = player.stats[skill[1]].bonus;

    // If character is proficient in skill, add 2 to bonus
    if (player.skillProfs.includes(name)) {
      bonus += 2;

      // Print to DOM, adding 'proficient' class where needed for styling
      $skillsList.append(`
        <li>
          <p class="proficient">${name}</p>
          <p class="proficient">${addPlus(bonus)}</p>
        </li>
      `);
    } else {
      $skillsList.append(`
        <li>
          <p>${name}</p>
          <p>${addPlus(bonus)}</p>
        </li>
      `);
    }
  })
}


// Calculate saving throw bonuses
player.getSavingThrows = function() {
  for (let stat in player.stats) {
    let savingThrow = player.stats[stat].bonus;
    let proficient = false;
    
    // If character is proficient, add 2 to bonus
    player.classInfo.saving_throws.forEach(save => {
      if (stat == save.index) {
        savingThrow += 2;
        proficient = true;
      }
    });
    
    // Print to DOM, adding 'proficient' class as appropriate for styling 
    if (proficient == true) {
      $saveList.append(`
        <li>
          <p class="proficient">${stat}</p>
          <p class="proficient">${addPlus(savingThrow)}</p>
        </li>
      `);
    } else {
      $saveList.append(`
        <li>
          <p>${stat}</p>
          <p>${addPlus(savingThrow)}</p>
        </li>
      `);
    };
  };
}



// Randomize character alignment
player.getAlignment = function() {
  const arr1 = ['Lawful', 'Neutral', 'Chaotic'];
  const arr2 = ['Good', 'Neutral', 'Evil'];
  
  let alignment = `${app.randomIndex(arr1)} / ${app.randomIndex(arr2)}`;

  return alignment;
}
 

// Get languages spoken from api, joined with ',' for styling
player.getLanguages = function() {
  let result = [];

  player.raceInfo.languages.forEach(language => {
    result.push(language.name);
  });
  
  return result.join(', ');
}


// Randomize character name, adding surname or clan name where applicable
player.getName = function() {
  const names = {
    'dwarf': [
      ['Baern', 'Eberk', 'Gardain', 'Morgran', 'Dagnal', 'Falkrunn', 'Ilde', 'Torgga'],
      ['Battlehammer', 'Fireforge', 'Frostbeard', 'Ironfist', 'Loderr', 'Strakeln', 'Torunn', 'Ungart']
    ],
    'elf': [
      ['Aelar', 'Enialis', 'Immeral', 'Varis', 'Antinua', 'Caelynn', 'Lia', 'Valanthe'],
      ['Amakiir', 'Galanodel', 'Holimion', 'Ilphelkiir', 'Liadon', 'Nailo', 'Siannodel', 'Xiloscient']
    ],
    'halfling':[
      ['Ander', 'Corrin', 'Errich', 'Milo', 'Bree', 'Kithri', 'Paela', 'Shaena'],
      ['Brushgather', 'Goodbarrel', 'Greenbottle', 'High-hill', 'Tealeaf', 'Thorngage', 'Tosscobble', 'Underbough']
    ],
    'human': [
      ['Bareris', 'Bran', 'Lian', 'Khemed', 'Arizima', 'Mei', 'Marta', 'Seipora'],
      ['Ankhalab', 'Bersk', 'Chien', 'Dumein', 'Kulenov', 'Marivaldi', 'Shin', 'Murnyethara']
    ],
    'dragonborn': [
      ['Arjhan', 'Donaar', 'Ghesh', 'Rhogar', 'Daar', 'Harann', 'Korinn', 'Raiann'],
      ['Clethinthiallor', 'Delmirev', 'Kerrhylon', 'Myastan', 'Nemmonis', 'Norixius', 'Turnuroth', 'Yarjerit']
    ],
    'gnome': [
      ['Alston', 'Boddynock', 'Glim', 'Warryn', 'Bimpnottin', 'Ella', 'Ellywick', 'Roywyn'],
      ['Beren', 'Doublelock', 'Filchbatter', 'Folkor', 'Nackle', 'Oneshoe', 'Stumbleduck', 'Timbers']
    ],
    'half-elf': [
      ['Ara', 'Aramil', 'Anastrianna', 'Ehput-Ki', 'Melil', 'Naivara', 'Shevarra', 'Tai'],
      ['Amastacia', 'Calabra', 'Moonwhisper', 'Nemetsk', 'Nightbreeze', 'Rein', 'Uuthrakt', 'Wan']
    ],
    'half-orc': [
      ['Dench', 'Feng', 'Holg', 'Keth', 'Krusk', 'Shump', 'Thokk', 'Emen', 'Engog', 'Kansif', 'Ovak', 'Sutha', 'Vola']
    ],
    'tiefling': [
      ['Amnon', 'Ekemon', 'Leucis', 'Mordia', 'Criella', 'Ea', 'Orianna', 'Phaelaia'],
      ['Carrion', 'Despair', 'Glory', 'Ideal', 'Nowhere', 'Poetry', 'Reverence', 'Temerity', 'Torment']
    ]
  }

  const nameOptions = names[player.raceInfo.index];
  const playerName = [];

  nameOptions.forEach(array => {
    playerName.push(app.randomIndex(array));
  });

  return playerName.join(' ');
}



// DOM manipulation functions

app.print = function() {
  app.printAbilities();
  app.printBasic();
  app.printMisc();
  player.getName();
  player.getSkillBonuses();
  player.getSavingThrows();
  app.printWatermark();
}



// Print Ability section to DOM
app.printAbilities = function() {
  for (let prop in player.stats) {
    $abilities.append(`
    
      <div class="box" id="${prop}Box">
        <p class="stat" id="${prop}">${prop}</p>
        <div class="score" id="${prop}Score">${player.stats[prop].score}</div>
        <div class="bonus" id="${prop}Bonus">${addPlus(player.stats[prop].bonus)}</div>
      </div>
    `);
  }
}

// Print Basic Info section to DOM
app.printBasic = function() {
  $basicInfo.append(`
    
    <h2>Character Sheet</h2>

    <p class="name" id="name">Name: ${player.getName()}</p>
    <p class="race" id="race">Race: ${player.raceInfo.name}</p>
    <p class="class" id="class">Class: ${player.classInfo.name} Lv. 1</p>
    <p class="alignment" id="alignment">Alignment: ${player.getAlignment()}</p>
    <p class="languages" id="languages">Languages: ${player.getLanguages()}</p>  
  `);
}

// Print Misc. section to DOM
app.printMisc = function() {
  $misc.append(`
    <div class="box" id="acBox">
      <p class="stat" id="ac">AC</p>
      <div class="score" id="acScore">${player.stats.dex.bonus + 10}</div>
    </div>
    <div class="box" id="hpBox">
      <p class="stat" id="hp">HP</p>
      <div class="score" id="hpScore">${player.classInfo.hit_die + player.stats.con.bonus}</div>
    </div>
    <div class="box" id="profBox">
      <p class="stat" id="prof">Prof.</p>
      <div class="score" id="profScore">+2</div>
    </div>
    <div class="box" id="speedBox">
      <p class="stat" id="speed">Speed</p>
      <div class="score" id="speedScore">${player.raceInfo.speed}</div>
    </div>
    <div class="box" id="initBox">
      <p class="stat" id="init">Initiative</p>
      <div class="score" id="initScore">${addPlus(player.stats.dex.bonus)}</div>
    </div>
    <div class="box" id="hitBox">
      <p class="stat" id="hit">Hit Die</p>
      <div class="score" id="hitScore">d${player.classInfo.hit_die}</div>
    </div>
  `);
}

// Set watermark on character sheet based on class
app.printWatermark = function() {
  $characterSheet.addClass(player.classInfo.index);
}


// Function to run all functions for building random character
app.buildCharacter = async function() {

 await player.setStats();
 await player.setRace();
 await player.setClass();
 await player.getRacialBonuses();
 await player.getAbilityBonus();
 await player.getSkills();

 app.print();
}




// Document ready
$(function() {
  // Add event handlers for Roll buttons
  
  $('.overlay button').on('click', function() {
     app.init();
    
    $overlay.toggleClass('invisible');
    $loading.toggleClass('invisible');
    
    app.buildCharacter();
    
    setTimeout(function() {
      $loading.toggleClass('invisible');
    }, 1800);
  });

  $('.rollAgain button').on('click', function() {
    $characterSheet.removeClass(player.classInfo.index)
  
    app.init();
    
    $loading.toggleClass('invisible');
    
    app.buildCharacter();
    
    setTimeout(function() {
      $loading.toggleClass('invisible');
    }, 1800);
  })
});






