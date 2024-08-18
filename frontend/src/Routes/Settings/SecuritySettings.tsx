import { Password, PersonOff } from "@mui/icons-material"
import { useCallback, useMemo, useState } from "react";
import OneFieldDialog, { OneFieldDialogProps } from "../../Components/OneFieldDialog";
import SettingsContent from "./CategoryItem";
import { useUserAPIContext } from "../../Contexts/UserAPIContext";
import { AxiosError } from "axios";
import { Typography } from "@mui/material";

export default function SecuritySettings() {

    const closeDialog = useCallback(() => {
        setDialogProps({ open: false })
    }, [])

    const {
        user,
        verifyPassword: {
            mutateAsync: verifyPassword,
            isPending: isVerifyPasswordPending
        },
        changePassword: {
            mutateAsync: changePassword,
            isPending: isChangePasswordPending,
        }
    } = useUserAPIContext()

    const onVerifyPasswordError = useCallback((error: AxiosError, vars: { password: string }) => {
        if (error.response?.status === 400 || error.response?.status === 422) {
            setDialogProps(prev => ({
                ...prev,
                error: value => value === vars.password,
                children: <Typography color="error" textAlign="center">Password is incorrect</Typography>,
                textFieldProps: {
                    onChange: () => {
                        setDialogProps(prev => ({
                            ...prev,
                            error: value => false,
                            children: undefined,
                        }))
                    }
                }
            }))
        }
    }, [])

    const [dialogProps, setDialogProps] = useState<OneFieldDialogProps>({ open: false })

    const setVerifyItsYouDialog = useCallback((onSuccess: () => void) => {
        setDialogProps({
            open: true,
            title: "Let's verify it's you...",
            error: value => !value,
            onOk: async password => {
                await verifyPassword({ password }, {
                    onSuccess,
                    onError: onVerifyPasswordError,
                })
            },
            onClose: closeDialog,
            textFieldProps: {
                label: "Password",
                required: true,
                type: "password",
            },
            isPending: isVerifyPasswordPending,
        })
    }, [isVerifyPasswordPending])

    const items: { text: string, onClick: () => void, icon: JSX.Element }[] = useMemo(() => [
        {
            text: "Change password",
            onClick: () => {
                setVerifyItsYouDialog(() => {
                    setDialogProps(prev => ({
                        ...prev,
                        title: "Enter new password",
                        error: value => value.length < 6 || value.length > 16,
                        onOk: async password => {
                            await changePassword({ password }, {
                                onSuccess: closeDialog
                            })
                        },
                    }))
                })
            },
            icon: <Password />
        },
        {
            text: "Deactivate account",
            onClick: () => { },
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
                {...dialogProps}
            />
        </>
    )
}