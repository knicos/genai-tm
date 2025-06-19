import { IVariantContext, useVariant } from '@genaitm/util/variant';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';
import { FormEvent, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { VariantConfiguration, VARIANTS } from '../ImageGeneral/ImageGeneral';
import style from './style.module.css';
import _settings from '../ImageGeneral/configuration.json';
import { LANGS } from '@genaitm/components/AppBar/AppBar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const DEFAULTS = _settings as VariantConfiguration;

interface Props {
    state: IVariantContext;
    setState: (f: (state: IVariantContext) => IVariantContext) => void;
}

export default function SettingsForm({ state, setState }: Props) {
    const variant = useVariant();
    const { i18n, t } = useTranslation();
    //const [state, setState] = useState<IVariantContext>(DEFAULTS.base);
    const template: VARIANTS = 'general';

    useEffect(() => {
        setState((old) => ({
            ...DEFAULTS.base,
            ...DEFAULTS[old.modelVariant],
            ...DEFAULTS[template],
        }));
    }, [template]);

    useEffect(() => {
        setState((old) => ({ ...old, ...variant }));
    }, [variant]);

    const doCheckChange = useCallback(
        (event: FormEvent<HTMLInputElement>) => {
            const target = event.currentTarget || event.target;
            setState((old) => ({ ...old, [target.name]: target.checked }));
        },
        [setState]
    );

    const doSelectChange = useCallback(
        (event: SelectChangeEvent) => {
            setState((old) => ({ ...old, [event.target.name]: event.target.value }));
        },
        [setState]
    );

    /*const doCancel = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const doReset = useCallback(() => {
        setState(DEFAULTS.base);
    }, [setState]);*/

    const doLanguageChange = useCallback(
        (event: SelectChangeEvent) => {
            i18n.changeLanguage(event?.target.value);
        },
        [i18n]
    );

    return (
        <div className={style.container}>
            <form>
                <FormControl fullWidth>
                    <InputLabel id="language-select">{t('settings.labels.language')}</InputLabel>
                    <Select
                        labelId="language-select"
                        onChange={doLanguageChange}
                        value={i18n.language}
                        label={t('settings.labels.language')}
                        name="namespace"
                    >
                        {LANGS.map((lng, ix) => (
                            <MenuItem
                                key={ix}
                                value={lng.name}
                            >
                                {lng.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="model-select">{t('settings.labels.model')}</InputLabel>
                    <Select
                        labelId="model-select"
                        onChange={doSelectChange}
                        value={state.modelVariant}
                        label={t('settings.labels.model')}
                        name="modelVariant"
                    >
                        <MenuItem value="image">{t('settings.values.models.0')}</MenuItem>
                        <MenuItem value="pose">{t('settings.values.models.1')}</MenuItem>
                    </Select>
                </FormControl>
                <Accordion
                    disableGutters
                    sx={{ boxShadow: 'unset' }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <span className={style.advancedTitle}>{t('settings.labels.advanced')}</span>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className={style.section}>
                            <div className={style.settingsTitle}>Interface</div>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.disableSaveSamples}
                                        name="disableSaveSamples"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Disable sample saving option"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.showSettings}
                                        name="showSettings"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Show settings"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.showSaveReminder}
                                        name="showSaveReminder"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Show Save Reminder"
                            />
                        </div>
                        <div className={style.section}>
                            <div className={style.settingsTitle}>Workflow</div>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.advancedMenu}
                                        name="advancedMenu"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Show Advanced Training Menu"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.sampleUploadFile}
                                        name="sampleUploadFile"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Enable file upload for samples"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.disableAddClass}
                                        name="disableAddClass"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Disable adding classes"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.disabledClassRemove}
                                        name="disabledClassRemove"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Disable class removal"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.disableClassNameEdit}
                                        name="disableClassNameEdit"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Disable class name editing"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.imageBehaviours}
                                        name="imageBehaviours"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Image behaviours"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.soundBehaviours}
                                        name="soundBehaviours"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Sound behaviours"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.embedBehaviours}
                                        name="embedBehaviours"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Embedding behaviours"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.textBehaviours}
                                        name="textBehaviours"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Text behaviours                  "
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.trainingStep}
                                        name="trainingStep"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Include training step"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.behavioursStep}
                                        name="behavioursStep"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Include behaviors step"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.multipleBehaviours}
                                        name="multipleBehaviours"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Allow multiple behaviours"
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.showTrainingAnimation}
                                        name="showTrainingAnimation"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Show Training Animation"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.resetOnLoad}
                                        name="resetOnLoad"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Hide Behaviours on Load"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.enableFileInput}
                                        name="enableFileInput"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Enable input from files"
                            />
                        </div>
                        <div className={style.section}>
                            <div className={style.settingsTitle}>Collaboration</div>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.allowDeploy}
                                        name="allowDeploy"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Allow deployment link"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.usep2p}
                                        name="usep2p"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Enable Peer-2-Peer feature"
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.enabledP2PData}
                                        name="enabledP2PData"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Enable P2P Data Collection"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.enableCollaboration}
                                        name="enableCollaboration"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Enable Collaboration Features"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.allowModelSharing}
                                        name="allowModelSharing"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Allow model sharing"
                            />
                        </div>
                        <div className={style.section}>
                            <div className={style.settingsTitle}>Experimental</div>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.allowHeatmap}
                                        name="allowHeatmap"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Show XAI Heatmap"
                            />
                        </div>
                    </AccordionDetails>
                </Accordion>
            </form>
        </div>
    );
}
