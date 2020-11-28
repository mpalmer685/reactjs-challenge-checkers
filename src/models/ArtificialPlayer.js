import sample from 'lodash/sample'
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'comlink-loader!../workers/minimax.worker'
import { getOpponent } from './gameBoard'

const worker = new Worker()

const randomStrategy = (board, player) => {
    const moves = board.availableMovesForPlayer(player)
    return sample(moves)
}

const minimaxStrategy = searchDepth => async (board, player) => {
    return worker.getBestMove(
        board.state,
        searchDepth,
        player,
        getOpponent(player)
    )
}

class ArtificialPlayer {
    constructor(player, strategy) {
        this.player = player
        this.strategy = strategy
    }

    async getNextMove(board) {
        return this.strategy(board, this.player)
    }
}

export default ArtificialPlayer

export const Strategy = {
    easy: randomStrategy,
    medium: minimaxStrategy(2),
    hard: minimaxStrategy(4),
}
