/*
 *
 * Events usage:
 *
 * Two variables must be defined:
 *  'duration' - The duration in days (minutes) an event runs.
 *  'probability' - The probability an event will start per day.
 *
 * Each event should contain four functions:
 *  prequisites() - Returns true or false depending on whether the prequisites are met.
 *  start() - This function runs when an event is started.
 *  update() - This function runs every time-step.
 *  finish() -This function runs when the event is finished (duration is reached).
 *
 * Each of the above functions has an argument which is an API object with access to the
 * following functions:
 *
 * displayNotification(text) - Displays the provided text in a notification which is
 *                             aligned to the center of the canvas.
 *
 * getResearchPoints() - Returns an array containing the number of research points
 *                       in the format [computationPoints, experimentPoints, theoryPoints].
 *
 * getCharacters() - Returns an object with character information in the format:
 *
 *                  {
 *                    'CharNameA' :
 *                              {
 *                              x: Character tile X position,
 *                              y: Character tile Y position,
 *                              level: Character Level,
 *                              state: Character state,
 *                              multiplier: Character RP multiplier,
 *                              walkspeed: Character walkspeed,
 *                              },
 *				...
 *                  }
 *
 * getDay() - Retuns the total number of days + 1 since the game started.
 *
 * getCurrentTime() - Returns an array with [year, month, day].
 *
 * getMapObjects() - Returns an object with map information in the format:
 *
 *		    {
 *		      'MapObjectNameA' :
 *				    {
 *				    x: Map object tile X position,
 *				    y: Map object tile Y position,
 *				    },
 *				    ...
 *		    }
 *
 * setCharacterProperty(character, property, value, duration) - Assign a property for a given character (some properties need a duration)
 *			The properties which are supported: 'multiplier' (needs a duration), 'state', 'speed' (needs a duration)
 *
 * addEffect(entity, type, duration) - Applies an effect to an entity (map object or character) for some time.
 *				       The supported effects are 'field', 'explosion'. The first argument is the character name or
 *                                     map object name.
 *
 * getGrantValue() - Returns the total value of grants.
 *
 * getPublications() - Returns an object with details regarding publications.
 *
 */

 // Events are loaded using preloadjs.

 // Random events
 loadQueue.loadFile("events/random/performenhance.js");
 loadQueue.loadFile("events/random/expertise.js");
 loadQueue.loadFile("events/random/negation.js");
 loadQueue.loadFile("events/random/visit.js");
 loadQueue.loadFile("events/random/starMediaDocumentary.js");

 // Main events
 loadQueue.loadFile("events/main/welcome.js");
