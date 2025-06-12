import React, { useEffect, useState, useCallback, useRef } from 'react';
import Accordion from '@mui/material/Accordion';
import { activeNodes, classState, modelTraining } from '../../state';
import { Widget } from '../widget/Widget';
import style from './trainer.module.css';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import LinearProgress from '@mui/material/LinearProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import TrainingAnimation from '../TrainingAnimation/TrainingAnimation';
import { useModelTrainer } from '../../util/TeachableModel';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useActiveNode } from '@genaitm/util/nodes';
import { BusyButton } from '@genai-fi/base';

interface Props {
    onTrained?: () => void;
    focus?: boolean;
    disabled?: boolean;
    editing?: boolean;
}

const HelpTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip
        {...props}
        enterTouchDelay={300}
        classes={{ popper: className }}
    />
))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        maxWidth: 220,
        fontSize: '12pt',
        padding: '1.5rem',
    },
}));

export default function Trainer({ onTrained, editing, ...props }: Props) {
    const { namespace, advancedMenu, showTrainingAnimation } = useVariant();
    const { t } = useTranslation(namespace);
    const [training, setTraining] = useAtom(modelTraining);
    const [settingEpochs, setSettingEpochs] = useState(50);
    const [settingRate, setSettingRate] = useState(0.001);
    const [settingBatch, setSettingBatch] = useState(16);
    const promptTimer = useRef(-1);
    const [prompt, setPrompt] = useState(false);
    const { stage, epochs, clearTraining, train } = useModelTrainer();
    const data = useAtomValue(classState);
    const setActive = useSetAtom(activeNodes);

    const sampleMin = Math.min(...data.map((v) => v.samples.length));
    const isTrainable = data.length >= 2 && sampleMin >= 2;

    useActiveNode('widget-trainer-in', isTrainable);
    useActiveNode('widget-trainer-out', training);

    useEffect(() => {
        clearTraining();
    }, [data, clearTraining]);

    useEffect(() => {
        if (promptTimer.current >= 0) {
            clearTimeout(promptTimer.current);
            promptTimer.current = -1;
        }
        if (isTrainable && stage === 'none' && !editing) {
            promptTimer.current = window.setTimeout(() => {
                setPrompt(true);
            }, 4000);
        } else {
            setPrompt(false);
        }
    }, [stage, editing, isTrainable]);

    useEffect(() => {
        if (training) {
            train(data, { batchSize: settingBatch, epochs: settingEpochs, learningRate: settingRate }).then(() => {
                setTraining(false);
                if (onTrained) onTrained();
            });
        } else {
            setActive((old) => {
                const nset = new Set(old);
                nset.forEach((i) => {
                    if (i.startsWith('widget-class')) {
                        nset.delete(i);
                    }
                });
                return nset;
            });
        }
    }, [training]);

    const doStartTraining = useCallback(() => setTraining(true), [setTraining]);

    const changeEpochs = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setSettingEpochs(event.target.valueAsNumber);
        },
        [setSettingEpochs]
    );

    const changeLRate = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setSettingRate(event.target.valueAsNumber);
        },
        [setSettingRate]
    );

    const changeBatch = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setSettingBatch(event.target.valueAsNumber);
        },
        [setSettingBatch]
    );

    return (
        <Widget
            dataWidget="trainer"
            title={t('training.labels.title')}
            className={style.widget}
            {...props}
        >
            {showTrainingAnimation && <TrainingAnimation active={stage === 'training'} />}
            <div className={prompt ? style.buttonPrompt : style.buttonContainer}>
                <BusyButton
                    data-testid="train-button"
                    sx={{ flexGrow: 1 }}
                    variant="contained"
                    size="large"
                    disabled={training || !isTrainable}
                    onClick={doStartTraining}
                    busy={training}
                >
                    {t('training.actions.train')}
                </BusyButton>
            </div>

            {
                <div className={style.statusContainer}>
                    {stage === 'none' && isTrainable && (
                        <Alert
                            data-testid="alert-needstraining"
                            severity="warning"
                        >
                            <p>{t('training.labels.needsTraining')}</p>
                        </Alert>
                    )}
                    {stage === 'none' && !isTrainable && (
                        <Alert
                            data-testid="alert-addmore"
                            severity="info"
                        >
                            <p>{t('training.labels.addMore')}</p>
                        </Alert>
                    )}
                    {stage === 'loading' && (
                        <p>
                            <span>{t('training.labels.loading')}</span>
                            <LinearProgress />
                        </p>
                    )}
                    {stage === 'prepare' && (
                        <p>
                            <span>{t('training.labels.prepairing')}</span>
                            <LinearProgress />
                        </p>
                    )}
                    {stage === 'training' && (
                        <div className={style.trainingProgress}>
                            <span>{t('training.labels.training')}</span>
                            <LinearProgress
                                data-testid="training-progress"
                                value={epochs * 100}
                                variant="determinate"
                            />
                        </div>
                    )}
                    {stage === 'done' && (
                        <Alert
                            data-testid="alert-complete"
                            severity="success"
                        >
                            <p>{t('training.labels.complete')}</p>
                        </Alert>
                    )}
                </div>
            }

            {advancedMenu && (
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <span className={style.advancedTitle}>{t('training.labels.advanced')}</span>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className={style.formfield}>
                            <span>{t('training.labels.epochs')}:</span>
                            <TextField
                                sx={{ maxWidth: '6rem' }}
                                hiddenLabel
                                id="epochs"
                                variant="filled"
                                type="number"
                                size="small"
                                value={settingEpochs}
                                onChange={changeEpochs}
                            />
                            <HelpTooltip
                                title={t('training.tooltips.epochs')}
                                placement="left"
                            >
                                <HelpOutlineIcon
                                    sx={{ marginLeft: 'auto' }}
                                    color="info"
                                />
                            </HelpTooltip>
                        </div>
                        <div className={style.formfield}>
                            <span>{t('training.labels.learningRate')}:</span>
                            <TextField
                                sx={{ maxWidth: '6rem' }}
                                hiddenLabel
                                id="learningrate"
                                variant="filled"
                                type="number"
                                size="small"
                                value={settingRate}
                                onChange={changeLRate}
                            />
                            <HelpTooltip
                                title={t('training.tooltips.learningRate')}
                                placement="left"
                            >
                                <HelpOutlineIcon
                                    sx={{ marginLeft: 'auto' }}
                                    color="info"
                                />
                            </HelpTooltip>
                        </div>
                        <div className={style.formfield}>
                            <span>{t('training.labels.batchSize')}:</span>
                            <TextField
                                sx={{ maxWidth: '6rem' }}
                                hiddenLabel
                                id="batch"
                                variant="filled"
                                type="number"
                                size="small"
                                value={settingBatch}
                                onChange={changeBatch}
                            />
                            <HelpTooltip
                                title={t('training.tooltips.batchSize')}
                                placement="left"
                            >
                                <HelpOutlineIcon
                                    sx={{ marginLeft: 'auto' }}
                                    color="info"
                                />
                            </HelpTooltip>
                        </div>
                    </AccordionDetails>
                </Accordion>
            )}
        </Widget>
    );
}
