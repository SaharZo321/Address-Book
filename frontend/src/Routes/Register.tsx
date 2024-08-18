import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, Step, StepLabel, Stepper, TextField, Typography, useTheme } from "@mui/material";
import { ChangeEventHandler, useCallback, useContext, useMemo, useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import { emailRegex } from "../constants";
import { AxiosError } from "axios";
import { useUserAPIContext } from "../Contexts/UserAPIContext";
import PendingButton from "../Components/PendingButton";


type RegisterCredentials = { email: string, password: string, confirmPassword: string, displayName: string }

const emptyCredentials: RegisterCredentials = { email: "", password: "", confirmPassword: "", displayName: "" }

export default function Register() {
    const { createUser: { mutateAsync: createUser, isPending } } = useUserAPIContext()
    const [{ email, password, displayName, confirmPassword }, setCredentials] = useState<RegisterCredentials>(emptyCredentials)
    const [passwordsUnmatched, setPasswordUnmatched] = useState(false)
    const [emailError, setEmailError] = useState(false)
    const onFormChange: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        setPasswordUnmatched(false)
        setEmailError(false)
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

    const isConfirmPasswordInvalid = useMemo(() => {
        const passLength = confirmPassword.length
        return passLength < 6 || passLength > 16
    }, [confirmPassword])

    const isEmailInvalid = useMemo(() => {
        return !email.match(emailRegex)
    }, [email])

    const isDisplayNameInvalid = useMemo(() => {
        return !displayName.match(/^[\w]{3,16}/)
    }, [displayName])

    const isFormInvalid = useMemo(() => {
        return isPasswordInvalid || isConfirmPasswordInvalid || isEmailInvalid
    }, [isConfirmPasswordInvalid, isEmailInvalid, isPasswordInvalid])

    const onSignUp = useCallback(async () => {
        if (password !== confirmPassword) {
            setPasswordUnmatched(true)
        } else {
            await createUser({ email, password, displayName }, {
                onSuccess: response => {
                    navigate("../login", { relative: "path" })
                },
                onError: error => {
                    if (error.response?.status === 409) {
                        setEmailError(true)
                    }
                }
            })
        }

    }, [email, password, displayName, confirmPassword])

    return (
        <Dialog
            open={true}
        >
            <DialogTitle align="center">
                Create an Account
            </DialogTitle>
            <DialogContent>
                <List>
                    {
                        emailError &&
                        <ListItem sx={{ justifyContent: "center" }}>
                            <Typography color="error">Email already registered</Typography>
                        </ListItem>
                    }
                    <ListItem>
                        <TextField
                            error={isDisplayNameInvalid}
                            value={displayName}
                            required
                            label="Display Name"
                            name="displayName"
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            error={isEmailInvalid || emailError}
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
                            error={isPasswordInvalid || passwordsUnmatched}
                            value={password}
                            type="password"
                            required
                            label="Password"
                            name="password"
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            error={isConfirmPasswordInvalid || passwordsUnmatched}
                            value={confirmPassword}
                            type="password"
                            required
                            label="Confirm password"
                            name="confirmPassword"
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem sx={{ justifyContent: "center" }}>
                        <Button size="small">
                            <Link
                                to="../login"
                                relative="path"
                                style={{ textDecoration: "none", color: "inherit" }}>
                                I already have an account
                            </Link>
                        </Button>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
                <PendingButton
                    variant="contained"
                    disabled={isFormInvalid}
                    onClick={onSignUp}
                    isPending={isPending}
                    progressProps={{
                        size: 24
                    }}
                >
                    sign up
                </PendingButton>
            </DialogActions>
        </Dialog>
    )
}