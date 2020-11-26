import styled from 'styled-components/macro'

const Square = styled.div`
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-color: ${({ theme }) => theme.boardBorderColor};
    border-style: solid;
    border-width: 0 1px 1px 0;
    background-color: ${props =>
        props.black ? props.theme.boardBlackColor : props.theme.boardRedColor};
    position: relative;
`

export default Square
