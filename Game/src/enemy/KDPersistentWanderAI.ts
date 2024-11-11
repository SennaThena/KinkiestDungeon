interface PersistentWanderAI {
	/** Number of turns between wanders */
	cooldown: number,
	/** Whether or not NPC is willing to wander */
	filter: (id: number, mapData: KDMapDataType) => boolean,
	/** Chance of wandering this CD cycle */
	chance: (id: number, mapData: KDMapDataType) => number,
	/** Actually perform the wander activity */
	doWander: (id: number, mapData: KDMapDataType, entity: entity) => boolean,
}


let KDPersistentWanderAIList: Record<string, PersistentWanderAI> = {
	/** Default wander AI: choose to visit one of the journey slots on a tile, or move. */
	GoToMain: {
		cooldown: 400,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextWanderTick || 0) && !npc.captured && KDNPCCanWander(npc.id)
				&& KDEnemyCanDespawn(id, mapData);
		},
		chance: (id, mapData) => {
			return mapData == KDMapData ? 0.33 : 0.8;
		},
		doWander: (id, mapData, entity) => {
			let currentWorldPosition = KDGetNPCLocation(id);
			let targetPosition = KDGetNPCLocation(id);
			let worldSlot = KDGetWorldMapLocation({x: currentWorldPosition.mapX, y: currentWorldPosition.mapY});
			let journeySlot = KDGameData.JourneyMap[
				(worldSlot.jx != undefined ? worldSlot.jx : currentWorldPosition.mapX) + ','
				+ (worldSlot.jy != undefined ? worldSlot.jy : currentWorldPosition.mapY)];

			let fromType = 0;
			let fromIndex = 0;

			if (currentWorldPosition.mapY < KDGameData.HighestLevelCurrent
				&& journeySlot?.SideRooms.length > 0 && worldSlot?.data && KDRandom() < 0.5) {
				// 50% chance to go to a side room or go to normal
				if (currentWorldPosition.room != worldSlot.main) {
					targetPosition.room = worldSlot.main || "";

					fromType = 2;
					fromIndex = journeySlot?.SideRooms.findIndex((sr) => {
						return KDSideRooms[sr]?.altRoom == currentWorldPosition.room;
					}) || 0;

					if (fromIndex == -1) fromType = 0;
				}
			}

			if (!KDCompareLocation(currentWorldPosition, targetPosition)) {
				if (!entity) {
					entity = mapData?.Entities.find((ent) => {
						return ent.id == id;
					});

				}
				// Despawn first
				if (entity) {
					KDRemoveEntity(entity, false, false, true, undefined, mapData);
				}

				// Move the entity
				if (KDMovePersistentNPC(id, targetPosition)) {
					let npc = KDGetPersistentNPC(id);
					npc.fromType = fromType;
					npc.fromIndex = fromIndex;
				}
				return true;
			} else {
				let npc = KDGetPersistentNPC(id);
				npc.fromType = -1;
				delete npc.fromIndex;
			}

			return false;
		},
	},
	/** normal wander AI: choose to visit one of the journey slots on a tile, or move. */
	Default: {
		cooldown: 400,
		filter: (id, mapData) => {
			let npc = KDGetPersistentNPC(id);
			return KinkyDungeonCurrentTick > (npc.nextWanderTick || 0) && !npc.captured && KDNPCCanWander(npc.id);
		},
		chance: (id, mapData) => {
			return mapData == KDMapData ? 0.33 : 0.8;
		},
		doWander: (id, mapData, entity) => {
			let currentWorldPosition = KDGetNPCLocation(id);
			let targetPosition = KDGetNPCLocation(id);
			let worldSlot = KDGetWorldMapLocation({x: currentWorldPosition.mapX, y: currentWorldPosition.mapY});
			let journeySlot = KDGameData.JourneyMap[
				(worldSlot.jx != undefined ? worldSlot.jx : currentWorldPosition.mapX) + ','
				+ (worldSlot.jy != undefined ? worldSlot.jy : currentWorldPosition.mapY)];

			let fromType = 0;
			let fromIndex = 0;

			if (currentWorldPosition.mapY <= KDGameData.HighestLevelCurrent
				&& journeySlot?.SideRooms.length > 0 && worldSlot?.data && KDRandom() < 0.5) {
				// 50% chance to go to a side room or go to normal
				if (currentWorldPosition.room == (worldSlot.main || "")) {
					let selectedRoom = journeySlot?.SideRooms[Math.floor(KDRandom()*journeySlot?.SideRooms.length)];
					if (KDSideRooms[selectedRoom]) {
						targetPosition.room = KDSideRooms[selectedRoom].altRoom;
						fromType = 0;
					}
				} else {
					targetPosition.room = worldSlot.main || "";
					fromType = 2;
					fromIndex = journeySlot?.SideRooms.findIndex((sr) => {
						return KDSideRooms[sr]?.altRoom == currentWorldPosition.room;
					}) || 0;

					if (fromIndex == -1) fromType = 0;
				}
			} else if (currentWorldPosition.room == (worldSlot.main || "")) {
				// Go up or down
				// We dont go beyond current max level
				let dy = KDRandom() < 0.5 ? -1 : 1;
				// Wont go up if its a boss level
				if (currentWorldPosition.mapY + dy == KDGameData.HighestLevelCurrent
					&& KinkyDungeonBossFloor(currentWorldPosition.mapY + dy)
				) {
					// Dont move
					dy = 0;
				}

				if (dy < 0) {
					fromType = 1;
				}

				if (dy && currentWorldPosition.mapY + dy > 0 && currentWorldPosition.mapY + dy <= KDGameData.HighestLevelCurrent) {
					targetPosition.mapY = currentWorldPosition.mapY + dy;
				}
			}

			if (!KDCompareLocation(currentWorldPosition, targetPosition)) {
				if (!entity) {
					entity = mapData?.Entities.find((ent) => {
						return ent.id == id;
					});

				}
				// Despawn first
				if (entity) {
					KDRemoveEntity(entity, false, false, true, undefined, mapData);
				}

				// Move the entity
				if (KDMovePersistentNPC(id, targetPosition)) {
					let npc = KDGetPersistentNPC(id);
					npc.fromType = fromType;
					npc.fromIndex = fromIndex;
				}
				return true;
			}

			return false;
		},
	},
};