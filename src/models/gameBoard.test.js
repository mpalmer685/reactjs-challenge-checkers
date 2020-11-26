import { GameBoard, position } from './gameBoard'

describe('GameBoard', () => {
    it('should set up the initial board state', () => {
        const board = new GameBoard()
        expect(board.toString()).toBe(
            [
                '  b   b   b   b',
                'b   b   b   b  ',
                '  b   b   b   b',
                '               ',
                '               ',
                'r   r   r   r  ',
                '  r   r   r   r',
                'r   r   r   r  ',
            ].join('\n')
        )
    })

    describe('fromState', () => {
        const boardState = [
            '  b   b   b   b',
            'b   b   b   b  ',
            '  B   B   B   B',
            '               ',
            '               ',
            'R   R   R   R  ',
            '  r   r   r   r',
            'r   r   r   r  ',
        ].join('\n')

        it('should accept a string representing the state', () => {
            expect(GameBoard.fromState(boardState).toString()).toBe(boardState)
        })

        it('should accept an array of strings representing the rows', () => {
            expect(GameBoard.fromState(boardState.split('\n')).toString()).toBe(
                boardState
            )
        })
    })

    it('should return the piece at a given position', () => {
        const board = new GameBoard()
        expect(board.getPieceAtPosition(position(2, 2))).toBeNull()
        expect(board.getPieceAtPosition(position(0, 1))).toEqual({
            player: 'black',
            isKing: false,
        })
        expect(board.getPieceAtPosition(position(7, 2))).toEqual({
            player: 'red',
            isKing: false,
        })
    })

    describe('getAvailableMovesFromPosition', () => {
        it('should return no moves for an empty spot', () => {
            const board = new GameBoard()
            expect(
                board.availableMovesFromPosition(position(3, 2))
            ).toHaveLength(0)
        })

        it('should only allow normal pieces to move forward', () => {
            const board = GameBoard.fromState([
                '               ',
                '    b          ',
                '               ',
                '               ',
                '               ',
                '               ',
                '          r    ',
                '               ',
            ])

            expect(board.availableMovesFromPosition(position(1, 2)))
                .toHaveLength(2)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ to: position(2, 1) }),
                        expect.objectContaining({ to: position(2, 3) }),
                    ])
                )

            expect(board.availableMovesFromPosition(position(6, 5)))
                .toHaveLength(2)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ to: position(5, 4) }),
                        expect.objectContaining({ to: position(5, 6) }),
                    ])
                )
        })

        it('should allow king pieces to move forward and backward', () => {
            const board = GameBoard.fromState([
                '               ',
                '    B          ',
                '               ',
                '               ',
                '               ',
                '               ',
                '          R    ',
                '               ',
            ])

            expect(board.availableMovesFromPosition(position(1, 2)))
                .toHaveLength(4)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ to: position(2, 1) }),
                        expect.objectContaining({ to: position(2, 3) }),
                        expect.objectContaining({ to: position(0, 1) }),
                        expect.objectContaining({ to: position(0, 3) }),
                    ])
                )

            expect(board.availableMovesFromPosition(position(6, 5)))
                .toHaveLength(4)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ to: position(5, 4) }),
                        expect.objectContaining({ to: position(5, 6) }),
                    ])
                )
        })

        it('should not allow pieces to move into a square occupied by a piece of the same color', () => {
            const board = GameBoard.fromState([
                '  b   b        ',
                '    B          ',
                '  b   b        ',
                '               ',
                '               ',
                '        r   r  ',
                '          R    ',
                '        r   r  ',
            ])

            const tests = [
                [0, 1, 1],
                [0, 3, 1],
                [1, 2, 0],
                [7, 4, 1],
                [7, 6, 1],
                [6, 5, 0],
            ]

            tests.forEach(([row, column, numMoves]) => {
                expect(
                    board.availableMovesFromPosition(position(row, column))
                ).toHaveLength(numMoves)
            })
        })

        describe('at the edge of the board', () => {
            const board = GameBoard.fromState([
                '  r   R   B   b',
                'r   B   r      ',
                '  B           B',
                'R           r  ',
                '              R',
                'b           b  ',
                '  R   b       r',
                'B   b   r   R  ',
            ])

            const edgeTests = [
                [0, 1],
                [0, 3],
                [0, 5],
                [0, 7],
                [1, 0],
                [2, 7],
                [3, 0],
                [4, 7],
                [5, 0],
                [6, 7],
                [7, 0],
                [7, 2],
                [7, 4],
                [7, 6],
            ]

            const positionWith = partial =>
                expect.objectContaining({
                    to: expect.objectContaining(partial),
                })

            it.each(edgeTests)(
                'should not allow a piece at (%n, %n) to move off the edge',
                (row, column) => {
                    const moves = board.availableMovesFromPosition({
                        row,
                        column,
                    })
                    expect(moves).not.toContainEqual(positionWith({ row: -1 }))
                    expect(moves).not.toContainEqual(
                        positionWith({ column: -1 })
                    )
                    expect(moves).not.toContainEqual(positionWith({ row: 8 }))
                    expect(moves).not.toContainEqual(
                        positionWith({ column: 8 })
                    )
                }
            )

            const edgeJumpTests = [
                [1, 2],
                [1, 4],
                [2, 1],
                [3, 6],
                [5, 6],
                [6, 1],
                [6, 3],
            ]

            it.each(edgeJumpTests)(
                'should not allow a piece a (%n, %n) to jump off the edge',
                (row, column) => {
                    const moves = board.availableMovesFromPosition({
                        row,
                        column,
                    })
                    expect(moves).not.toContainEqual(positionWith({ row: -1 }))
                    expect(moves).not.toContainEqual(
                        positionWith({ column: -1 })
                    )
                    expect(moves).not.toContainEqual(positionWith({ row: 8 }))
                    expect(moves).not.toContainEqual(
                        positionWith({ column: 8 })
                    )
                }
            )
        })

        it('should allow normal pieces to jump forward', () => {
            const board = GameBoard.fromState([
                '               ',
                '    b          ',
                '  r   r        ',
                '               ',
                '               ',
                '        b   b  ',
                '          r    ',
                '               ',
            ])

            expect(board.availableMovesFromPosition(position(1, 2)))
                .toHaveLength(2)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            to: position(3, 0),
                            captures: position(2, 1),
                        }),
                        expect.objectContaining({
                            to: position(3, 4),
                            captures: position(2, 3),
                        }),
                    ])
                )

            expect(board.availableMovesFromPosition(position(6, 5)))
                .toHaveLength(2)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            to: position(4, 3),
                            captures: position(5, 4),
                        }),
                        expect.objectContaining({
                            to: position(4, 7),
                            captures: position(5, 6),
                        }),
                    ])
                )
        })

        it('should allow king pieces to jump forward and backward', () => {
            const board = GameBoard.fromState([
                '      B        ',
                '    r   r      ',
                '      B        ',
                '               ',
                '               ',
                '        R      ',
                '      b   b    ',
                '        R      ',
            ])

            expect(board.availableMovesFromPosition(position(0, 3)))
                .toHaveLength(2)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            to: position(2, 1),
                            captures: position(1, 2),
                        }),
                        expect.objectContaining({
                            to: position(2, 5),
                            captures: position(1, 4),
                        }),
                    ])
                )

            expect(board.availableMovesFromPosition(position(2, 3)))
                .toHaveLength(2)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            to: position(0, 1),
                            captures: position(1, 2),
                        }),
                        expect.objectContaining({
                            to: position(0, 5),
                            captures: position(1, 4),
                        }),
                    ])
                )

            expect(board.availableMovesFromPosition(position(7, 4)))
                .toHaveLength(2)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            to: position(5, 2),
                            captures: position(6, 3),
                        }),
                        expect.objectContaining({
                            to: position(5, 6),
                            captures: position(6, 5),
                        }),
                    ])
                )

            expect(board.availableMovesFromPosition(position(5, 4)))
                .toHaveLength(2)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            to: position(7, 2),
                            captures: position(6, 3),
                        }),
                        expect.objectContaining({
                            to: position(7, 6),
                            captures: position(6, 5),
                        }),
                    ])
                )
        })

        it('should allow pieces to chain jumps', () => {
            let board = GameBoard.fromState([
                '      b        ',
                '        r   r  ',
                '  B            ',
                '    r   r      ',
                '               ',
                '    b          ',
                '               ',
                '               ',
            ])

            expect(board.availableMovesFromPosition(position(0, 3)))
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            from: position(0, 3),
                            to: position(2, 5),
                            captures: position(1, 4),
                            jumps: [],
                        }),
                        expect.objectContaining({
                            from: position(2, 5),
                            to: position(4, 3),
                            captures: position(3, 4),
                            jumps: [position(0, 3)],
                        }),
                    ])
                )
                .not.toContainEqual(
                    expect.objectContaining({
                        to: position(6, 1),
                    })
                )
                .not.toContainEqual(
                    expect.objectContaining({
                        to: position(0, 7),
                    })
                )

            expect(board.availableMovesFromPosition(position(2, 1)))
                .toEqual(
                    expect.arrayContaining([
                        {
                            from: position(2, 1),
                            to: position(4, 3),
                            captures: position(3, 2),
                            jumps: [],
                        },
                        {
                            from: position(4, 3),
                            to: position(2, 5),
                            captures: position(3, 4),
                            jumps: [position(2, 1)],
                        },
                        {
                            from: position(2, 5),
                            to: position(0, 7),
                            captures: position(1, 6),
                            jumps: [position(2, 1), position(4, 3)],
                        },
                    ])
                )
                .not.toContainEqual(
                    expect.objectContaining({
                        to: position(6, 1),
                    })
                )

            board = GameBoard.fromState([
                '               ',
                '               ',
                '          r    ',
                '               ',
                '      b   b    ',
                '            R  ',
                '  b   b        ',
                '        r      ',
            ])

            expect(board.availableMovesFromPosition(position(7, 4)))
                .toEqual(
                    expect.arrayContaining([
                        {
                            from: position(7, 4),
                            to: position(5, 2),
                            captures: position(6, 3),
                            jumps: [],
                        },
                        {
                            from: position(5, 2),
                            to: position(3, 4),
                            captures: position(4, 3),
                            jumps: [position(7, 4)],
                        },
                    ])
                )
                .not.toContainEqual(
                    expect.objectContaining({
                        to: position(6, 1),
                    })
                )
                .not.toContainEqual(
                    expect.objectContaining({
                        to: position(0, 7),
                    })
                )

            expect(board.availableMovesFromPosition(position(5, 6)))
                .toEqual(
                    expect.arrayContaining([
                        {
                            from: position(5, 6),
                            to: position(3, 4),
                            captures: position(4, 5),
                            jumps: [],
                        },
                        {
                            from: position(3, 4),
                            to: position(5, 2),
                            captures: position(4, 3),
                            jumps: [position(5, 6)],
                        },
                        {
                            from: position(5, 2),
                            to: position(7, 0),
                            captures: position(6, 1),
                            jumps: [position(5, 6), position(3, 4)],
                        },
                    ])
                )
                .not.toContainEqual(
                    expect.objectContaining({
                        to: position(1, 6),
                    })
                )
        })

        it('should not allow the same piece to be jumped more than once in a chain', () => {
            const board = GameBoard.fromState([
                '               ',
                '    r   r      ',
                '  B            ',
                '    r   r      ',
                '               ',
                '               ',
                '               ',
                '               ',
            ])

            const moves = board.availableMovesFromPosition(position(2, 1))
            expect(moves.filter(m => m.captures)).toHaveLength(8)
        })

        it('should not allow pieces to jump into occupied squares', () => {
            const board = GameBoard.fromState([
                '      r       b',
                '    R   r   r  ',
                '  b   b   B    ',
                'b   b   r      ',
                '      r        ',
                '               ',
                '               ',
                '               ',
            ])

            const tests = [
                {
                    from: position(3, 4),
                    invalid: [position(1, 6)],
                },
                {
                    from: position(4, 3),
                    invalid: [position(2, 1)],
                },
                {
                    from: position(1, 2),
                    invalid: [position(3, 4), position(3, 0)],
                },
                {
                    from: position(0, 7),
                    invalid: [position(2, 5)],
                },
                {
                    from: position(2, 5),
                    invalid: [position(4, 3), position(0, 7), position(0, 3)],
                },
            ]

            tests.forEach(({ from, invalid }) => {
                expect(board.availableMovesFromPosition(from)).not.toEqual(
                    expect.arrayContaining(
                        invalid.map(to => expect.objectContaining({ to }))
                    )
                )
            })
        })

        it('should require pieces to jump when possible', () => {
            const board = GameBoard.fromState([
                '               ',
                '    b          ',
                '  r            ',
                '    B          ',
                '          R    ',
                '        b      ',
                '          r    ',
                '               ',
            ])

            expect(board.availableMovesFromPosition(position(1, 2)))
                .toHaveLength(1)
                .toEqual([
                    expect.objectContaining({
                        to: position(3, 0),
                        captures: position(2, 1),
                    }),
                ])

            expect(board.availableMovesFromPosition(position(3, 2)))
                .toHaveLength(1)
                .toEqual([
                    expect.objectContaining({
                        to: position(1, 0),
                        captures: position(2, 1),
                    }),
                ])

            expect(board.availableMovesFromPosition(position(6, 5)))
                .toHaveLength(1)
                .toEqual([
                    expect.objectContaining({
                        to: position(4, 3),
                        captures: position(5, 4),
                    }),
                ])

            expect(board.availableMovesFromPosition(position(4, 5)))
                .toHaveLength(1)
                .toEqual([
                    expect.objectContaining({
                        to: position(6, 3),
                        captures: position(5, 4),
                    }),
                ])
        })
    })

    describe('makeMove', () => {
        it('should move a piece', () => {
            const board = new GameBoard()
            const moves = [
                {
                    from: position(2, 1),
                    to: position(3, 0),
                },
            ]
            board.makeMove({ from: position(2, 1), to: position(3, 0) }, moves)

            expect(board.toString()).toBe(
                [
                    '  b   b   b   b',
                    'b   b   b   b  ',
                    '      b   b   b',
                    'b              ',
                    '               ',
                    'r   r   r   r  ',
                    '  r   r   r   r',
                    'r   r   r   r  ',
                ].join('\n')
            )
        })

        it('should remove a captured piece from the board', () => {
            const board = GameBoard.fromState([
                '  b   b   b   b',
                'b   b   b   b  ',
                '  b       b   b',
                '        b      ',
                '          r    ',
                'r   r       r  ',
                '  r   r   r   r',
                'r   r   r   r  ',
            ])
            const moves = board.availableMovesForPlayer('red')
            expect(moves).toHaveLength(1)
            board.makeMove(moves[0], moves)

            expect(board.toString()).toBe(
                [
                    '  b   b   b   b',
                    'b   b   b   b  ',
                    '  b   r   b   b',
                    '               ',
                    '               ',
                    'r   r       r  ',
                    '  r   r   r   r',
                    'r   r   r   r  ',
                ].join('\n')
            )
        })

        it('should handle jump chains', () => {
            const board = GameBoard.fromState([
                '  b            ',
                '               ',
                '      b        ',
                '               ',
                '          b    ',
                '            r  ',
                '               ',
                '               ',
            ])
            const moves = board.availableMovesForPlayer('red')
            expect(moves).toHaveLength(2)
            const move = {
                jumps: [{ row: 5, column: 6 }],
                from: { row: 3, column: 4 },
                to: { row: 1, column: 2 },
                captures: { row: 2, column: 3 },
            }
            board.makeMove(move, moves)

            expect(board.toString()).toBe(
                [
                    '  b            ',
                    '    r          ',
                    '               ',
                    '               ',
                    '               ',
                    '               ',
                    '               ',
                    '               ',
                ].join('\n')
            )
        })

        it('should promote a piece to king', () => {
            const board = GameBoard.fromState([
                '  b            ',
                '    r          ',
                '               ',
                '               ',
                '               ',
                '               ',
                '               ',
                '               ',
            ])
            const moves = board.availableMovesForPlayer('red')
            expect(moves).toHaveLength(1)
            board.makeMove(moves[0], moves)

            expect(board.toString()).toBe(
                [
                    '  b   R        ',
                    '               ',
                    '               ',
                    '               ',
                    '               ',
                    '               ',
                    '               ',
                    '               ',
                ].join('\n')
            )
        })
    })
})
