import { Box, Divider } from "@mui/material"
import { CatergoryLabel, CatergorySummary } from "./UserSettings";
import { Fragment } from "react";

export default function SettingsContent(props: {
    options: { text: string, onClick: () => void, icon: JSX.Element }[],
    summary: string,
}) {

    return (
        <Box sx={{
            overflow: "auto"
        }}>
            <CatergorySummary>
                {props.summary}
            </CatergorySummary>
            {props.options && <Divider style={{ margin: 0 }} />}
            {
                props.options.map(({ text, onClick, icon }, index) => (
                    <Fragment key={index}>
                        <CatergoryLabel
                            
                            text={text}
                            onClick={onClick}
                            icon={icon}
                        />
                        <Divider style={{ margin: 0 }} />
                    </Fragment>
                ))
            }
        </Box>
    )
}