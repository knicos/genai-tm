import React, { useState, useRef, useEffect, useCallback } from 'react';
import style from './widget.module.css';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MTextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

interface Props extends React.PropsWithChildren {
    title?: string;
    setTitle?: (title: string) => void;
    menu?: React.ReactNode;
    className?: string;
    focus?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    dataWidget?: string;
}

const TextField = styled(MTextField)({
    '& input': {
        fontSize: '14pt',
        fontWeight: 'bold',
    },
});

export function Widget({ disabled, focus, title, setTitle, children, menu, className, hidden, dataWidget }: Props) {
    const firstShow = useRef(true);
    const ref = useRef<HTMLElement>(null);

    const [editing, setEditing] = useState(false);

    const classToUse = disabled ? style.widgetDisabled : style.widget;

    const doEndEdit = useCallback(() => setEditing(false), [setEditing]);
    const doStartEdit = useCallback(() => setEditing(true), [setEditing]);
    const doChangeTitle = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (setTitle) setTitle(event.target.value);
        },
        [setTitle]
    );

    useEffect(() => {
        if (focus && ref.current?.scrollIntoView) {
            ref.current.scrollIntoView({
                block: 'center',
                inline: 'center',
                behavior: firstShow.current ? 'auto' : 'smooth',
            });
        }
        firstShow.current = false;
    }, [focus]);

    return (
        <section
            data-testid={`widget-${title}`}
            ref={ref}
            data-widget={dataWidget}
            style={{ display: hidden ? 'none' : 'inherit' }}
            className={classToUse + (className ? ` ${className}` : '')}
        >
            {title !== undefined && (
                <header className={style.widget_header}>
                    {!editing && <h1 className={style.widget_title}>{title}</h1>}
                    {editing && setTitle && (
                        <TextField
                            hiddenLabel
                            id="title"
                            size="small"
                            variant="outlined"
                            onBlur={doEndEdit}
                            value={title}
                            onChange={doChangeTitle}
                        />
                    )}
                    {setTitle && !editing && (
                        <IconButton
                            aria-label="edit"
                            size="small"
                            onClick={doStartEdit}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                    {menu && <div className={style.widget_menu}>{menu}</div>}
                </header>
            )}
            <div className={style.widget_content}>{children}</div>
        </section>
    );
}
