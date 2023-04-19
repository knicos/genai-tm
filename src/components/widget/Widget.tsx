import React, { useRef, useEffect, useCallback } from 'react';
import style from './widget.module.css';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import MTextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';

interface Props extends React.PropsWithChildren {
    title?: string;
    setTitle?: (title: string) => void;
    menu?: React.ReactNode;
    className?: string;
    focus?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    dataWidget?: string;
    'aria-label'?: string;
}

const TextField = styled(MTextField)({
    '& input': {
        fontSize: '14pt',
        fontWeight: 'bold',
    },
});

export function Widget({
    disabled,
    focus,
    title,
    setTitle,
    children,
    menu,
    className,
    hidden,
    dataWidget,
    ...props
}: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const firstShow = useRef(true);
    const ref = useRef<HTMLElement>(null);
    const editRef = useRef<HTMLDivElement>(null);

    const classToUse = disabled ? style.widgetDisabled : style.widget;

    const doEndEdit = useCallback(() => {
        if (editRef.current) {
            const input = editRef.current.firstElementChild?.firstElementChild as HTMLInputElement;
            input.blur();
        }
    }, [editRef]);
    const doStartEdit = useCallback(() => {
        if (editRef.current) {
            const input = editRef.current.firstElementChild?.firstElementChild as HTMLInputElement;
            input.select();
        }
    }, [editRef]);
    const doChangeTitle = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (setTitle) setTitle(event.target.value);
        },
        [setTitle]
    );
    const doKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (editRef.current) {
                    const input = editRef.current.firstElementChild?.firstElementChild as HTMLInputElement;
                    input.blur();
                }
            }
        },
        [editRef]
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

    useEffect(() => {
        if (setTitle && editRef.current) {
            const input = editRef.current.firstElementChild?.firstElementChild as HTMLInputElement;
            input?.setAttribute('size', `${Math.max(5, input.value.length)}`);
        }
    }, [title, setTitle]);

    return (
        <section
            data-testid={`widget-${title}`}
            ref={ref}
            data-widget={dataWidget}
            style={{ display: hidden ? 'none' : 'initial' }}
            aria-hidden={!!hidden}
            className={classToUse + (className ? ` ${className}` : '')}
            aria-label={props['aria-label'] || title}
        >
            {title !== undefined && (
                <header className={style.widget_header}>
                    <h1 className={style.widget_title}>
                        {!setTitle && title}
                        {setTitle && (
                            <TextField
                                ref={editRef}
                                hiddenLabel
                                name={t<string>('widget.aria.editTitleInput', { value: title })}
                                placeholder={t<string>('widget.labels.titlePlaceholder')}
                                size="small"
                                variant="outlined"
                                onBlur={doEndEdit}
                                value={title}
                                onKeyDown={doKeyDown}
                                onChange={doChangeTitle}
                            />
                        )}
                    </h1>
                    {setTitle && (
                        <IconButton
                            aria-label={t<string>('widget.aria.editTitle')}
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
