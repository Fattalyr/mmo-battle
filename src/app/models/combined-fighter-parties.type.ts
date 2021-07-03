import { IBeastCharacter, IMainCharacter, InstanceOf } from './character.type';

export type CombinedFightersParties = [
  fighters: InstanceOf<IMainCharacter | IBeastCharacter>[],
  parties: { playerPartyId: string; cpuPartyId: string },
];