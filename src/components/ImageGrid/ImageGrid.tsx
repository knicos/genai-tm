import style from './style.module.css';
import Sample, { SampleState } from './Sample';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import UploadIcon from '@mui/icons-material/Upload';

interface Props {
    samples: SampleState[];
    disabled?: boolean;
    onDelete: (index: number) => void;
    showDrop?: boolean;
}

export default function ImageGrid({ samples, onDelete, disabled, showDrop }: Props) {
    const { t } = useTranslation();
    return (
        <div className={style.scroller}>
            <div className={samples.length === 0 && !showDrop ? style.sampleListEmpty : style.sampleList}>
                {showDrop && (
                    <div className={style.dropPlaceholder}>
                        <UploadIcon />
                    </div>
                )}
                {samples.map((s, ix) => (
                    <Sample
                        key={s.id}
                        image={s.data}
                        index={ix}
                        onDelete={onDelete}
                        status={s.state}
                        disabled={disabled}
                    />
                ))}
                {samples.length === 0 && !showDrop && (
                    <Alert
                        style={{ border: '1px solid #0288d1' }}
                        severity="info"
                    >
                        {t('collect.samplePrompt')}
                    </Alert>
                )}
            </div>
        </div>
    );
}
