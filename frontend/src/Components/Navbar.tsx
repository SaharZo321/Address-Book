import { AppBar, Box, IconButton, ListItem, Menu, MenuItem, PaletteMode, Toolbar, Typography, useTheme } from "@mui/material";
import { AccountCircle, Brightness4, Brightness7, Menu as MenuIcon } from "@mui/icons-material"
import { MouseEvent, useContext, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ThemeColorContext } from "../App";
import { User } from "../types";
import { useUserAPIContext } from "../Contexts/UserAPIContext";

export default function Navbar() {
    const { toggleColorMode, mode } = useContext(ThemeColorContext)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const navigate = useNavigate()
    const handleMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const { logout: { mutateAsync: logout }, user } = useUserAPIContext()

    const handleClose = () => {
        setAnchorEl(null)
    }

    const theme = useTheme()

    return (
        <>
            <AppBar
                position='fixed'
                sx={{
                    zIndex: theme.zIndex.modal + 1
                }}
            >
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Address Book
                    </Typography>
                    <Box>
                        <IconButton color='inherit' onClick={toggleColorMode}>
                            {mode === "light" ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        <AccountMenu
                            anchorEl={anchorEl}
                            handleClose={handleClose}
                            menuItems={[
                                { action: "Logout", onClick: logout },
                                { action: "Settings", onClick: () => navigate("/settings") }
                            ]}
                            zIndex={theme.zIndex.modal + 1}
                            user={user}
                        />
                    </Box>
                </Toolbar>
            </AppBar>
        </>
    )
}

function AccountMenu(props: {
    handleClose: () => void,
    anchorEl: HTMLElement | null,
    menuItems: { action: string, onClick: () => void }[],
    zIndex?: number,
    user?: User | null
}) {
    return (
        <Menu
            id="menu-appbar"
            anchorEl={props.anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={Boolean(props.anchorEl)}
            onClose={props.handleClose}
            sx={{
                zIndex: props.zIndex
            }}
        >
            <Box sx={{
                minWidth: "150px"
            }}>

                <ListItem sx={{ justifyContent: "center" }}>
                    <AccountCircle fontSize='large' />
                </ListItem>
                <ListItem sx={{ mb: "12px" }}>
                    <Typography textAlign='center' width="100%">
                        {props.user ? props.user.displayName : "Guest"}
                    </Typography>
                </ListItem>
                {
                    props.menuItems.map(({ action, onClick }, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => {
                                onClick()
                                props.handleClose()
                            }}
                            disabled={!props.user}
                            sx={{ justifyContent: "center" }}
                        >
                            {action}
                        </MenuItem>
                    ))
                }
            </Box>
        </Menu>
    )
}