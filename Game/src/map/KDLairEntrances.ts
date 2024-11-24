"use strict";


interface LairEntrance {
	Type: string,
	x: number,
	y: number,
	Excavate: KDPoint[],
	PlaceScript: string,
}

/** PlaceScripts for lairs that override the entrance placescript */
let KDLairTypePlaceScript: Record<string, (lair: KDLair, data: KDMapDataType, entrance: LairEntrance) => boolean> = {
	DragonLair: (lair, data, entrance) => {
		// For now...
		return KDLairTypePlaceScript["Cave"](lair, data, entrance);
	},
	Cave: (lair, data, entrance) => {
		let point = {x: entrance.x, y: entrance.y};
		if ((KinkyDungeonGroundTiles + "4r").includes(
			KinkyDungeonMapGet(point.x, point.y))
			&& !KinkyDungeonTilesGet(point.x + ',' + point.y)?.Type) {
			KinkyDungeonMapSet(point.x, point.y, 'H');
			let tile = KinkyDungeonTilesGet(point.x + ',' + point.y) || {};
			//tile.SideRoom = sideRoom.name;

			/** EXTREMELY important to add the journeyslot and position!!!! */
			let slot = KDGetWorldMapLocation({x: data.mapX, y: data.mapY});
			if (slot) {
				let jx = slot.jx || 0;
				let jy = slot.jy || slot.y;
				let journeySlot = KDGameData.JourneyMap[jx + ',' + jy];
				if (journeySlot) {
					journeySlot.SideRooms.push(lair.Name);
					if (!journeySlot.HiddenRooms) {
						journeySlot.HiddenRooms = {};
					}
					if (lair.Hidden)
						journeySlot.HiddenRooms[lair.Name] = true;
				}
				tile.ShortcutIndex = data.ShortcutPositions.length;
				data.ShortcutPositions.push(point);
			} else {
				return false;
			}

			tile.MapMod = "None";
			tile.Faction = lair.OwnerFaction;
			tile.EscapeMethod = "None";
			tile.RoomType = lair.Name;
			KinkyDungeonTilesSet(point.x + ',' + point.y, tile);
			KinkyDungeonMapSet(point.x, point.y, 'H');
			KDRemoveAoEEffectTiles(point.x, point.y, ["rubble"], 0.5);

			KinkyDungeonSkinArea({skin: "cry"}, point.x, point.y, 1.5);
			KinkyDungeonSpecialAreas.push({x: point.x, y: point.y, radius: 2});
			return true;
		}
		return false;
	},
}

/** Placescripts for lair entrances */
let KDLairEntrancePlaceScript: Record<string, (lairData: KDLair, data: KDMapDataType, entrance: LairEntrance) => boolean> = {
	Cave: (lair, data, entrance) => {
		// Caves specifically must excavate, then they run specific or Cave LairTypePlaceScript
		// Excavate
		if (entrance.Excavate?.length > 0) {
			for (let tile of entrance.Excavate) {
				// Clear the tiles, but only if they are cracked or ground
				if ((KinkyDungeonGroundTiles + "4").includes(
					KinkyDungeonMapGet(tile.x, tile.y))
					&& !KinkyDungeonTilesGet(tile.x + ',' + tile.y)?.Type) {
					KinkyDungeonMapSet(tile.x, tile.y, 'r');
					KDCreateEffectTile(tile.x, tile.y, {
						name: "RubbleNoMend",
						duration: 9999,
					}, 0);
				}
			}
			KinkyDungeonUpdateLightGrid = true;
			KinkyDungeonGenNavMap();
		}

		// Place script
		return KDLairTypePlaceScript[lair.PlaceScriptOverride || "Cave"](lair, data, entrance);
	},
}

/** Weighting factor for filterscripts */
let KDLairEntranceFilterScript: Record<string, (lair: KDLair, data: KDMapDataType, entrance: LairEntrance) => number> = {

}