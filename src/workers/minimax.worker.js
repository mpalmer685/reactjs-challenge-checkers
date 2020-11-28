import { GameBoard } from '../models/gameBoard'
import partition from 'lodash/partition'

export async function getBestMove(boardState, searchDepth, player, opponent) {
    return minimax(
        new GameBoard(boardState),
        searchDepth,
        player,
        opponent,
        -Infinity,
        Infinity
    )
}

async function minimax(b, depth, player, opponent, low, high) {
    const moves = b.availableMovesForPlayer(player)
    const best = { move: null, score: null, moves }

    if (depth === 0 || moves.length === 0) {
        best.score = evaluateBoard(b, player, depth)
        return best
    } else if (moves.length === 1) {
        best.score = evaluateBoard(b, player, depth)
        best.move = moves[0]
        return best
    }

    for (const move of moves) {
        const board = new GameBoard(b.state)
        board.makeMove(move, moves)

        const { score } = await minimax(
            board,
            depth - 1,
            opponent,
            player,
            -high,
            -low
        )

        if (-score > low) {
            low = -score
            best.move = move
            best.score = low
        }

        if (low >= high) {
            return best
        }
    }

    return best
}

function getScore(pieces) {
    return pieces.reduce((score, { isKing }) => (score + isKing ? 2 : 1), 0)
}

function evaluateBoard(board, player, currentDepth) {
    /*
    The following factors contribute to a board's score, starting with the
    factor that affects the score the most
    1. The difference in the number of remaining pieces for each player (kings count as 2)
    2. The current search depth (given 2 winning outcomes, a player should
       prefer the one that requires the fewest moves)
    3. A random digit, so that moves of equal weight have an equal chance of being chosen
     */
    const boardState = board.getPieces()
    const allPieces = boardState.map(({ piece }) => piece)
    const [playerPieces, opponentPieces] = partition(
        allPieces,
        p => p.player === player
    )
    if (playerPieces.length === 0) {
        return -Infinity
    } else if (opponentPieces.length === 0) {
        return Infinity
    }

    const pieceScore = getScore(playerPieces) - getScore(opponentPieces)

    return (
        pieceScore * 100 +
        (9 - currentDepth) * 10 +
        Math.floor(Math.random() * 10)
    )
}
