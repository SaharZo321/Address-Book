import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle, ListItem, TextField, TextFieldProps } from "@mui/material";
import { ChangeEventHandler, HTMLInputTypeAttribute, useCallback, useEffect, useMemo, useState } from "react";
import PendingButton from "./PendingButton";

export interface OneFieldDialogProps extends DialogProps {
    title?: string,
    isPending?: boolean,
    textFieldProps?: TextFieldProps,
    onOk?: (value: string) => void,
    error?: (value: string) => boolean
    onClose?: () => void
    resetField?: boolean
}

export default function OneFieldDialog({
    isPending,
    resetField,
    onClose,
    textFieldProps,
    onOk,
    error,
    children,
    ...props
}: OneFieldDialogProps) {
    const [fieldState, setFieldState] = useState("")

    const { autoFocus, onChange, error: textFieldError, ...fieldProps } = textFieldProps || {}

    const handleOk = useCallback(() => {
        setFieldState("")
        onOk?.(fieldState)
    }, [fieldState, onOk])

    const handleClose = useCallback(() => {
        onClose?.()
        setFieldState("")
    }, [onClose])

    useEffect(() => {
        if (resetField) {
            console.log("hello")
            setFieldState("")
        }
    }, [resetField])

    const fieldError = useMemo(() => error?.(fieldState), [fieldState, error])

    return (
        <Dialog
            {...props}
            onClose={handleClose}
        >
            <DialogTitle textAlign="center" visibility={props.title ? "visible" : "hidden"}>{props.title}</DialogTitle>
            <DialogContent>
                <ListItem>
                    <TextField
                        {...fieldProps}
                        onChange={(event) => {
                            setFieldState(event.target.value)
                            onChange?.(event)
                        }}
                        value={fieldState}
                        autoFocus={autoFocus !== undefined ? autoFocus : true}
                        error={fieldError}
                    />
                </ListItem>
                {children}
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={handleClose}>
                    cancel
                </Button>
                <PendingButton
                    variant="contained"
                    onClick={handleOk}
                    disabled={fieldError}
                    isPending={isPending}
                    progressProps={{
                        size: 24,
                    }}
                >
                    ok
                </PendingButton>
            </DialogActions>
        </Dialog>
    )
}