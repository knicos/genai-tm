import { useState, useEffect, useCallback, useRef } from 'react';
import { Classification } from '../ClassEntry/Classification';
import SamplePreviewModal from '../ClassEntry/SamplePreviewModal';
import { Button } from '../../components/button/Button';
import { IClassification } from '../../state';
import style from './trainingdata.module.css';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import { AudioExample } from '@genai-fi/classifier';

interface Props {
    active?: boolean;
    data: IClassification[];
    setData: (data: ((old: IClassification[]) => IClassification[]) | IClassification[]) => void;
    disabled?: boolean;
    onFocused: (f: boolean) => void;
}

export function TrainingData({ active, data, setData, disabled, onFocused }: Props) {
    const { namespace, disableAddClass, modelVariant } = useVariant();
    const { t } = useTranslation(namespace);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [modalState, setModalState] = useState<{ classIndex: number; imageIndex: number } | null>(null);
    const sectionRef = useRef<HTMLElement>(null);

    const isAudio = modelVariant === 'speech';

    if (isAudio && data.length > 0) {
        data[0].label = t('trainingdata.labels.noiseClass');
    }

    useEffect(() => {
        if (disabled) {
            setActiveIndex(-1);
        } else {
            const h = (e: MouseEvent) => {
                if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
                    setActiveIndex(-1);
                }
            };
            window.addEventListener('mouseup', h);
            return () => {
                window.removeEventListener('mouseup', h);
            };
        }
    }, [disabled]);

    const setDataIx = useCallback(
        (samples: (old: IClassification) => IClassification, ix: number) => {
            setData((data) => {
                const newdata = [...data];
                newdata[ix] = samples(data[ix]);
                return newdata;
            });
        },
        [setData]
    );

    const doActivate = (ix: number) => active && setActiveIndex(ix);

    const doDelete = (ix: number) => setData(data.filter((_, index) => index !== ix));

    const doSetActive = useCallback((a: boolean, ix: number) => setActiveIndex(a ? ix : -1), []);

    const doDeactivate = () => {
        onFocused(false);
    };

    const addClass = () => {
        setData([...data, { label: `${t('trainingdata.labels.class')} ${data.length + 1}`, samples: [] }]);
    };

    const doFocus = () => {
        onFocused(true);
    };

    const handleSampleClick = (classIndex: number, imageIndex: number) => {
        setModalState({ classIndex, imageIndex });
    };

    const handleModalClose = () => {
        setModalState(null);
    };

    const handleModalNext = () => {
        if (modalState && data[modalState.classIndex]) {
            const maxIndex = data[modalState.classIndex].samples.length - 1;
            if (modalState.imageIndex < maxIndex) {
                setModalState({ ...modalState, imageIndex: modalState.imageIndex + 1 });
            }
        }
    };

    const handleModalPrevious = () => {
        if (modalState && modalState.imageIndex > 0) {
            setModalState({ ...modalState, imageIndex: modalState.imageIndex - 1 });
        }
    };

    const handleClassChange = (toClassIndex: number) => {
        if (data[toClassIndex]) {
            setModalState({ classIndex: toClassIndex, imageIndex: 0 });
        }
    };

    const handleModalDelete = () => {
        if (modalState) {
            const { classIndex, imageIndex } = modalState;
            setData((oldData) => {
                const newData = [...oldData];
                newData[classIndex] = {
                    ...newData[classIndex],
                    samples: newData[classIndex].samples.filter((_, idx) => idx !== imageIndex),
                };
                return newData;
            });

            // Adjust modal state after delete
            const remainingCount = data[classIndex].samples.length - 1;
            if (remainingCount > 0) {
                if (imageIndex >= remainingCount) {
                    setModalState({ classIndex, imageIndex: remainingCount - 1 });
                }
                // else keep the same index
            } else {
                setModalState(null);
            }
        }
    };

    const handleMoveToClass = (toClassIndex: number) => {
        if (modalState && toClassIndex !== modalState.classIndex) {
            const { classIndex: fromClassIndex, imageIndex } = modalState;

            setData((oldData) => {
                const newData = [...oldData];
                const sampleToMove = oldData[fromClassIndex].samples[imageIndex];

                // Remove from source class
                newData[fromClassIndex] = {
                    ...newData[fromClassIndex],
                    samples: newData[fromClassIndex].samples.filter((_, idx) => idx !== imageIndex),
                };
                // Add to target class
                newData[toClassIndex] = {
                    ...newData[toClassIndex],
                    samples: [...newData[toClassIndex].samples, sampleToMove],
                };

                // Update modal state synchronously within the same update
                const newImageIndex = newData[toClassIndex].samples.length - 1;
                setModalState({
                    classIndex: toClassIndex,
                    imageIndex: newImageIndex,
                });

                return newData;
            });
        }
    };

    const allClassNames = data.map((c) => c.label);

    const currentSample =
        modalState && data[modalState.classIndex]?.samples[modalState.imageIndex]
            ? data[modalState.classIndex].samples[modalState.imageIndex]
            : null;

    return (
        <section
            tabIndex={-1}
            data-widget="container"
            className={disabled ? style.containerDisabled : style.trainingcontainer}
            onBlur={doDeactivate}
            onFocus={doFocus}
            aria-labelledby="training-data-header"
            ref={sectionRef}
        >
            <h1 id="training-data-header">{t('trainingdata.labels.title')}</h1>
            {data.map((c, ix) => (
                <Classification
                    onDelete={doDelete}
                    key={ix}
                    index={ix}
                    name={c.label}
                    active={ix === activeIndex}
                    data={data[ix]}
                    setData={setDataIx}
                    onActivate={doActivate}
                    setActive={doSetActive}
                    onSampleClick={handleSampleClick}
                />
            ))}
            {!disableAddClass && (
                <Button
                    data-testid="addClass"
                    size="large"
                    variant="outlined"
                    startIcon={<AddBoxIcon />}
                    onClick={addClass}
                >
                    {t('trainingdata.actions.addClass')}
                </Button>
            )}

            {!!modalState && !!data[modalState.classIndex] && (
                <SamplePreviewModal
                    open={true}
                    onClose={handleModalClose}
                    imageUrl={
                        currentSample && modalState
                            ? !isAudio
                                ? (currentSample.data as HTMLCanvasElement).toDataURL()
                                : (currentSample.data as AudioExample).spectrogramCanvas?.toDataURL()
                            : undefined
                    }
                    audio={currentSample && isAudio ? (currentSample.data as AudioExample) : undefined}
                    currentIndex={modalState?.imageIndex ?? 0}
                    totalCount={data[modalState?.classIndex ?? 0]?.samples.length ?? 0}
                    classNames={allClassNames}
                    currentClassIndex={modalState?.classIndex ?? 0}
                    onPrevious={handleModalPrevious}
                    onNext={handleModalNext}
                    onClassChange={handleClassChange}
                    onMoveToClass={handleMoveToClass}
                    onDelete={handleModalDelete}
                />
            )}
        </section>
    );
}
