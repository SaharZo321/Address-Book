import { Password, PersonOff } from "@mui/icons-material"
import { useMemo } from "react";
import OneFieldDialog from "../../Components/OneFieldDialog";
import SettingsContent from "./CategoryItem";

export default function SecuritySettings() {


    const items: { text: string, onClick: () => void, icon: JSX.Element }[] = useMemo(() => [
        { text: "Change password", onClick: () => { }, icon: <Password /> },
        { text: "Deactivate account", onClick: () => { }, icon: <PersonOff /> },
    ], [])

    return (
        <>
            <SettingsContent 
                options={items}
                summary="This is an example category summary to edit your account security."
            />
            <OneFieldDialog
                open={false}
                handleClose={() => { }}
                handleOk={() => { }}
                title="Let's verify its you"
                fieldPlaceholder="Current password"
            />
        </>
    )
}