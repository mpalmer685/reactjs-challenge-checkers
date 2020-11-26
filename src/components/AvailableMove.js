import React from 'react'
import styled from 'styled-components/macro'

const moveStartColor = '#FFFFFFCC'
const moveEndColor = '#FFF'

const borderColor = ({ isMoveStart }) =>
    isMoveStart ? moveStartColor : moveEndColor

const Indicator = styled.div`
    position: absolute;
    width: calc(80% + 6px);
    height: calc(80% + 6px);
    left: calc(10% - 3px);
    top: calc(10% - 3px);
    border: 3px solid ${borderColor};
    border-radius: 9999px;
    box-sizing: border-box;
`

function AvailableMove({ isMoveStart = false }) {
    return <Indicator isMoveStart={isMoveStart} />
}

export default AvailableMove
