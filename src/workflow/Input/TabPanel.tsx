import React, { forwardRef } from 'react';
import style from './Input.module.css';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    enabled?: boolean;
}

const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>((props: TabPanelProps, ref) => {
    const { children, value, index, enabled, ...other } = props;

    return (
        <div
            className={enabled ? style.inputContainer : style.inputContainerDisable}
            role="tabpanel"
            style={{ display: value !== index ? 'none' : 'flex' }}
            id={`input-panel-${index}`}
            aria-labelledby={`input-tab-${index}`}
            {...other}
            ref={ref}
        >
            {value === index && children}
        </div>
    );
});

export default TabPanel;
