import { Alert, AlertProps, Slide, Snackbar, SnackbarCloseReason } from "@mui/material";
import _ from "lodash";
import { useCallback, useEffect } from "react";

export interface StyledSnackbarProps {
    message: string,
    severity: AlertProps["severity"]
    open: boolean,
    handleClose?: () => void,
    autoHideDuration?: number,
}

export default function StyledSnackbar({ message, severity, open, handleClose: onClose, autoHideDuration = 3000 }: StyledSnackbarProps) {

    const handleClose = useCallback((
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }
        onClose?.()
    } ,[])

    return (
        <Snackbar
            open={open}
            onClose={handleClose}
            autoHideDuration={autoHideDuration}
            TransitionComponent={Slide}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
            }}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    )
}