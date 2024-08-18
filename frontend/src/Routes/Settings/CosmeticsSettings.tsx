import { Badge } from "@mui/icons-material"
import { useCallback, useContext, useMemo, useState } from "react";
import SettingsContent from "./CategoryItem";
import OneFieldDialog, { OneFieldDialogProps } from "../../Components/OneFieldDialog";
import { displayNameRegex } from "../../constants";
import { useUserAPIContext } from "../../Contexts/UserAPIContext";

export default function CosmeticsSettings() {

    const [dialogProps, setDialogProps] = useState<OneFieldDialogProps>({ open: false })

    const closeDialog = useCallback(() => {
        setDialogProps({ open: false })
    }, [])

    const {
        user,
        changeDisplayName: {
            mutateAsync: changeDisplayName,
            isPending: isChangeDisplayNamePending
        }
    } = useUserAPIContext()

    const items: { text: string, onClick: () => void, icon: JSX.Element }[] = useMemo(() => [
        {
            text: "Change display name",
            onClick: () => setDialogProps({
                onClose: closeDialog,
                open: true,
                title: "New Display Name",
                error: (value) => !value.match(displayNameRegex),
                textFieldProps: {
                    placeholder: user?.displayName
                },
                onOk: handleChangeDisplayName,
                isPending: isChangeDisplayNamePending,
            }),
            icon: <Badge />
        },
    ], [isChangeDisplayNamePending])


    const handleChangeDisplayName = useCallback(async (name: string) => {
        await changeDisplayName({ displayName: name }, {
            onSuccess: () => {
                closeDialog()
            }
        })
    }, [changeDisplayName])

    return (
        <>
            <SettingsContent
                options={items}
                summary="This is an example category summary to edit your account cosmetics."
            />
            <OneFieldDialog
                {...dialogProps}
            />
        </>
    )
}