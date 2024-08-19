import { AlertProps, Box, createTheme, CssBaseline, PaletteMode, ThemeProvider } from '@mui/material'
import { useState, useMemo, useCallback, useEffect, createContext, useContext } from 'react'

import { createBrowserRouter, Outlet, redirect, RouterProvider, useNavigate } from 'react-router-dom'
import Navbar from './Components/Navbar'
import { UserResponse } from './types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserAPIProvider } from './Contexts/UserAPIContext'
import StyledSnackbar, { StyledSnackbarProps } from './Components/StyledSnackbar'


export const ThemeColorContext = createContext<{ toggleColorMode: () => void, mode: PaletteMode }>({
    toggleColorMode: () => { },
    mode: "dark"
})

export type SnackBarContext = {
    openSnackbar: (props: StyledSnackbarProps) => void
    openErrorSnackbar: () => void
}

export const SnackBarContext = createContext<SnackBarContext>({
    openSnackbar: () => { },
    openErrorSnackbar: () => { },
})

function App() {
    const [mode, setMode] = useState<PaletteMode>("light")
    const [snackbarProps, setSnackbarProps] = useState<StyledSnackbarProps>({ open: false, severity: undefined, message: "" })
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

    const openSnackbar = useCallback((props: StyledSnackbarProps) => {
        setSnackbarProps({
            ...props,
        })
    }, [])

    const openErrorSnackbar = useCallback(() => {
        openSnackbar({
            open: true,
            severity: "error",
            message: "Oops... An error has occured"
        })
    }, [])

    const closeSnackbar = useCallback(() => {
        setSnackbarProps(prev => ({
            ...prev,
            open: false,
        }))
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <ThemeColorContext.Provider value={{ mode, toggleColorMode }}>
                <SnackBarContext.Provider value={{ openSnackbar, openErrorSnackbar }}>
                    <UserAPIProvider onLogin={onLogin} onLogout={onLogout}>
                        <CssBaseline />
                        <Navbar />
                        <Outlet />
                        <StyledSnackbar {...snackbarProps} handleClose={closeSnackbar} />
                    </UserAPIProvider>
                </SnackBarContext.Provider>
            </ThemeColorContext.Provider>
        </ThemeProvider>
    )
}

export default App