alts.DragonLair = {
	name: "ElevatorRoom",
	Title: "ElevatorRoom",
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
	genType: "ElevatorRoom",
	skin: "bel",
	musicParams: "bel",
	lightParams: "bel",
	useGenParams: "bel",
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
