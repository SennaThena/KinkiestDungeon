let KDCreationScripts: Record<string, (entity: entity, coord: WorldCoord) => boolean> = {
	DragonLair: (entity, coord) => {


		let slot = KDGetWorldMapLocation(KDCoordToPoint(entity.homeCoord || coord));
		let res = KDCreateDragonLair(entity, "DragonLair", slot);

		if (res) {
			entity.homeCoord = {
				mapX: (entity.homeCoord || coord).mapX,
				mapY: (entity.homeCoord || coord).mapY,
				room: res,
			};
		}
		return !!res;
	}
}