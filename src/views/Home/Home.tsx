import { useTranslation } from 'react-i18next';
import style from './style.module.css';
import Model from './Model';
import { useState } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { LangSelect, Privacy } from '@genai-fi/base';
import gitInfo from '../../generatedGitInfo.json';
import { theme } from '@genai-fi/base';
import { ThemeProvider } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import SchoolIcon from '@mui/icons-material/School';
import LinkButton from './LinkButton';
import { LANGS } from '@genaitm/components/AppBar/AppBar';

export default function Home() {
    const { t } = useTranslation('image_adv');
    const [usb, setUsb] = useState(false);

    const hasSerial = 'serial' in navigator;

    return (
        <ThemeProvider theme={theme}>
            <main className={style.homeContainer}>
                <div className={style.lang}>
                    <LangSelect
                        languages={LANGS}
                        ns="image_adv"
                    />
                </div>
                <div className={style.header}>
                    <img
                        src="/logo192.png"
                        alt="GenAI logo"
                        width={192}
                        height={192}
                    />
                    <div className={style.headerColumn}>
                        <h1>{t('app.title')}</h1>
                        <h2>{t('app.subtitle')}</h2>
                        <div className={style.buttons}>
                            <LinkButton
                                href="https://gen-ai.fi/en/materials/classifier-unit"
                                startIcon={<SchoolIcon />}
                            >
                                {t('app.teachingMaterials')}
                            </LinkButton>
                            <LinkButton
                                href="https://github.com/knicos/genai-tm"
                                startIcon={<GitHubIcon />}
                            >
                                {t('app.github')}
                            </LinkButton>
                        </div>
                    </div>
                </div>
                <div className={style.selectGroup}>
                    <div className={style.intro}>{t('app.selectModel')}</div>
                    <div className={style.cards}>
                        <Model
                            id="image"
                            usb={usb}
                            image="/dog1.jpg"
                        />
                        <Model
                            id="pose"
                            usb={usb}
                            image="/pose3.jpg"
                        />
                    </div>
                    {hasSerial && (
                        <div className={style.options}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={usb}
                                        name="allowSerialUSB"
                                        onChange={(e) => setUsb(e.target.checked)}
                                    />
                                }
                                label={t('app.enableUSB')}
                            />
                        </div>
                    )}
                </div>
                <Privacy
                    position="bottomLeft"
                    appName="tm"
                    tag={gitInfo.gitTag || 'notag'}
                />
            </main>
        </ThemeProvider>
    );
}
