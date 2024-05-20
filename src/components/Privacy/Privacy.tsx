import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import gitInfo from '../../generatedGitInfo.json';

export default function Privacy() {
    const { t } = useTranslation();

    return (
        <section className={style.policy}>
            <div
                aria-hidden
                className={style.versionBox}
            >
                <a
                    href={`https://github.com/knicos/genai-tm/releases/tag/${gitInfo.gitTag}`}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="versionlink"
                >
                    <img
                        src="/github-mark-white.svg"
                        width={24}
                        height={24}
                        alt="Github source"
                    />
                </a>
            </div>
            <a
                href="/about"
                target="_blank"
            >
                {t('about.privacyTitle')}
            </a>
        </section>
    );
}
