import style from './Preview.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import Alert from '@mui/material/Alert';
import { useAtomValue } from 'jotai';
import { prediction, predictionError } from '../../state';
import { useActiveNode } from '@genaitm/util/nodes';
import PreviewMenu from './PreviewMenu';
import { PercentageBar, Widget } from '@genai-fi/base';
import { Colours } from '@genai-fi/base/main/components/PercentageBar/PercentageBar';

interface Props {
    onExport?: () => void;
    onClone?: () => void;
}

const colourWheel: Colours[] = ['orange', 'purple', 'blue', 'green', 'red'];

export default function Preview({ onExport, onClone }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const preds = useAtomValue(prediction);
    const hasError = useAtomValue(predictionError);

    const model = preds.length > 0;

    useActiveNode('widget-model-in', true);
    useActiveNode('widget-model-out', model);

    return (
        <Widget
            noPadding
            dataWidget="model"
            title={t('model.labels.title')}
            className={style.widget}
            menu={
                <PreviewMenu
                    disabled={!model}
                    onExport={onExport}
                    onClone={onClone}
                />
            }
        >
            {model && !hasError && (
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
            {model && hasError && (
                <div className={style.buttonContainer}>
                    <Alert severity="error">{t('model.labels.failedTensorflow')}</Alert>
                </div>
            )}
        </Widget>
    );
}
