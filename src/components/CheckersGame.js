import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
} from 'react'
import styled, { createGlobalStyle } from 'styled-components/macro'
import { GameBoard, getOpponent, positionsAreEqual } from '../models/gameBoard'
import ArtificialPlayer, { Strategy } from '../models/ArtificialPlayer'
import Board from './Board'
import GameContext from './GameContext'

const Globals = createGlobalStyle`
  body {
    background-color: #00731d;
    font-family: sans-serif;
    margin: 0;
  }
`

const Title = styled.h1`
    color: white;
    text-align: center;
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

    return actionCreator
}

const setStartPosition = createAction('setStartPosition')
const makeMove = createAction('makeMove')
const reset = createAction('reset')

function gameReducer(state, { type, payload }) {
    switch (type) {
        case setStartPosition.type:
            return { ...state, startPosition: payload }
        case makeMove.type: {
            const { board, move } = payload
            const pieces = board.makeMove(
                move,
                state.availableMovesForCurrentPlayer
            )
            const opponent = state.currentPlayer
            const currentPlayer = getOpponent(state.currentPlayer)
            const availableMovesForCurrentPlayer = board.availableMovesForPlayer(
                currentPlayer
            )

            const nextState = {
                ...state,
                pieces,
                currentPlayer,
                availableMovesForCurrentPlayer,
                startPosition: null,
            }

            if (availableMovesForCurrentPlayer.length === 0) {
                const movesForOpponent = board.availableMovesForPlayer(opponent)
                if (movesForOpponent.length === 0) {
                    nextState.gameState = GameState.draw
                } else {
                    nextState.gameState = GameState.win
                    nextState.winner = opponent
                }
            }

            return nextState
        }
        case reset.type:
            return getInitialState(payload)
        default:
            return state
    }
}

function CheckersGame() {
    const aiPlayer = useRef(new ArtificialPlayer('black', Strategy.medium))
    const boardRef = useRef(new GameBoard())
    const board = boardRef.current
    const [
        {
            currentPlayer,
            availableMovesForCurrentPlayer,
            pieces,
            startPosition,
            gameState,
            winner,
        },
        dispatch,
    ] = useReducer(gameReducer, board, getInitialState)

    useEffect(() => {
        if (
            currentPlayer === aiPlayer.current.player &&
            gameState === GameState.inProgress
        ) {
            aiPlayer.current
                .getNextMove(boardRef.current)
                .then(({ move, moves }) => {
                    dispatch(makeMove({ board, move }))
                })
        }
    }, [currentPlayer, board, gameState])

    const selectSquare = useCallback(
        (row, column) => {
            if (aiPlayer.current && currentPlayer === aiPlayer.current.player) {
                return
            }

            const selectedPosition = { row, column }
            const pieceAtPosition = board.getPieceAtPosition(selectedPosition)

            if (!startPosition) {
                if (pieceAtPosition?.player === currentPlayer) {
                    dispatch(setStartPosition(selectedPosition))
                }
            } else if (positionsAreEqual(selectedPosition, startPosition)) {
                dispatch(setStartPosition(null))
            } else if (pieceAtPosition?.player === currentPlayer) {
                dispatch(setStartPosition(selectedPosition))
            } else {
                const move = availableMovesForCurrentPlayer.find(
                    ({ from, to, jumps }) =>
                        positionsAreEqual(to, selectedPosition) &&
                        (jumps && jumps.length > 0
                            ? positionsAreEqual(jumps[0], startPosition)
                            : positionsAreEqual(from, startPosition))
                )
                if (move) {
                    dispatch(makeMove({ board, move }))
                }
            }
        },
        [startPosition, board, currentPlayer, availableMovesForCurrentPlayer]
    )

    const contextValue = useMemo(
        () => ({
            pieces,
            movesForCurrentPlayer: availableMovesForCurrentPlayer,
            startPosition,
            selectSquare,
        }),
        [pieces, availableMovesForCurrentPlayer, startPosition, selectSquare]
    )

    return (
        <>
            <Globals />
            <GameContext.Provider value={contextValue}>
                <div
                    css={{
                        height: '100vh',
                        width: '100vw',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Title>Checkers</Title>
                    <div
                        css={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'row-reverse',
                            padding: 20,
                        }}
                    >
                        <div css={{ flex: 1, paddingLeft: 20 }}>
                            <GameStateDisplay>
                                {gameState === GameState.inProgress && (
                                    <span>Current player: {currentPlayer}</span>
                                )}
                                {gameState === GameState.draw && (
                                    <span>Draw!</span>
                                )}
                                {gameState === GameState.win && (
                                    <span>{winner} wins!</span>
                                )}
                            </GameStateDisplay>
                        </div>
                        <Board />
                    </div>
                </div>
            </GameContext.Provider>
        </>
    )
}

export default CheckersGame
