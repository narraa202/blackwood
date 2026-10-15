// Screen registry. Everything is imported up front: the game is small, and
// a lazy import failing on a flaky connection would strand the player.

import * as cover from './cover.js';
import * as prologue from './prologue.js';
import * as map from './map.js';
import * as room from './room.js';
import * as talk from './talk.js';
import * as board from './board.js';
import * as event from './event.js';
import * as accuse from './accuse.js';
import * as result from './result.js';

export const SCREENS = { cover, prologue, map, room, talk, board, event, accuse, result };
