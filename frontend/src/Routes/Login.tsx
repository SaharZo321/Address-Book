import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, TextField, Typography, useTheme } from "@mui/material";
import { ChangeEventHandler, useCallback, useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { emailRegex } from "../constants";
import { useUserAPIContext } from "../Contexts/UserAPIContext";
import PendingButton from "../Components/PendingButton";

type LoginCredentials = { email: string, password: string }

const emptyCredentials: LoginCredentials = { email: "", password: "" }

export default function Login() {
    const { login: { mutateAsync: login, isPending } } = useUserAPIContext()
    const [{ email, password }, setCredentials] = useState<LoginCredentials>(emptyCredentials)
    const [formError, setFormError] = useState<{ errorType: "inactive" | "credentials", errorDetail: string }>()
    const onFormChange: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        setFormError(undefined)
        setCredentials(prev => ({
            ...prev,
            [event.target.name]: event.target.value
        }))
    }, [])

    const navigate = useNavigate()

    const isPasswordInvalid = useMemo(() => {
        const passLength = password.length
        return passLength < 6 || passLength > 16
    }, [password])

    const isEmailInvalid = useMemo(() => {
        return !email.match(emailRegex)
    }, [email])


    const isFormInvalid = useMemo(() => {
        return isPasswordInvalid || isEmailInvalid
    }, [isEmailInvalid, isPasswordInvalid])

    const onLogin = useCallback(async () => {
        await login({ email, password }, {
            onSuccess: () => navigate("/home"),
            onError: (error) => {
                const { detail } = error.response?.data
                if (error.response?.status === 401) {
                    setFormError({ errorType: "credentials", errorDetail: detail })
                } else if (error.response?.status === 403) {
                    setFormError({ errorType: "inactive", errorDetail: detail })
                }
            }
        })
    }, [email, password])

    const onActivate = useCallback(async () => {
        // const response = await userAPIContext.activateUser({ email, password })
        // if (response.ok) {
        //     await onLogin()
        // } else if (response.status === 401) {
        //     const { detail }: { detail: string } = await response.json()
        //     setFormError({ errorType: "credentials", errorDetail: detail })
        // }
    }, [email, password])


    return (
        <Dialog
            open={true}
        >
            <DialogTitle align="center">
                Login
            </DialogTitle>
            <DialogContent>
                <List>
                    {
                        formError &&
                        <ListItem sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
                            <Typography color="error">{formError.errorDetail}</Typography>
                            {
                                formError.errorType === "inactive" &&
                                <Button onClick={onActivate}>Click to Activate</Button>
                            }
                        </ListItem>
                    }
                    <ListItem>
                        <TextField
                            error={isEmailInvalid || Boolean(formError)}
                            value={email}
                            type="email"
                            required
                            label="Email"
                            name="email"
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            error={isPasswordInvalid || Boolean(formError)}
                            value={password}
                            type="password"
                            required
                            label="Password"
                            name="password"
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem sx={{ justifyContent: "center" }}>
                        <Button size="small">
                            <Link
                                to="../register"
                                relative="path"
                                style={{ textDecoration: "none", color: "inherit" }}>
                                I dont have an account
                            </Link>
                        </Button>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
                <PendingButton
                    variant="contained"
                    disabled={isFormInvalid}
                    onClick={onLogin}
                    isPending={isPending}
                    progressProps={{
                        size: 24
                    }}
                >
                    Login
                </PendingButton>
            </DialogActions>
        </Dialog>
    )
}