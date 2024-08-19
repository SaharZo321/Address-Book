import { Password, PersonOff } from "@mui/icons-material"
import { useCallback, useEffect, useMemo, useState } from "react";
import OneFieldDialog, { OneFieldDialogProps } from "../../Components/OneFieldDialog";
import SettingsContent from "./CategoryItem";
import { useUserAPIContext } from "../../Contexts/UserAPIContext";
import { AxiosError } from "axios";
import { Typography } from "@mui/material";
import WarningDialog from "../../Components/WarningDialog";

export default function SecuritySettings() {

    const closeOneFieldDialog = useCallback(() => {
        setOneFieldDialogProps(prev => ({ ...prev, open: false }))
    }, [])

    const {
        verifyPassword: {
            mutateAsync: verifyPassword,
            isPending: isVerifyPasswordPending
        },
        changePassword: {
            mutateAsync: changePassword,
            isPending: isChangePasswordPending,
        },
        deactivateUser: {
            mutateAsync: deactivateUser,
            isPending: isDeactivateUserPending,
        }
    } = useUserAPIContext()

    const onVerifyPasswordError = useCallback((error: AxiosError, vars: { password: string }) => {
        if (error.response?.status === 400 || error.response?.status === 422) {
            setOneFieldDialogProps(prev => ({
                ...prev,
                error: value => value === vars.password,
                children: <Typography color="error" textAlign="center">Password is incorrect</Typography>,
                textFieldProps: {
                    onChange: () => {
                        setOneFieldDialogProps(prev => ({
                            ...prev,
                            error: value => false,
                            children: undefined,
                        }))
                    }
                }
            }))
        }
    }, [])

    const [oneFieldDialogProps, setOneFieldDialogProps] = useState<OneFieldDialogProps>({ open: false })
    const [warningDialogOpen, setWarningDialogOpen] = useState(false)

    const setVerifyItsYouDialog = useCallback((onSuccess: () => void, props?: OneFieldDialogProps) => {
        setOneFieldDialogProps({
            ...props,
            open: true,
            title: "Let's verify it's you...",
            error: value => !value,
            onOk: async password => {
                await verifyPassword({ password }, {
                    onSuccess,
                    onError: onVerifyPasswordError,
                })
            },
            onClose: closeOneFieldDialog,
            textFieldProps: {
                placeholder: "Current password",
                required: true,
                type: "password",
            },
        })
    }, [])

    const updateIsPending = useCallback((isPending?: boolean) => (
        useEffect(() => {
            setOneFieldDialogProps(prev => ({
                ...prev,
                isPending: isPending
            }))
        }, [isPending]
        )), [])

    updateIsPending(isVerifyPasswordPending)
    updateIsPending(isChangePasswordPending)

    const items: { text: string, onClick: () => void, icon: JSX.Element }[] = useMemo(() => [
        {
            text: "Change password",
            onClick: () => setVerifyItsYouDialog(() => {
                setOneFieldDialogProps({
                    open: true,
                    title: "Enter new password",
                    error: value => value.length < 6 || value.length > 16,
                    onClose: closeOneFieldDialog,
                    onOk: async password => {
                        await changePassword({ password }, {
                            onSuccess: closeOneFieldDialog
                        })
                    },
                    textFieldProps: {
                        placeholder: "New password",
                        required: true,
                        type: "password",
                    },
                    isPending: isChangePasswordPending,
                })
            }),
            icon: <Password />
        },
        {
            text: "Deactivate account",
            onClick: () => setVerifyItsYouDialog(() => {
                closeOneFieldDialog()
                setWarningDialogOpen(true)
            }, {
                open: true,
            }),
            icon: <PersonOff />
        },
    ], [])


    return (
        <>
            <SettingsContent
                options={items}
                summary="This is an example category summary to edit your account security."
            />
            <OneFieldDialog
                {...oneFieldDialogProps}
            />
            <WarningDialog
                open={warningDialogOpen}
                content="Are you sure you want to deactivate your account?"
                okButtonProps={{
                    children: "deactivate"
                }}
                handleClose={() => setWarningDialogOpen(false)}
                handleOk={async () => {
                    await deactivateUser({}, {
                        onSuccess: () => setWarningDialogOpen(false)
                    })
                }}
            />
        </>
    )
}