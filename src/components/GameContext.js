import React, { useContext } from 'react'
import { positionsAreEqual } from '../models/gameBoard'

const GameContext = React.createContext({
    pieces: [],
    movesForCurrentPlayer: [],
    startPosition: null,
    selectSquare: () => {},
})

export default GameContext

export function useGameContext(row, column) {
    const currentPosition = { row, column }
    const {
        pieces,
        movesForCurrentPlayer,
        startPosition,
        selectSquare,
    } = useContext(GameContext)
    const pieceAtPosition = pieces.find(({ position }) =>
        positionsAreEqual(position, currentPosition)
    )
    const isStartPosition = positionsAreEqual(startPosition, currentPosition)
    const isAvailableDestination =
        startPosition != null &&
        movesForCurrentPlayer.some(
            ({ jumps, from, to }) =>
                positionsAreEqual(to, currentPosition) &&
                (jumps && jumps.length > 0
                    ? jumps.some(p => positionsAreEqual(p, startPosition))
                    : positionsAreEqual(from, startPosition))
        )

    return {
        piece: pieceAtPosition?.piece,
        isAvailableDestination,
        isStartPosition,
        onClick: () => selectSquare(row, column),
    }
}
