import { Injectable } from '@angular/core';

import { Actions, createEffect, CreateEffectMetadata, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { map, mergeMap, withLatestFrom } from 'rxjs/operators';

import { MOVE_STATUSES } from '../../constants/move-statuses.enum';
import { findNextFighter } from '../../helpers/find-next-fighter.helper';
import { BattleService } from '../../services/battle.service';
import { reduceSpellExpiration } from '../spells/spells.actions';
import { nextTurn, phaseBeforeMove, phaseMoving, turnChangeNextFighter } from '../turn/turn.actions';
import { selectTurn } from '../turn/turn.selectors';
import { applySpellToCharacter, moveCompleted, moveStarted, updateCharacters } from './fighters.actions';
import { selectCharacters, selectParties } from './fighters.selectors';

@Injectable()
export class FightersEffects {
  public moveStarted$ = this.moveStartedFn$();
  public beforeMove$ = this.beforeMoveFn$();
  public applySpellToCharacter$ = this.applySpellToCharacterFn$();
  public moveCompleted$ = this.moveCompletedFn$();

  constructor(
    private actions$: Actions,
    private store: Store,
    private battleService: BattleService,
  ) {}

  private moveStartedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(moveStarted),
      map(() => phaseBeforeMove()),
    ));
  }

  private beforeMoveFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(phaseBeforeMove),
      map(() => phaseMoving()),
    ));
  }

  private applySpellToCharacterFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(applySpellToCharacter),
      map(action => reduceSpellExpiration({ spellId: action.spell.id })),
    ));
  }

  private moveCompletedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(moveCompleted),
      withLatestFrom(
        this.store.select(selectCharacters),
        this.store.select(selectParties),
        this.store.select(selectTurn),
      ),
      mergeMap(([ action, fighters, parties, turn ]) => {
        const currentFighterId = turn.movingFighter;
        const nextFighter = findNextFighter(fighters, parties);

        if (nextFighter) {
          return [
            updateCharacters({
              changes: [
                { id: currentFighterId, changes: { move: MOVE_STATUSES.MOVED }},
                { id: nextFighter.id, changes: { move: MOVE_STATUSES.MOVING }},
              ],
            }),
            turnChangeNextFighter({ nextFighterId: nextFighter.id, nextPartyId: nextFighter.partyId }),
          ];
        }

        return [
          updateCharacters({
            changes: [
              { id: currentFighterId, changes: { move: MOVE_STATUSES.MOVED }},
            ],
          }),
          nextTurn(),
        ];
      }),
    ));
  }
}
