import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components/macro'
import theme from './theme'
import CheckersGame from './components/CheckersGame'

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CheckersGame />
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
