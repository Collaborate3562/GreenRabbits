import { writable } from 'svelte/store';

export const characters = writable([]);
export const missionSlots = writable([]);
export const missions = writable([]);
export const materialBalances = writable([]);
export const selectedCharacter = writable([]);
export const selectedMissionSlot = writable([]);
export const selectedMission = writable([]);
export const orbs = writable([]);
export const orbSelected = writable([]);
export const allChars = writable([]);
export const missionsActivated = writable(false);
export const loading = writable(true);
export const config = writable({});
export const inStats = writable(false);
