import { useTranslation } from 'react-i18next';
import { Apps, AppEntry, darkTheme } from '@genai-fi/base';
import { useVariant } from '@genaitm/util/variant';
import { PretrainedClasses } from './Classes/PretrainedClasses';
import { TransferLearningGraph } from './Connections/TransferLearningGraph';
import { TransferLearningBarChart } from './Connections/TransferLearningBarChart';
import { TransferLearningMatrix } from './Advanced/TransferLearningMatrix';
import style from './TransferLearningStages.module.css';
import { ThemeProvider } from '@mui/material';
import PolylineIcon from '@mui/icons-material/Polyline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DataExplorationIcon from '@mui/icons-material/DataExploration';

interface TransferLearningStagesProps {
    activeStage: string;
    onStageChange: (stage: string) => void;
}

export function TransferLearningStages({ activeStage, onStageChange }: TransferLearningStagesProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    const apps: AppEntry[] = [
        {
            id: 'classes',
            label: t('charts.transferLearningStageClasses'),
            icon: <LocalOfferIcon color="inherit" />,
        },
        {
            id: 'connections',
            label: t('charts.transferLearningStageConnections'),
            icon: <PolylineIcon color="inherit" />,
        },
        {
            id: 'advanced',
            label: t('charts.transferLearningStageAdvanced'),
            icon: <DataExplorationIcon color="inherit" />,
            disabled: true,
        },
    ];

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Apps
                    activeApp={activeStage}
                    apps={apps}
                    onSelect={(app: AppEntry) => {
                        onStageChange?.(app.id);
                    }}
                />
            </ThemeProvider>
            <div className={style.stageContent}>
                {activeStage === 'classes' && <PretrainedClasses />}
                {activeStage === 'connections' && (
                    <>
                        <TransferLearningGraph />
                        <TransferLearningBarChart />
                    </>
                )}
                {activeStage === 'advanced' && <TransferLearningMatrix />}
            </div>
        </>
    );
}
