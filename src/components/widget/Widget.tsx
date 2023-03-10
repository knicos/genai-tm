import React, {useState} from "react";
import style from "./widget.module.css";
import { IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import MTextField from "@mui/material/TextField";
import { styled } from '@mui/material/styles';

interface Props extends React.PropsWithChildren {
    title?: string;
    setTitle?: (title: string) => void;
    menu?: React.ReactNode;
}

const TextField = styled(MTextField)({
    "& input": {
        fontSize: "14pt",
        fontWeight: "bold",
    }
});

export function Widget({title, setTitle, children}: Props) {
    const [editing, setEditing] = useState(false);

    return <section className={style.widget}>
        {title !== undefined && <header className={style.widget_header}>
            {!editing && <h1 className={style.widget_title}>
                {title}
            </h1>}
            {editing && setTitle && <TextField
                hiddenLabel
                id="title"
                size="small"
                variant="outlined"
                onBlur={() => setEditing(false)}
                value={title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setTitle(event.target.value);
                }}
            />}
            {setTitle && !editing && <IconButton aria-label="edit" size="small" onClick={() => setEditing(true)}>
                <EditIcon fontSize="small"/>
            </IconButton>}
        </header>}
        <div className={style.widget_content}>
        {children}
        </div>
    </section>
}
