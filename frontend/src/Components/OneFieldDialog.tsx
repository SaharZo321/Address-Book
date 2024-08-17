import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { ChangeEventHandler, HTMLInputTypeAttribute, useCallback, useMemo, useState } from "react";

export default function OneFieldDialog(props: {
    open: boolean, handleClose: () => void,
    title: string,
    handleOk: (value: string) => void,
    fieldType?: HTMLInputTypeAttribute,
    fieldError?: (value: string) => boolean,
    fieldPlaceholder?: string,
    contentText?: string
}) {
    const [fieldState, setFieldState] = useState("")

    const onFieldChange: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        setFieldState(event.target.value)
    }, [])

    const handleOk = useCallback(() => {
        props.handleClose()
        props.handleOk(fieldState)
    }, [fieldState, props.handleOk, props.handleClose])

    const fieldError = useMemo(() => {
        return props.fieldError?.(fieldState)
    }, [props.fieldError, fieldState])

    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
        >
            <DialogTitle textAlign="center">{props.title}</DialogTitle>
            <DialogContent>
                {
                    props.contentText && 
                    <DialogContentText>
                        {props.contentText}
                    </DialogContentText>
                }
                <TextField
                    onChange={onFieldChange}
                    autoFocus
                    type={props.fieldType}
                    error={fieldError}
                    placeholder={props.fieldPlaceholder}
                />
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={props.handleClose}>
                    cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleOk}
                    disabled={fieldError}
                >
                    ok
                </Button>
            </DialogActions>
        </Dialog>
    )
}