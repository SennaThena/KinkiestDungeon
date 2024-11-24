"use strict";

interface KDLair {
	Name: string,
	RoomType: string,
	OwnerNPC?: number,
	OwnerFaction?: string,
	/** Required entrance type */
	Entrance?: string,
	/** Optional override type */
	PlaceScriptOverride?: string,
	Hidden?: boolean,
}
let KDPersonalAlt: {[_ : string]: KDLair} = {};



function KDGenerateLairNameFromEnemy(RoomType: string, enemy: entity): string {
	return TextGet("KDPersonalizedRoom")
	//RMNME of CHTRNME the ENMYNME
		.replace("RMNME", TextGet("KDSideRoom_" + RoomType))
		.replace("CHTRNME", KDGetPersistentNPC(enemy.id)?.Name)
		.replace("ENMYNME", TextGet("Name" + enemy.Enemy.name));
}



function KDGetLairs(slot: KDWorldSlot, id?: number): [string, string][] {
	if (id) {
		return slot?.lairs ? Object.entries(slot.lairs).filter((lair) => {
			return lair[0].startsWith(id + "_");
		}) : [];
	}
	return slot?.lairs ? Object.entries(slot.lairs) : [];
}
function KDGetOutposts(slot: KDWorldSlot, faction?: number): [string, string][] {
	if (faction) {
		return slot?.outposts ? Object.entries(slot.outposts).filter((outpost) => {
			return outpost[0].startsWith(faction + "_");
		}) : [];
	}
	return slot?.outposts ? Object.entries(slot.outposts) : [];
}

function KDAddLair(slot: KDWorldSlot, room: string, alt: string, id: number, hidden: boolean, entrance: string): boolean {
	let lairid = id + "_" + alt + `,${slot.x},${slot.y}`;
	if (!slot.lairs) {
		slot.lairs = {};
	}
	if (!slot.lairs[lairid]) {
		slot.lairs[lairid] = room;
		KDPersonalAlt[lairid] = {
			Name: room,
			RoomType: alt,
			OwnerNPC: id,
			Entrance: entrance,
			Hidden: hidden,
		};

		if (slot.data[room]) {
			// We have to retroactively place the lair
			if (!slot.data[room].LairsToPlace) {
				slot.data[room].LairsToPlace = [];
			}
			slot.data[room].LairsToPlace.push(lairid);
		}
	}
	return false;
}

function KDAddOutpost(slot: KDWorldSlot, room: string, alt: string, faction: string, hidden: boolean, entrance: string): boolean {
	let outpostid = faction + "_" + alt + `,${slot.x},${slot.y}`;
	let jx = slot.jx || 0;
	let jy = slot.jy || slot.y;
	let journeySlot = KDGameData.JourneyMap[jx + ',' + jy];
	if (!slot.outposts) {
		slot.outposts = {};
	}
	if (!slot.outposts[outpostid]) {
		slot.outposts[outpostid] = room;
		KDPersonalAlt[outpostid] = {
			Name: outpostid,
			RoomType: alt,
			OwnerFaction: faction,
			Entrance: entrance,
		};
		if (journeySlot) {
			journeySlot.SideRooms.push(outpostid);
			if (!journeySlot.HiddenRooms) {
				journeySlot.HiddenRooms = {};
			}
			if (hidden)
				journeySlot.HiddenRooms[outpostid] = true;
		}
		if (slot.data[room]) {
			// We have to retroactively place the lair
			if (!slot.data[room].LairsToPlace) {
				slot.data[room].LairsToPlace = [];
			}
			slot.data[room].LairsToPlace.push(outpostid);
			if (slot.data[room] == KDMapData) {
				// Build the lair instantly
				KDBuildLairs();
			}
			return true;
		}
	}
	return false;
}

/** Builds lairs for currently loaded map data */
function KDBuildLairs() {
	let data = KDMapData;

	/** Setup */
	let lairsToPlace = data.LairsToPlace || [];
	let lairsNotPlaced: string[] = [];
	let lairsPlaced: string[] = [];

	/** Iterate */
	for (let lairName of lairsToPlace) {
		let lair = KDPersonalAlt[lairName];
		if (!lair) {
			lairsNotPlaced.push(lairName);
			continue;
		}
		let entrance = KDFindEntrance(lair, data);
		if (entrance) {
			if (KDPlaceLairEntrance(lair, data, entrance)) {
				lairsPlaced.push(lairName);
				data.UsedEntrances[lairName] = entrance;
				let ind = data.PotentialEntrances.findIndex((ent) => {
					return ent.x == entrance.x && ent.y == entrance.y;
				});
				if (ind >= 0)
					data.PotentialEntrances.splice(ind, 1);
			} else {
				lairsNotPlaced.push(lairName);
			}
		} else {
			lairsNotPlaced.push(lairName);
		}
	}

	/** Finalize */
	if (lairsNotPlaced.length == 0) {
		data.LairsToPlace = undefined;
	} else {
		data.LairsToPlace = lairsNotPlaced;
	}
}

/** Filters and gets an entrance for the lair based on global lair data and map type */
function KDFindEntrance(lair: KDLair, data: KDMapDataType): LairEntrance {
	let highestEntrances: LairEntrance[] = [];
	let min = -1000000;
	let highestEntranceLevel = min;
	let potentialEntrances = (data.PotentialEntrances || []).filter((entrance) => {
		return lair.Entrance == entrance.Type;
	});
	for (let entrance of potentialEntrances) {
		let value = !KDLairEntranceFilterScript[lair.Entrance] ? min
			: KDLairEntranceFilterScript[lair.Entrance](lair, data, entrance);
		if (value > highestEntranceLevel) {
			highestEntranceLevel = value;
			highestEntrances = [];
		}
		if (value >= highestEntranceLevel) {
			highestEntrances.push(entrance);
		}
	}
	if (highestEntrances.length > 0) {
		return highestEntrances[Math.floor(KDRandom() * highestEntrances.length)];
	}
	return null;
}

/** Runs the associated place script for the lair based on global lair data */
function KDPlaceLairEntrance(lair: KDLair, data: KDMapDataType, entrance: LairEntrance): boolean {
	if (KDLairEntrancePlaceScript[entrance.PlaceScript]) {
		return KDLairEntrancePlaceScript[entrance.PlaceScript](lair, data, entrance);
	}
	return false;
}