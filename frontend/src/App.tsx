import { Box, createTheme, CssBaseline, PaletteMode, ThemeProvider } from '@mui/material'
import { useState, useMemo, useCallback, useEffect, createContext, useContext } from 'react'

import { createBrowserRouter, Outlet, redirect, RouterProvider, useNavigate } from 'react-router-dom'
import Navbar from './Components/Navbar'
import { UserResponse } from './types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserAPIProvider } from './Contexts/UserAPIContext'


export const ThemeColorContext = createContext<{ toggleColorMode: () => void, mode: PaletteMode }>({
    toggleColorMode: () => { },
    mode: "dark"
})

function App() {
    const [mode, setMode] = useState<PaletteMode>("light")
    const toggleColorMode = useCallback(() => setMode(prevMode => (prevMode === "dark" ? "light" : "dark")), [mode])
    const theme = useMemo(() => createTheme({
        palette: {
            mode
        }
    }), [mode])
    const navigate = useNavigate()
    
    const onLogout = useCallback(() => {
        navigate("/auth/login", { replace: true })
    }, [])

    const onLogin = useCallback(() => {
        navigate("/home", { replace: true })
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <ThemeColorContext.Provider value={{ mode, toggleColorMode }}>
                <UserAPIProvider onLogin={onLogin} onLogout={onLogout}>
                    <CssBaseline />
                    <Navbar />
                    <Outlet />
                </UserAPIProvider>
            </ThemeColorContext.Provider>
        </ThemeProvider>
    )
}

export default App