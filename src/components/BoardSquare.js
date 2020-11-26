import React from 'react'
import styled from 'styled-components/macro'
import Square from './Square'
import { useGameContext } from './GameContext'
import Token from './Token'
import AvailableMove from './AvailableMove'

const BoardSquareContainer = styled.div`
    position: relative;
    height: 12.5%;
    width: 12.5%;
`

function BoardSquare({ x, y }) {
    const {
        piece,
        isStartPosition,
        isAvailableDestination,
        onClick,
    } = useGameContext(y, x)
    const black = (x + y) % 2 > 0

    return (
        <BoardSquareContainer onClick={onClick}>
            <Square black={black}>
                {piece && <Token {...piece} />}
                {isAvailableDestination && <AvailableMove />}
                {isStartPosition && <AvailableMove isMoveStart />}
            </Square>
        </BoardSquareContainer>
    )
}

export default BoardSquare
