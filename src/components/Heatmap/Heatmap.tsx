import { useEffect, useRef, useState } from 'react';
import { Widget } from '../widget/Widget';
import { useRecoilValue } from 'recoil';
import { modelState, modelTraining } from '@genaitm/state';
import { FormControlLabel, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import { useActiveNode } from '@genaitm/util/nodes';
import style from './style.module.css';

export default function Heatmap() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const model = useRecoilValue(modelState);
    const training = useRecoilValue(modelTraining);
    const [enabled, setEnabled] = useState(true);

    useActiveNode('widget-heatmap-in', enabled);

    useEffect(() => {
        if (canvasRef.current && model) {
            if (enabled) {
                model.explained = canvasRef.current;
            } else {
                model.explained = undefined;
            }
        }
    }, [model, enabled]);

    const canPredict = (model?.isTrained() || false) && !training;

    return (
        <Widget
            dataWidget="heatmap"
            title={t('heatmap.title')}
            menu={
                <div>
                    <FormControlLabel
                        labelPlacement="start"
                        control={
                            <Switch
                                checked={enabled}
                                onChange={(_, checked) => setEnabled(checked)}
                                data-testid="heatmap-switch"
                                aria-label={t('input.aria.switch')}
                                color="error"
                                disabled={!canPredict}
                            />
                        }
                        hidden
                        label={t(enabled ? 'input.labels.switchOn' : 'input.labels.switchOff')}
                    />
                </div>
            }
        >
            <div className={style.container}>
                <canvas
                    width={224}
                    height={224}
                    ref={canvasRef}
                    style={{ margin: '1rem', borderRadius: '6px', background: '#eee' }}
                />
            </div>
        </Widget>
    );
}