import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StageBar, type StageBarItemStatus } from '@genai-fi/base';
import { useVariant } from '@genaitm/util/variant';
import { PretrainedClasses } from './Classes/PretrainedClasses';
import { TransferLearningGraph } from './Connections/TransferLearningGraph';
import { TransferLearningBarChart } from './Connections/TransferLearningBarChart';
import { TransferLearningMatrix } from './Advanced/TransferLearningMatrix';
import style from './TransferLearningStages.module.css';

interface Stage {
    id: string;
    labelKey: string;
    content: ReactNode;
}

interface TransferLearningStagesProps {
    activeStage?: number;
    onStageChange?: (stage: number) => void;
}

export function TransferLearningStages({ activeStage, onStageChange }: TransferLearningStagesProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [internalActiveStage, setInternalActiveStage] = useState(0);

    const stages = useMemo<Stage[]>(
        () => [
            {
                id: 'classes',
                labelKey: 'charts.transferLearningStageClasses',
                content: <PretrainedClasses />,
            },
            {
                id: 'connections',
                labelKey: 'charts.transferLearningStageConnections',
                content: (
                    <>
                        <TransferLearningGraph />
                        <TransferLearningBarChart />
                    </>
                ),
            },
            {
                id: 'advanced',
                labelKey: 'charts.transferLearningStageAdvanced',
                content: <TransferLearningMatrix />,
            },
        ],
        []
    );

    const selectedStage = Math.min(Math.max(activeStage ?? internalActiveStage, 0), stages.length - 1);

    const setSelectedStage = useCallback(
        (stage: number) => {
            if (onStageChange) {
                onStageChange(stage);
                return;
            }
            setInternalActiveStage(stage);
        },
        [onStageChange]
    );

    const stageItems = stages.map((stage, index) => {
        const status: StageBarItemStatus =
            index < selectedStage ? 'complete' : index === selectedStage ? 'available' : 'upcoming';
        return {
            id: stage.id,
            label: t(stage.labelKey),
            status,
        };
    });

    return (
        <>
            <StageBar
                className={style.stageNav}
                ariaLabel={t('charts.transferLearningStages')}
                items={stageItems}
                activeId={stages[selectedStage].id}
                onChange={(id: string) => {
                    const index = stages.findIndex((stage) => stage.id === id);
                    if (index >= 0) {
                        setSelectedStage(index);
                    }
                }}
            />
            <div className={style.stageContent}>{stages[selectedStage].content}</div>
        </>
    );
}
