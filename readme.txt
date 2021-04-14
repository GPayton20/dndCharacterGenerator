This app is a random character generator for Dungeons & Dragons. Each time the user clicks the "Roll!" button, that app makes some calls to the D&D API, and then several functions are run using that data which result in a new character for the user to play in their game.

There is a fair bit happening with these functions, so here is a quick overview of how the app works.

The app uses an object called "player" which stores any info about the player character that will be needed later. 

The first thing we do is assign random ability scores. Every character in D&D has six ability scores: Strength, Dexterity, Constitution, Intelligence, Wisdom and Charisma. These are assigned at random from a standard array (15, 14, 13, 12, 10, 8). Each ability score has an associated bonus which is displayed just below it on the character sheet (+2, -1, etc.).

Next we make our calls to the API to determine the character's race (human, elf, dwarf, etc.) and class (fighter, wizard, etc.). Because of how the API is structured, we make one call to get a list of options, then we pick one at random and make a second call to retrieve all the data associated with our choice.

From our character's race we get both a list of languages spoken by that race, their movement speed, as well as some bonuses to the ability scores we assigned earlier. Half-orcs receive a boost to their strength, for example. This is why the final scores on the sheet differ slightly from those in the array. The character's name is chosen at random from arrays associated with that race, so that dwarves have dwarven names and elves have elven names.

Most of the data on the character sheet is determined by the character's class. Class determines what saving throws and skills the character is proficient in, and the final bonus is determined by the ability score associated with that skill. For example, the Athletics skill is based on Strength, so if the character's strength bonus is +2, it's Athletics bonus is also +2. However, a barbarian might be proficient in Athletics, so in this case they get to add their Proficiency Bonus (+2) and bring their final bonus up to +4. The skills available to a class and the number of skills they can choose is pulled from the API, and the actual skills chosen are randomized. Proficiencies are coloured red on the final sheet.

Using methods such as these, the user is presented with a fully randomized character sheet they can use in the game. If the user does not like the result, they can "roll again" and receive a new random character.



Some things I would like to add to this app:

- Determine equipment, such as weapons and armour

- Select spells known by characters with access to magic

- Assign random character traits, background info, etc.

- This app assigns stats and skills at random, which can result in some fun but perhaps     less-than-ideal character builds (the player might expect their brute-force fighter to have a high Strength score, for example). I would like to add a feature allowing the user to "optimize" their character if they choose, or to "Embrace the chaos"

- This app builds 1st-level characters, I would like to expand it to build characters of 2nd-level and higher