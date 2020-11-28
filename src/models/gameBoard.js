import cloneDeep from 'lodash/cloneDeep'

export function position(row, column) {
    return { row, column }
}

export function positionsAreEqual(p1, p2) {
    return (
        p1 != null &&
        p2 != null &&
        p1?.row === p2?.row &&
        p1?.column === p2?.column
    )
}

export function getOpponent(player) {
    return player === 'red' ? 'black' : 'red'
}

const Direction = {
    black: 1,
    red: -1,
}

const KingRow = {
    black: 7,
    red: 0,
}

export class GameBoard {
    static fromState(state) {
        const boardState = parseState(state)
        return new GameBoard(boardState)
    }

    constructor(state = setUpBoard()) {
        this.state = cloneDeep(state)
    }

    getState() {
        const rows = new Array(8).fill(null).map(() => new Array(8).fill(null))
        this.state.forEach((value, index) => {
            if ((index + 1) % 9 === 0) return

            const { row, column } = toPosition(index)
            rows[row][column] = value
        })
        return rows
    }

    getPieces() {
        return this.state
            .map((piece, index) =>
                piece
                    ? {
                          position: toPosition(index),
                          piece,
                      }
                    : null
            )
            .filter(Boolean)
    }

    getPieceAtPosition(position) {
        return this.state[fromPosition(position)]
    }

    availableMovesFromPosition(position) {
        const start = fromPosition(position)
        const piece = this.state[start]
        if (piece === null) {
            return []
        }

        const moves = []

        const offsets = [4, 5].map(offset => offset * Direction[piece.player])
        if (piece.isKing) {
            offsets.push(...offsets.map(o => o * -1))
        }

        const isLocationValid = location =>
            location >= 0 && location <= 34 && (location + 1) % 9 > 0

        const isLocationOccupied = location =>
            !!this.state[location] && location !== start

        offsets.forEach(offset => {
            const nextPosition = start + offset
            if (isLocationValid(nextPosition) && !this.state[nextPosition]) {
                moves.push({
                    from: position,
                    to: toPosition(nextPosition),
                })
            }
        })

        const checkJump = (
            jumpOffset,
            fromLocation,
            captures,
            previousJumps = []
        ) => {
            const captureLocation = fromLocation + jumpOffset
            const jumpLocation = captureLocation + jumpOffset

            const capturedPiece = this.state[captureLocation]
            if (
                !capturedPiece ||
                capturedPiece.player === piece.player ||
                !isLocationValid(jumpLocation) ||
                isLocationOccupied(jumpLocation) ||
                captures.includes(captureLocation)
            ) {
                return
            }

            captures.push(captureLocation)
            moves.push({
                jumps: previousJumps,
                from: toPosition(fromLocation),
                to: toPosition(jumpLocation),
                captures: toPosition(captureLocation),
            })

            offsets
                .filter(o => o !== -1 * jumpOffset)
                .forEach(offset => {
                    checkJump(
                        offset,
                        jumpLocation,
                        captures,
                        previousJumps.concat([toPosition(fromLocation)])
                    )
                })
        }

        offsets.forEach(offset => {
            checkJump(offset, start, [])
        })

        return moves.some(m => m.captures)
            ? moves.filter(m => m.captures)
            : moves
    }

    availableMovesForPlayer(player) {
        const moves = this.getPieces()
            .filter(({ piece }) => piece.player === player)
            .flatMap(({ position }) =>
                this.availableMovesFromPosition(position)
            )

        return moves.some(m => m.captures)
            ? moves.filter(m => m.captures)
            : moves
    }

    makeMove(move, availableMoves) {
        const processMove = move => {
            const moveStart = fromPosition(move.from)
            const moveEnd = fromPosition(move.to)

            const piece = this.state[moveStart]
            if (!piece) {
                return
            }

            if (move.to.row === KingRow[piece.player]) {
                piece.isKing = true
            }

            this.state[moveEnd] = piece
            this.state[moveStart] = null

            if (move.captures) {
                this.state[fromPosition(move.captures)] = null
            }
        }

        const matchesMove = move => other => {
            return (
                positionsAreEqual(move.from, other.from) &&
                positionsAreEqual(move.to, other.to) &&
                move.jumps?.length === other.jumps?.length &&
                move.jumps?.every((p, i) =>
                    positionsAreEqual(p, other.jumps[i])
                )
            )
        }

        if (move.jumps && move.jumps.length > 0) {
            const jumpMoves = []
            const jumpStartPositions = move.jumps.concat([move.from])
            for (let i = 0; i < jumpStartPositions.length - 1; ++i) {
                const from = jumpStartPositions[i]
                const to = jumpStartPositions[i + 1]
                const move = availableMoves.find(
                    matchesMove({
                        from,
                        to,
                        jumps: jumpStartPositions.slice(0, i),
                    })
                )
                jumpMoves.push(move)
            }
            jumpMoves.push(move)

            jumpMoves.forEach(processMove)
        } else {
            processMove(move)
        }

        return this.getPieces()
    }

    toString() {
        const formatSquare = square => {
            if (square === null) return ' '
            const identifier = square.player.substr(0, 1)
            return square.isKing
                ? identifier.toUpperCase()
                : identifier.toLowerCase()
        }

        return this.getState()
            .map(row => row.map(formatSquare).join(' '))
            .join('\n')
    }
}

function setUpBoard() {
    return parseState([
        '  b   b   b   b',
        'b   b   b   b  ',
        '  b   b   b   b',
        '               ',
        '               ',
        'r   r   r   r  ',
        '  r   r   r   r',
        'r   r   r   r  ',
    ])
}

/*
      0   1   2   3   4   5   6   7
   ----------------------------------
0 |       0       1       2       3  |
1 |   4       5       6       7      |  8
2 |       9      10      11      12  |
3 |  13      14      15      16      | 17
4 |      18      19      20      21  |
5 |  22      23      24      25      | 26
6 |      27      28      29      30  |
7 |  31      32      33      34      | 35
   ----------------------------------
 */

const columns = [4, 0, 5, 1, 6, 2, 7, 3]
function fromPosition({ row, column }) {
    return columns[column] + 9 * Math.floor(row / 2)
}

function toPosition(n) {
    return {
        row: Math.floor((n + 1) / 4.5),
        column: columns.indexOf(n % 9),
    }
}

function parseState(state) {
    state = Array.isArray(state)
        ? state.join('   ')
        : state.replace(/\n/g, '   ')

    return state
        .split('')
        .filter((_, i) => i % 4 === 2)
        .map(c =>
            c === ' '
                ? null
                : {
                      player: c.toLowerCase() === 'r' ? 'red' : 'black',
                      isKing: c.toUpperCase() === c,
                  }
        )
}
