import { Button, ButtonProps, CircularProgress, CircularProgressProps } from "@mui/material";

interface PendingButtonProps extends ButtonProps {
    isPending?: boolean,
    progressProps?: CircularProgressProps
}

export default function PendingButton(
    { isPending, children, disabled, progressProps, ...props }: PendingButtonProps
) {
    return (
        <Button
            {...props}
            disabled={disabled || isPending}
        >
            {isPending ? <CircularProgress {...progressProps} /> : children}
        </Button>
    )
}