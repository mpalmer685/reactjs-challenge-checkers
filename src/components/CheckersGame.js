import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
} from 'react'
import styled, { createGlobalStyle } from 'styled-components/macro'
import { GameBoard, getOpponent, positionsAreEqual } from '../models/gameBoard'
import Board from './Board'
import GameContext from './GameContext'

const Globals = createGlobalStyle`
  body {
    background-color: #730000;
    font-family: sans-serif;
  }
`

const Title = styled.h1`
    color: white;
`

const GameStateDisplay = styled.h2`
    color: white;
    text-transform: capitalize;
`

const GameState = {
    inProgress: 'inProgress',
    win: 'win',
    draw: 'draw',
}

function getInitialState(board) {
    return {
        currentPlayer: 'black',
        pieces: board.getPieces(),
        startPosition: null,
        gameState: GameState.inProgress,
    }
}

function createAction(type) {
    const actionCreator = payload => ({ type, payload })
    actionCreator.type = type
    actionCreator.toString = () => `${type}`

    return actionCreator
}

const endGame = createAction('endGame')
const setStartPosition = createAction('setStartPosition')
const makeMove = createAction('makeMove')
const reset = createAction('reset')

function gameReducer(state, { type, payload }) {
    switch (type) {
        case endGame.type:
            return {
                ...state,
                gameState: payload,
                winner:
                    payload === GameState.win
                        ? getOpponent(state.currentPlayer)
                        : null,
            }
        case setStartPosition.type:
            return { ...state, startPosition: payload }
        case makeMove.type:
            return {
                ...state,
                pieces: payload,
                currentPlayer: getOpponent(state.currentPlayer),
                startPosition: null,
            }
        case reset.type:
            return getInitialState(payload)
        default:
            return state
    }
}

function CheckersGame() {
    const boardRef = useRef(new GameBoard())
    const board = boardRef.current
    const [
        { currentPlayer, pieces, startPosition, gameState },
        dispatch,
    ] = useReducer(gameReducer, board, getInitialState)
    // const [currentPlayer, setCurrentPlayer] = useState<Player>('black')
    // const [pieces, setPieces] = useState(() => board.getPieces())
    // const [startPosition, setStartPosition] = useState<Position | null>(null)
    // const [gameState, setGameState] = useState<GameState>(GameState.inProgress)

    const movesForCurrentPlayer = useMemo(
        () => board.availableMovesForPlayer(currentPlayer),
        [currentPlayer, board]
    )

    useEffect(() => {
        if (movesForCurrentPlayer.length === 0) {
            const movesForOpponent = board.availableMovesForPlayer(
                getOpponent(currentPlayer)
            )
            dispatch(
                endGame(
                    movesForOpponent.length === 0
                        ? GameState.draw
                        : GameState.win
                )
            )
        }
    }, [movesForCurrentPlayer, board, currentPlayer])

    const selectSquare = useCallback(
        (row, column) => {
            const selectedPosition = { row, column }
            const pieceAtPosition = board.getPieceAtPosition(selectedPosition)

            if (!startPosition) {
                if (pieceAtPosition?.player === currentPlayer) {
                    dispatch(setStartPosition(selectedPosition))
                }
            } else {
                if (positionsAreEqual(selectedPosition, startPosition)) {
                    dispatch(setStartPosition(null))
                } else if (pieceAtPosition?.player === currentPlayer) {
                    dispatch(setStartPosition(selectedPosition))
                } else {
                    const move = movesForCurrentPlayer.find(
                        ({ from, to, jumps }) =>
                            positionsAreEqual(to, selectedPosition) &&
                            (jumps && jumps.length > 0
                                ? positionsAreEqual(jumps[0], startPosition)
                                : positionsAreEqual(from, startPosition))
                    )
                    if (move) {
                        dispatch(
                            makeMove(
                                board.makeMove(move, movesForCurrentPlayer)
                            )
                        )
                    }
                }
            }
        },
        [startPosition, board, currentPlayer, movesForCurrentPlayer]
    )

    const contextValue = useMemo(
        () => ({ pieces, movesForCurrentPlayer, startPosition, selectSquare }),
        [pieces, movesForCurrentPlayer, startPosition, selectSquare]
    )

    return (
        <>
            <Globals />
            <GameContext.Provider value={contextValue}>
                <div>
                    <Title>Checkers</Title>
                    <GameStateDisplay>
                        {gameState === GameState.inProgress && (
                            <span>Current player: {currentPlayer}</span>
                        )}
                        {gameState === GameState.draw && <span>Draw!</span>}
                        {gameState === GameState.win && (
                            <span>{getOpponent(currentPlayer)} wins!</span>
                        )}
                    </GameStateDisplay>
                    <Board />
                </div>
            </GameContext.Provider>
        </>
    )
}

export default CheckersGame
