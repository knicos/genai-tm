import { useTranslation } from 'react-i18next';
import style from './style.module.css';

interface Props {
    duration: number;
}

export default function Clock({ duration }: Props) {
    const { t } = useTranslation();
    const totalSeconds = Math.floor(duration / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    let seconds = totalSeconds % 60;
    seconds += (duration % 1000) / 1000;

    return (
        <div
            className={style.timeRow}
            aria-live="off"
        >
            <div>
                <div className={style.time}>{`${minutes < 10 ? '0' : ''}${minutes}:`}</div>
                <div className={style.timeLabel}>{t('clock.minutes')}</div>
            </div>
            {hours === 0 ? (
                <div>
                    <div className={style.time}>{`${seconds < 10 ? '0' : ''}${seconds.toFixed(1)}`}</div>
                    <div className={style.timeLabel}>{t('clock.seconds')}</div>
                </div>
            ) : null}
        </div>
    );
}
