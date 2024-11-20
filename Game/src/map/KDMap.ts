
function KDGetMapData(coord: WorldCoord): KDMapDataType {
	let slot = KDGetWorldMapLocation({x: coord.mapX, y: coord.mapY});
	if (slot) {
		let data = slot.data[coord.room];
		return data;
	}
	return null;
}
