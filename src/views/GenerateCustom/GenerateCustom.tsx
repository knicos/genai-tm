import { useState, useCallback, FormEvent, useEffect } from 'react';
import { IVariantContext, VariantContext } from '../../util/variant';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import style from './GenerateCustom.module.css';
import { Button } from '../../components/button/Button';
import { compressToEncodedURIComponent } from 'lz-string';
import { useNavigate } from 'react-router-dom';
import _settings from '../ImageGeneral/configuration.json';
import { useSearchParams } from 'react-router-dom';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { useTranslation } from 'react-i18next';
import { LANGS } from '../../components/AppBar/AppBar';
import { VariantConfiguration, VARIANTS } from '../ImageGeneral/ImageGeneral';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@knicos/genai-base';

const DEFAULTS = _settings as VariantConfiguration;

function delta(data: IVariantContext, template: VARIANTS): Partial<IVariantContext> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    const keys = Object.keys(data) as Array<keyof IVariantContext>;
    const merged = {
        ...DEFAULTS.base,
        ...DEFAULTS[data.modelVariant],
        ...DEFAULTS[template],
    };
    for (const k of keys) {
        if (data[k] !== merged[k]) {
            result[k] = data[k];
        }
    }
    return result;
}

function SettingsForm() {
    const navigate = useNavigate();
    const { i18n, t } = useTranslation();
    const [state, setState] = useState<IVariantContext>(DEFAULTS.base);
    const [template, setTemplate] = useState<VARIANTS>('general');

    useEffect(() => {
        setState((old) => ({
            ...DEFAULTS.base,
            ...DEFAULTS[old.modelVariant],
            ...DEFAULTS[template],
        }));
    }, [template]);

    const doChangeTemplate = useCallback(
        (event: SelectChangeEvent) => {
            setTemplate(event.target.value as VARIANTS);
        },
        [setTemplate]
    );

    const doSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const str = JSON.stringify(delta(state, template));
            const urlCode = compressToEncodedURIComponent(str);
            navigate(
                str === '{}' ? `/${state.modelVariant}/${template}` : `/${state.modelVariant}/${template}?c=${urlCode}`,
                { replace: false }
            );
        },
        [state, navigate, template]
    );

    const doCheckChange = useCallback(
        (event: FormEvent<HTMLInputElement>) => {
            setState((old) => ({ ...old, [event.currentTarget.name]: event.currentTarget.checked }));
        },
        [setState]
    );

    const doSelectChange = useCallback(
        (event: SelectChangeEvent) => {
            setState((old) => ({ ...old, [event.target.name]: event.target.value }));
        },
        [setState]
    );

    const doCancel = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const doReset = useCallback(() => {
        setState(DEFAULTS.base);
    }, [setState]);

    const doLanguageChange = useCallback(
        (event: SelectChangeEvent) => {
            i18n.changeLanguage(event?.target.value);
        },
        [i18n]
    );

    return (
        <ThemeProvider theme={theme}>
            <div className={style.container}>
                <h1>{t('settings.title')}</h1>
                <form onSubmit={doSubmit}>
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
                    <FormControl fullWidth>
                        <InputLabel id="template-select">{t('settings.labels.variant')}</InputLabel>
                        <Select
                            labelId="template-select"
                            onChange={doChangeTemplate}
                            value={template}
                            label={t('settings.labels.variant')}
                        >
                            <MenuItem value="general">{t('settings.values.variants.0')}</MenuItem>
                            <MenuItem value="classroom">{t('settings.values.variants.1')}</MenuItem>
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
                            <FormControl fullWidth>
                                <InputLabel id="langlevel-select">Language Level</InputLabel>
                                <Select
                                    labelId="langlevel-select"
                                    onChange={doSelectChange}
                                    value={state.namespace}
                                    label="Language Level"
                                    name="namespace"
                                >
                                    <MenuItem value="image_adv">Advanced</MenuItem>
                                    <MenuItem value="image_4_9">Grade 4-9</MenuItem>
                                </Select>
                            </FormControl>
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
                                        checked={state.modelSelect}
                                        name="modelSelect"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Allow model selection"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.modelThreshold}
                                        name="modelThreshold"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Enable threshold output"
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
                                        checked={state.showDragTip}
                                        name="showDragTip"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Show Drag & Drop animation tip"
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
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.allowHeatmap}
                                        name="allowHeatmap"
                                        onChange={doCheckChange}
                                    />
                                }
                                label="Allow XAI Heatmap"
                            />
                        </AccordionDetails>
                    </Accordion>
                    <div className={style.buttonBar}>
                        <Button
                            variant="contained"
                            type="submit"
                        >
                            {t('settings.actions.save')}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={doReset}
                        >
                            {t('settings.actions.reset')}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={doCancel}
                        >
                            {t('settings.actions.cancel')}
                        </Button>
                    </div>
                </form>
            </div>
        </ThemeProvider>
    );
}

export default function GenerateCustom() {
    const [params] = useSearchParams();
    const customStr = decompressFromEncodedURIComponent(params.get('c') || '');
    const custom = (customStr ? JSON.parse(customStr) : {}) as IVariantContext;

    const merged = {
        ...DEFAULTS.base,
        ...custom,
    };

    return (
        <VariantContext.Provider value={merged}>
            <SettingsForm />
        </VariantContext.Provider>
    );
}
