import { Badge } from "@mui/icons-material"
import { useCallback, useContext, useMemo, useState } from "react";
import SettingsContent from "./CategoryItem";
import OneFieldDialog from "../../Components/OneFieldDialog";
import { displayNameRegex } from "../../constants";
import { UserAPIContext } from "../../Contexts/UserAPIContext";

export default function CosmeticsSettings() {

    const [openDialog, setOpenDialog] = useState<"displayName">()

    const items: { text: string, onClick: () => void, icon: JSX.Element }[] = useMemo(() => [
        { text: "Change display name", onClick: () => setOpenDialog("displayName"), icon: <Badge /> },
    ], [])

    const { user, changeDisplayName: changeDisplayNameContext } = useContext(UserAPIContext)

    const closeDialog = useCallback(() => {
        setOpenDialog(undefined)
    }, [])

    const changeDisplayName = useCallback(async (name: string) => {
        await changeDisplayNameContext({ displayName: name })
    }, [])

    return (
        <>
            <SettingsContent
                options={items}
                summary="This is an example category summary to edit your account cosmetics."
            />
            <OneFieldDialog
                handleClose={closeDialog}
                open={openDialog === "displayName"}
                title="New Display Name"
                fieldError={(value) => !value.match(displayNameRegex)}
                fieldPlaceholder={user?.displayName}
                handleOk={changeDisplayName}
            />
        </>
    )
}