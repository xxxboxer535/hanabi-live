/*
    In shared replays, players can enter a hypotheticals where can perform arbitrary actions
    in order to see what will happen
*/

// Imports
const constants = require('../../constants');
const convert = require('./convert');
const globals = require('./globals');

exports.toggle = () => {
    globals.hypothetical = !globals.hypothetical;
    console.log('Toggling hypothetical:', globals.hypothetical);

    if (globals.amSharedReplayLeader) {
        setAllCardsDraggable();
        let type;
        if (globals.hypothetical) {
            type = constants.REPLAY_ACTION_TYPE.HYPO_START;
        } else {
            type = constants.REPLAY_ACTION_TYPE.HYPO_END;
            globals.hypoActions = [];
        }
        globals.lobby.conn.send('replayAction', {
            type,
        });
    } else {
        globals.elements.hypoCircle.setVisible(globals.hypothetical);
        globals.layers.UI.batchDraw();
    }
};

exports.send = (action) => {
    if (action.data.type === constants.ACT.CLUE) {
        // TODO
    } else if (action.data.type === constants.ACT.PLAY) {
        const card = globals.deck[action.data.target];

        // Play
        hypoAction({
            type: 'play',
            which: {
                index: globals.currentPlayerIndex,
                order: action.data.target,
                rank: card.trueRank,
                suit: convert.suitToMsgSuit(card.trueSuit, globals.variant),
            },
        });
        globals.score += 1;

        // Text
        let text = `${globals.playerNames[globals.currentPlayerIndex]} plays `;
        text += `${card.trueSuit.name} ${card.trueRank} from slot #${card.getSlotNum()}`;
        hypoAction({
            type: 'text',
            text,
        });

        // Draw
        const nextCard = globals.deckOrder[globals.deck.length];
        hypoAction({
            type: 'draw',
            order: globals.deck.length,
            rank: nextCard.rank,
            suit: nextCard.suit,
            who: globals.currentPlayerIndex,
        });
    } else if (action.data.type === constants.ACT.DISCARD) {
        const card = globals.deck[action.data.target];

        // Play
        hypoAction({
            type: 'play',
            which: {
                index: globals.currentPlayerIndex,
                order: action.data.target,
                rank: card.trueRank,
                suit: convert.suitToMsgSuit(card.trueSuit, globals.variant),
            },
        });
        globals.score += 1;

        // Text
        let text = `${globals.playerNames[globals.currentPlayerIndex]} plays `;
        text += `${card.trueSuit.name} ${card.trueRank} from slot #${card.getSlotNum()}`;
        hypoAction({
            type: 'text',
            text,
        });

        // Draw
        const nextCard = globals.deckOrder[globals.deck.length];
        hypoAction({
            type: 'draw',
            order: globals.deck.length,
            rank: nextCard.rank,
            suit: nextCard.suit,
            who: globals.currentPlayerIndex,
        });
    } else if (action.data.type === constants.ACT.DECKPLAY) {
        // TODO
    }

    // Status
    hypoAction({
        type: 'status',
        clues: globals.clues,
        doubleDiscard: false,
        score: globals.score,
        maxScore: globals.maxScore,
    });

    // Turn
    globals.turn += 1;
    globals.currentPlayerIndex += 1;
    if (globals.currentPlayerIndex === globals.playerNames.length) {
        globals.currentPlayerIndex = 0;
    }
    hypoAction({
        type: 'turn',
        num: globals.turn,
        who: globals.currentPlayerIndex,
    });
};

const hypoAction = (action) => {
    globals.lobby.conn.send('replayAction', {
        type: constants.REPLAY_ACTION_TYPE.HYPO_ACTION,
        actionJSON: JSON.stringify(action),
    });
};

const setAllCardsDraggable = () => {
    for (const hand of globals.elements.playerHands) {
        for (const layoutChild of hand.children) {
            layoutChild.checkSetDraggable();
        }
    }
};
