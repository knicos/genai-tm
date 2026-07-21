import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StageBar, type StageBarItemStatus } from '@genai-fi/base';
import { useVariant } from '@genaitm/util/variant';
import { PretrainedConcepts } from './PretrainedConcepts';
import { TransferLearningGraph } from './TransferLearningGraph';
import { TransferLearningBarChart } from './TransferLearningBarChart';
import { TransferLearningMatrix } from './TransferLearningMatrix';
import style from './TransferLearningStages.module.css';

interface Stage {
    id: string;
    labelKey: string;
    content: ReactNode;
}

export function TransferLearningStages() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [activeStage, setActiveStage] = useState(0);

    const stages = useMemo<Stage[]>(
        () => [
            {
                id: 'concepts',
                labelKey: 'charts.transferLearningStageConcepts',
                content: <PretrainedConcepts />,
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

    const stageItems = stages.map((stage, index) => {
        const status: StageBarItemStatus = index < activeStage ? 'complete' : index === activeStage ? 'available' : 'upcoming';
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
                activeId={stages[activeStage].id}
                onChange={(id: string) => {
                    const index = stages.findIndex((stage) => stage.id === id);
                    if (index >= 0) {
                        setActiveStage(index);
                    }
                }}
            />
            <div className={style.stageContent}>{stages[activeStage].content}</div>
        </>
    );
}
