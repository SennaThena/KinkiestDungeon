alts.DragonLair = {
	name: "DragonLair",
	Title: "DragonLair",
	noWear: false, // Disables doodad wear
	bossroom: false,
	width: 14,
	height: 16,
	nopatrols: false,
	setpieces: {
	},
	data: {
		ElevatorRoom: true,
	},
	genType: "DragonLair",
	skin: "cav",
	musicParams: "cav",
	lightParams: "cav",
	useGenParams: "cav",
	spawns: false,
	chests: false,
	shrines: false,
	persist: true,
	orbs: 0,
	chargers: false,
	notorches: false,
	heart: false,
	specialtiles: false,
	shortcut: false,
	enemies: false,
	nojail: true,
	nokeys: true,
	nostairs: true,
	placeDoors: false,
	notraps: true,
	noClutter: false,
	nobrick: false,
	nolore: true,
	noboring: false,
	noSetpiece: true,
};


let KDDragonList: KDMapEnemyList[] = [
	{
		enemy: "DragonQueenCrystal",
		faction: "DragonQueen",
		minfloor: 7,
		obstacles: {
			ChaoticCrystal: 1.0,
			ChaoticCrystalActive: 0.25,
			SoulCrystal: 0.05,
			SoulCrystalActive: 0.01,
			CuffedGirl: 0.1,
		},
	},
	{
		enemy: "DragonQueenPoison",
		minfloor: 6,
		faction: "DragonQueen",
		obstacles: {
			BarricadeVine: 1.0,
			GiantMushroom: 0.25,
			VinePlant: 0.1,
		},
	},
	{
		enemy: "DragonQueenIce",
		minfloor: 5,
		faction: "DragonQueen",
		obstacles: {
			BarricadeIce: 1.0,
		},
	},
	{
		enemy: "DragonQueenShadow",
		minfloor: 8,
		faction: "DragonQueen",
		obstacles: {
			ShadowHand: 0.1,
			BarricadeShadow: 1.0,
			BarricadeShadowMetal: 0.25,
		},
	},
	{
		enemy: "DragonGirlCrystal",
		maxfloor: 5,
		faction: "DragonQueen",
		obstacles: {
			ChaoticCrystal: 1.0,
			ChaoticCrystalActive: 0.25,
		},
	},
	{
		enemy: "DragonGirlPoison",
		maxfloor: 6,
		faction: "DragonQueen",
		obstacles: {
			BarricadeVine: 0.5,
			GiantMushroom: 0.5,
		},
	},
	{
		enemy: "DragonGirlIce",
		maxfloor: 7,
		faction: "DragonQueen",
		obstacles: {
			BarricadeIce: 0.75,
		},
	},
	{
		enemy: "DragonGirlShadow",
		maxfloor: 8,
		faction: "DragonQueen",
		obstacles: {
			BarricadeShadow: 0.75,
			BarricadeShadowMetal: 0.25,
		},
	},


];


KinkyDungeonCreateMapGenType.DragonLair = (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
	KDMapgenCreateCave(POI, VisitedRooms, width, height, openness, density, hallopenness, data);

};

function KDMapgenCreateCave(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Boilerplate
	VisitedRooms[0].x = Math.floor(width/2);
	VisitedRooms[0].y = Math.floor(height/2);

	let w = KDMapData.GridWidth;
	let h = KDMapData.GridHeight;
	KDMapData.GridWidth = Math.floor(KDMapData.GridWidth*2);
	KDMapData.GridHeight = Math.floor(KDMapData.GridHeight*2);
	KDMapData.Grid = "";

	// Generate the grid
	for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
		for (let X = 0; X < KDMapData.GridWidth; X++)
			KDMapData.Grid = KDMapData.Grid + "1";
		KDMapData.Grid = KDMapData.Grid + '\n';
	}

	// End of boilerplate

	// Generate central cavity

	let dist = 0;
	for (let X = 1; X < KDMapData.GridWidth; X += 1)
		for (let Y = 1; Y < KDMapData.GridWidth; Y += 1) {
			dist = KDistEuclidean(X - KDMapData.GridWidth, Y - KDMapData.GridWidth);
			if (dist < 8 + 0.25 * openness) {
				KinkyDungeonMapSet(X, Y, '0');
			}
		}

	// Generate branching tunnels
	let potEntrances: KDPoint[] = [];
	let paths = 5 + Math.floor(density);
	let pathMaxLength = 100;
	let pathMaxDist = KDMapData.GridWidth/2.5;

	for (let i = 0; i < paths; i++) {
		let already: Record<string, KDPoint> = {};
		let curr = {x: (KDMapData.GridWidth/2), y: (KDMapData.GridHeight/2)};
		let last = curr;
		for (let ii = 0;
			ii < pathMaxLength
			&& curr
			&& KDistEuclidean(curr.x - KDMapData.GridWidth/2,
				curr.y - KDMapData.GridHeight/2) < pathMaxDist;
				ii++) {
					KinkyDungeonMapSet(curr.x, curr.y, '0');
					last = curr;
					already[curr.x + ',' + curr.y] = curr;
					let options = KDNearbyMapTiles(curr.x, curr.y, 1.5).filter((t) => {
						return !already[t.x + ',' + t.y];
					})
					if (options.length > 0) {
						curr = options[Math.floor(KDRandom() * options.length)];
					} else {
						curr = null;
					}
				}
		if (last) {
			potEntrances.push(last);
		}

	}

	// Open up the map a bit

	// nah



	// Create entrances

	for (let i = 0; i < potEntrances.length; i++) {
		if (i == 0) {
			// Main entrance
			KDMapData.StartPosition = {x: potEntrances[i].x, y: potEntrances[i].y};
			KDMapData.EndPosition = KDMapData.StartPosition;
		} else {
			KDMapData.PotentialEntrances.push({
				Excavate: [],
				PlaceScript: "Cave",
				Type: "Cave",
				x: potEntrances[i].x,
				y: potEntrances[i].y,
				priority: 100,
			})
		}
	}

	// End of map gen


	// Boilerplate again

	KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y, 'S');

	KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);

	// end of boilerplate again

}