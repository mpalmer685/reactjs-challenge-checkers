import React from 'react'
import styled from 'styled-components/macro'
import BoardSquare from './BoardSquare'

const BoardContainer = styled.div`
    width: 500px;
    height: 500px;
    box-sizing: border-box;
    border-color: ${({ theme }) => theme.boardBorderColor};
    border-style: solid;
    border-width: 2px 1px 1px 2px;
    display: flex;
    flex-wrap: wrap;
`

function Board() {
    function renderSquare(i) {
        const x = i % 8
        const y = Math.floor(i / 8)

        return <BoardSquare key={i} x={x} y={y} />
    }

    const squares = new Array(64).fill(null).map((_, i) => renderSquare(i))
    return <BoardContainer>{squares}</BoardContainer>
}

export default React.memo(Board)
