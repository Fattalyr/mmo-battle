import { Injectable } from '@angular/core';

import { Actions, createEffect, CreateEffectMetadata, ofType } from '@ngrx/effects';

import { map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { DEFAULT_TURN } from '../../constants/default-turn.constant';
import { PHASE } from '../../constants/phase.constant';
import { BattleService } from '../../services/battle.service';
import { moveStarted } from '../fighters/fighters.actions';
import {
  cpuBeastsMoveCompleted,
  cpuBeastsMoveStarted,
  cpuMoveCompleted,
  cpuMoveStarted,
  gameEnded,
  gameStarted,
  playerBeastsMoveCompleted,
  playerBeastsMoveStarted,
  turnCompleted,
  turnStarted,
} from './turn.actions';


@Injectable()
export class TurnEffects {
  public gameStarted$ = this.gameStartedFn$();
  public turnStarted$ = this.turnStartedFn$();
  public playerMoveStarted$ = this.playerMoveStartedFn$();
  // public playerMoveCompleted$ = this.playerMoveCompletedFn$();
  public playerBeastsMoveStarted$ = this.playerBeastsMoveStartedFn$();
  public playerBeastsMoveCompleted$ = this.playerBeastsMoveCompletedFn$();
  public cpuMoveStarted$ = this.cpuMoveStartedFn$();
  public cpuMoveCompleted$ = this.cpuMoveCompletedFn$();
  public cpuBeastsMoveStarted$ = this.cpuBeastsMoveStartedFn$();
  public cpuBeastsMoveCompleted$ = this.cpuBeastsMoveCompletedFn$();
  public turnCompleted$ = this.turnCompletedFn$();
  public gameEnded$ = this.gameEndedFn$();

  constructor(
    private actions$: Actions,
    private battleService: BattleService,
  ) {
  }

  private gameStartedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(gameStarted),
      tap(() => this.battleService.onGameStarted()),
      map(({ playerId, playerPartyId }) => turnStarted({
        turn: {
          ...DEFAULT_TURN,
          roundNumber: this.battleService.getCurrentRound(),
          activeParty: playerPartyId,
          movingFighter: playerId,
        },
      })),
    ));
  }

  private playerMoveStartedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(moveStarted),
      tap(() => this.battleService.onPlayerMoveStarted()),
      switchMap(() => this.battleService.calculateAttackVectors$),
    ), { dispatch: false });
  }

  // private playerMoveCompletedFn$(): CreateEffectMetadata {
  //   return createEffect(() => this.actions$.pipe(
  //     ofType(playerMoveCompleted),
  //     tap(() => this.battleService.onPlayerMoveCompleted()),
  //     switchMap(({ playerAttack, assaulter }: PlayerMoveCompletedActionType) => this.battleService.applyPlayerAttack(playerAttack, assaulter)),
  //     map(() => playerBeastsMoveStarted()),
  //     takeUntil(this.battleService.gameEnded$),
  //   ));
  // }

  private playerBeastsMoveStartedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(playerBeastsMoveStarted),
      tap(() => this.battleService.onPlayerBeastsMoveStarted()),
      map(() => playerBeastsMoveCompleted()),
      takeUntil(this.battleService.gameEnded$),
    ));
  }

  private playerBeastsMoveCompletedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(playerBeastsMoveCompleted),
      tap(() => this.battleService.onPlayerBeastsMoveCompleted()),
      map(() => cpuMoveStarted()),
      takeUntil(this.battleService.gameEnded$),
    ));
  }

  private cpuMoveStartedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(cpuMoveStarted),
      tap(() => this.battleService.onCpuMoveStarted()),
      map(() => cpuMoveCompleted()),
      takeUntil(this.battleService.gameEnded$),
    ));
  }

  private cpuMoveCompletedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(cpuMoveCompleted),
      tap(() => this.battleService.onCpuMoveCompleted()),
      map(() => cpuBeastsMoveStarted()),
      takeUntil(this.battleService.gameEnded$),
    ));
  }

  private cpuBeastsMoveStartedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(cpuBeastsMoveStarted),
      tap(() => this.battleService.onCpuBeastsMoveStarted()),
      map(() => cpuBeastsMoveCompleted()),
      takeUntil(this.battleService.gameEnded$),
    ));
  }

  private cpuBeastsMoveCompletedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(cpuBeastsMoveCompleted),
      tap(() => this.battleService.onCpuBeastsMoveCompleted()),
      map(() => turnCompleted()),
      takeUntil(this.battleService.gameEnded$),
    ));
  }

  private turnCompletedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(turnCompleted),
      tap(() => this.battleService.onTurnCompleted()),
      map(() => turnStarted({
        turn: {
          ...DEFAULT_TURN,
          roundNumber: this.battleService.getCurrentRound(),
        },
      })),
    ));
  }

  private turnStartedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(turnStarted),
      tap(() => this.battleService.onTurnStarted()),
      map(() => moveStarted()),
    ));
  }

  private gameEndedFn$(): CreateEffectMetadata {
    return createEffect(() => this.actions$.pipe(
      ofType(gameEnded),
      tap(() => this.battleService.onGameEnded()),
    ), { dispatch: false });
  }
}