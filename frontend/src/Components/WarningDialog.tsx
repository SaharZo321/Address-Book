import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import PendingButton from "./PendingButton";

export interface WarningDialogProps {
    open: boolean,
    title?: string,
    content: string,
    okButtonProps?: ButtonProps,
    handleOk?: () => void,
    handleClose?: () => void,
    isPending?: boolean
}

export default function WarningDialog({ open, title = "Warning", content, okButtonProps = { children: "ok" }, handleClose, handleOk, isPending }: WarningDialogProps) {
    return (
        <Dialog open={open}>
            <DialogTitle textAlign="center">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={handleClose}>
                    cancel
                </Button>
                <PendingButton
                    variant="contained"
                    onClick={handleOk}
                    isPending={isPending}
                    color="error"
                    progressProps={{
                        size: 24,
                    }}
                    {...okButtonProps}
                />
            </DialogActions>
        </Dialog>
    )
}