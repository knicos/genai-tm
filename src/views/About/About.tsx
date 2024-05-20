import { useCallback } from 'react';
import style from './style.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/button/Button';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';

export default function About() {
    const { key } = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const doReturn = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <div className={style.container}>
            <main>
                <header>
                    <img
                        src="/logo192_bw.png"
                        alt="logo"
                        width={128}
                        height={128}
                    />
                    <h1>{t('about.title')}</h1>
                </header>
                <p>
                    The GenAI Image Classifier was funded by the{' '}
                    <a href="https://www.aka.fi/en/strategic-research/">Strategic Research Council</a> in Finland as a
                    part of the <a href="https://generation-ai-stn.fi">Generation AI project</a>, grants #352859,
                    #352876, #352971, #353627, #353551, #352871, #352870, #353273, #353078. The application was
                    developed by Dr. Nicolas Pope, as a researcher at the University of Eastern Finland. If you have any
                    enquiries regarding the tool you can send them to nicolas.pope@uef.fi.
                </p>

                <p>Copyright &copy; 2023 Nicolas Pope.</p>

                <h2>{t('about.privacyTitle')}</h2>
                <Markdown>{(t('about.privacy', { returnObjects: true }) as string[]).join('\n\n')}</Markdown>

                {key !== 'default' && (
                    <p>
                        <Button
                            sx={{ fontSize: '14pt' }}
                            onClick={doReturn}
                            variant="contained"
                        >
                            {t('about.back')}
                        </Button>
                    </p>
                )}
            </main>
        </div>
    );
}
