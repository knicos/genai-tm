import { Widget } from '../widget/Widget';
import PercentageBar, { Colours } from '../PercentageBar/PercentageBar';
import style from './Preview.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import Alert from '@mui/material/Alert';
import { useRecoilValue } from 'recoil';
import { fatalWebcam, prediction } from '../../state';
import { Button } from '../button/Button';
import ShareIcon from '@mui/icons-material/Share';
import { useActiveNode } from '@genaitm/util/nodes';

interface Props {
    onExport?: () => void;
}

const colourWheel: Colours[] = ['orange', 'purple', 'blue', 'green', 'red'];

export default function Preview({ onExport }: Props) {
    const { namespace, usep2p, allowModelSharing } = useVariant();
    const { t } = useTranslation(namespace);
    const preds = useRecoilValue(prediction);
    const fatal = useRecoilValue(fatalWebcam);

    const model = preds.length > 0;

    useActiveNode('widget-model-in', true);
    useActiveNode('widget-model-out', model);

    return (
        <Widget
            dataWidget="model"
            title={t<string>('model.labels.title')}
            className={style.widget}
            menu={
                onExport && usep2p && !fatal && allowModelSharing ? (
                    <Button
                        disabled={!model}
                        onClick={onExport}
                        variant="outlined"
                        startIcon={<ShareIcon />}
                    >
                        {t('model.actions.export')}
                    </Button>
                ) : null
            }
        >
            {model && (
                <div className={style.previewContainer}>
                    <table className={style.table}>
                        <tbody>
                            {preds.map((p, ix) => (
                                <tr
                                    key={ix}
                                    data-testid={`prediction-${ix}`}
                                >
                                    <td className={style.labelCell}>{p.className}</td>
                                    <td className={style.valueCell}>
                                        <PercentageBar
                                            colour={colourWheel[ix % colourWheel.length]}
                                            value={p.probability * 100}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!model && (
                <div className={style.buttonContainer}>
                    <Alert severity="info">{t('model.labels.mustTrain')}</Alert>
                </div>
            )}
        </Widget>
    );
}
