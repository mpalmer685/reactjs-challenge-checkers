import React from 'react'
import styled from 'styled-components/macro'

const TokenRoot = styled.svg`
    width: 100%;
    height: 100%;

    .token {
        fill: ${({ theme, player }) =>
            player === 'red' ? theme.pieceRed : theme.pieceBlack};
    }

    .token__border,
    .token__king {
        fill: white;
        fill-opacity: 0.5;
    }
`

function path(startX, startY) {
    const segments = []

    const coordinate = (x, y) => [x, y].join(',')

    const pathBuilder = {
        moveTo(x, y) {
            segments.push('M', coordinate(x, y))
            return pathBuilder
        },

        moveBy(dx, dy) {
            segments.push('m', coordinate(dx, dy))
            return pathBuilder
        },

        lineBy(dx, dy) {
            segments.push('l', coordinate(dx, dy))
            return pathBuilder
        },

        circle(r) {
            segments.push(
                'a',
                coordinate(r, r),
                0,
                coordinate(1, 0),
                coordinate(2 * r, 0)
            )
            segments.push(
                'a',
                coordinate(r, r),
                0,
                coordinate(1, 0),
                coordinate(-2 * r, 0)
            )
            return pathBuilder
        },

        close() {
            segments.push('z')
            return pathBuilder
        },

        build() {
            return segments.join(' ')
        },
    }

    return pathBuilder.moveTo(startX, startY)
}

const tokenRadius = 40
const borderOuterRadius = 35
const borderInnerRadius = 28

function Token({ player, isKing }) {
    return (
        <TokenRoot player={player} viewBox="0 0 100 100">
            <circle className="token" cx="50" cy="50" r={tokenRadius} />
            <path
                className="token__border"
                d={path(50, 50)
                    .moveBy(-borderOuterRadius, 0)
                    .circle(borderOuterRadius)
                    .moveBy(borderOuterRadius - borderInnerRadius, 0)
                    .circle(borderInnerRadius)
                    .build()}
                fillRule="evenodd"
            />
            {isKing && (
                <path
                    className="token__king"
                    d={path(50, 60)
                        .lineBy(15, 0)
                        .lineBy(5, -15)
                        .lineBy(-12, 7)
                        .lineBy(-8, -15)
                        .lineBy(-8, 15)
                        .lineBy(-12, -7)
                        .lineBy(5, 15)
                        .lineBy(15, 0)
                        .close()
                        .moveTo(50 - 3, 60 - 15 + 7 - 15)
                        .circle(3)
                        .moveTo(50 + 15 + 5 - 3, 60 - 15)
                        .circle(3)
                        .moveTo(50 - 15 - 5 - 3, 60 - 15)
                        .circle(3)
                        .build()}
                />
            )}
        </TokenRoot>
    )
}

export default Token
