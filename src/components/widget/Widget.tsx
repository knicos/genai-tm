import React, {useState, useRef, useEffect} from "react";
import style from "./widget.module.css";
import { IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import MTextField from "@mui/material/TextField";
import { styled } from '@mui/material/styles';

interface Props extends React.PropsWithChildren {
    title?: string;
    setTitle?: (title: string) => void;
    menu?: React.ReactNode;
    className?: string;
    focus?: boolean;
    disabled?: boolean;
}

const TextField = styled(MTextField)({
    "& input": {
        fontSize: "14pt",
        fontWeight: "bold",
    }
});

export function Widget({disabled, focus, title, setTitle, children, menu, className}: Props) {
    const ref = useRef<HTMLElement>(null);
    const [editing, setEditing] = useState(false);

    const classToUse = (disabled) ? style.widgetDisabled : style.widget;

    useEffect(() => {
        if (focus && ref.current?.scrollIntoView) {
            ref.current.scrollIntoView({
                block: 'center',
                inline: 'center',
                behavior: 'smooth',
            });
        }
    }, [focus]);

    return <section ref={ref} className={classToUse + ((className) ? ` ${className}` : "")}>
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
            {menu && <div className={style.widget_menu}>{menu}</div>}
        </header>}
        <div className={style.widget_content}>
        {children}
        </div>
    </section>
}
