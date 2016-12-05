// We use the preloadjs to load images (only charaacters here at the moment)

var loadQueue = new createjs.LoadQueue(false);

loadQueue.loadManifest([{id: 'male-body', src: 'assets/character/body-male.png'},
			{id: 'male-hair-messy', src: 'assets/character/male-hair-messy.png'},
			{id: 'male-hair-messy2', src: 'assets/character/male-hair-messy2.png'},
			{id: 'male-hair-round', src: 'assets/character/male-hair-round.png'},
			{id: 'male-top-black-tshirt', src: 'assets/character/male-top-black-tshirt.png'},
			{id: 'male-top-white-tshirt', src: 'assets/character/male-top-white-tshirt.png'},
			{id: 'male-top-green-tshirt', src: 'assets/character/male-top-green-tshirt.png'},
			{id: 'male-bottom-red-shorts', src: 'assets/character/male-bottom-red-shorts.png'},
			{id: 'male-bottom-blue-shorts', src: 'assets/character/male-bottom-blue-shorts.png'}]);
