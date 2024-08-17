import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, MenuItem, Typography } from "@mui/material";
import { PropsWithChildren, useCallback, useContext } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import _ from "lodash";
import { ChevronRight } from "@mui/icons-material";
import { UserAPIContext } from "../../Contexts/UserAPIContext";

export default function UserSettings() {
    const { logout } = useContext(UserAPIContext)


    return (
        <Dialog
            open={true}
            fullWidth
        >
            <DialogTitle align="center">
                Account Settings
            </DialogTitle>
            <DialogContent>
                <Box display="flex" gap="12px" height="250px">
                    <SettingsCategories
                        categories={["Cosmetics", "Security"]}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Outlet />

                </Box>
            </DialogContent>
            <DialogActions sx={{ margin: "16px", justifyContent: "space-between" }}>
                <Button>
                    <Link to="/home" style={{ textDecoration: "None", color: "inherit", }}>Close</Link>
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => logout()}
                >
                    Logout
                </Button>
            </DialogActions>
        </Dialog>
    )
}

function SettingsCategories(props: {
    categories: string[],
}) {
    return (
        <List>
            {
                props.categories.map((name, index) => (
                    <MenuItem
                        key={index}
                        sx={{ padding: 0 }}
                    >
                        <NavLink
                            to={_.snakeCase(name)}
                            style={({ isActive }) => ({
                                fontWeight: isActive ? "bold" : undefined,
                                textDecoration: "none",
                                color: "inherit",
                                display: "inline-block",
                                padding: "6px 16px",
                                width: "100%"
                            })}
                        >
                            {name}
                        </NavLink>
                    </MenuItem>
                ))
            }
        </List>
    )
}

export function CatergorySummary(props: PropsWithChildren) {
    return (
        <ListItem>
            <Typography>
                {props.children}
            </Typography>
        </ListItem>
    )
}


export function CatergoryLabel(props: { icon: JSX.Element, text: string, onClick: () => void }) {
    return (
        <MenuItem
            sx={{
                alignItems: "center",
                display: "flex",
                width: "100%",
                gap: "16px",
                paddingRight: 0,
                height: "48px"
            }}
            onClick={props.onClick}
        >
            {props.icon}
            <Typography>
                {props.text}
            </Typography>
            <ChevronRight sx={{ ml: "auto" }} />
        </MenuItem>
    )
}