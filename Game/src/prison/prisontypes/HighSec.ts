KDPrisonTypes.HighSec = {
	name: "HighSec",
	default_state: "Jail",
	starting_state: "Intro",
	update: (delta) => {
		if (KDGameData.PrisonerState != 'parole') {
			KinkyDungeonSetFlag("noPlay", 12);
		}

		let mainFaction = KDGetMainFaction();

		// Assign guards to deal with idle dolls
		let idleGuard: entity[] = [];
		for (let en of KDMapData.Entities) {
			if ((en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner) && !KDEnemyHasFlag(en, "conveyed_rec")) {
				// Is a prisoner, dont do anything (for now)
			} else if (en.faction == (mainFaction || "Enemy")
				&& en.Enemy?.tags.jailer
				&& en != KinkyDungeonJailGuard()
				&& en != KinkyDungeonLeashingEnemy()
				&& (en.idle || KDEnemyHasFlag(en, "idleg"))
				&& !en.goToDespawn) {
				idleGuard.push(en);
				KinkyDungeonSetEnemyFlag(en, "idleg", 2);
			}
		}

		// If there are any guards still idle we move them to exit to despawn
		let idleGuards: entity[] = [];
		let guardCount = 0;
		for (let en of KDMapData.Entities) {
			if (en.faction == (mainFaction || "Enemy")
				&& !en.goToDespawn
				&& !(en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner) ) {
				if (en != KinkyDungeonJailGuard() && en != KinkyDungeonLeashingEnemy() && (en.idle && !KDEnemyHasFlag(en, "idlegselect")))
					idleGuards.push(en);
				if (en.Enemy.tags.jailer) guardCount += 1;
			}
		}
		if (guardCount > 8) {
			let max = guardCount * 0.33;
			let despawning = 0;
			for (let en of idleGuards) {
				if ((!en.homeCoord) || !KDCompareLocation(en.homeCoord, KDGetCurrentLocation())) {
					despawning += 1;
					KinkyDungeonSetEnemyFlag(en, "despawn", 300);
					KinkyDungeonSetEnemyFlag(en, "wander", 300);
					en.gx = KDMapData.EndPosition.x;
					en.gy = KDMapData.EndPosition.y;
					en.goToDespawn = true;
					if (despawning > max) break;
				}
			}
		} else if (!KinkyDungeonFlags.get("guardspawn")) {
			// TODO replace with map flags
			// spawn a new one
			KinkyDungeonSetFlag("guardspawn", 20);


			if (KDMapData.Labels && KDMapData.Labels.Deploy?.length > 0) {
				let l = KDMapData.Labels.Deploy[Math.floor(KDRandom() * KDMapData.Labels.Deploy.length)];

				let Enemy = KDGetJailEnemy();

				if (Enemy && !KinkyDungeonEnemyAt(KDMapData.EndPosition.x, KDMapData.EndPosition.y)) {
					let en = DialogueCreateEnemy(KDMapData.EndPosition.x, KDMapData.EndPosition.y, Enemy.name);
					//KDProcessCustomPatron(Enemy, en, 0.5, false);
					en.AI = "looseguard";
					en.faction = mainFaction || "Enemy";
					en.keys = true;
					en.gxx = l.x;
					en.gyy = l.y;
					en.gx = l.x;
					en.gy = l.y;
					KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
					//KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
				}
			}
		}
	},
	states: {
		Intro: {name: "Intro",
			init: (params) => {
				let mainFaction = KDGetMainFaction();
				if (KDGameData.PrisonerState == "parole" && KDGetEffSecurityLevel() >= 0)
					KDGameData.PrisonerState = "jail";
				if (KDMapData.Labels && KDMapData.Labels.Deploy) {
					for (let l of KDMapData.Labels.Deploy) {

						let Enemy = KDGetJailEnemy();

						if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
							let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
							//KDProcessCustomPatron(Enemy, en, 0.5, false);
							en.AI = "looseguard";
							en.faction = mainFaction || "Enemy";
							en.keys = true;
							KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
							//KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
						}

					}
				}
				if (KDMapData.Labels && KDMapData.Labels.Patrol) {
					for (let l of KDMapData.Labels.Patrol) {

						let Enemy = KDGetJailEnemy();

						if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
							let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
							//KDProcessCustomPatron(Enemy, en, 0.1, false);
							en.AI = "hunt";
							en.faction = mainFaction || "Enemy";
							en.keys = true;
							KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
							//KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
						}

					}
				}
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KDPrisonCommonGuard(player);
				return "Jail";
			},
		},
		Jail: {name: "Jail",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KDPrisonCommonGuard(player);




				let lostTrack = KDLostJailTrackCell(player);
				if (lostTrack == "Unaware") {
					return KDSetPrisonState(player, "Jail");
				}


				KinkyDungeonHandleJailSpawns(delta, true);



				if (KDPrisonTick(player)) {

					return "Cell";
				}
				return "Jail";
			},
			updateStack: (delta) => {
				KinkyDungeonSetFlag("noPlay", 10);

			},
		},


		Cell: {name: "Cell",
			init: (params) => {
				return "";
			},
			update: (delta) => {
				let player = KinkyDungeonPlayerEntity;
				KDPrisonCommonGuard(player);


				if (KDPrisonIsInFurniture(player)) {
					// Stay in the current state, but increment the Cell timer, return to jail state if too much
					KinkyDungeonFlags.set("PrisonCellTimer", (KinkyDungeonFlags.get("PrisonCellTimer") || 0) + delta * 2);
					if (KinkyDungeonFlags.get("PrisonCellTimer") > 300) {
						// Go to jail state for training
						KinkyDungeonSetFlag("PrisonCyberTrainingFlag", 10);
						return KDSetPrisonState(player, "Jail");
					}
					return KDCurrentPrisonState(player);
				}
				// Go to jail state for further processing
				return KDSetPrisonState(player, "Jail");
			},
		},
	},
};