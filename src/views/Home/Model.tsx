import { Link } from 'react-router-dom';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { compressToEncodedURIComponent } from 'lz-string';
import { IVariantContext } from '@genaitm/util/variant';
import { VARIANTS } from '../ImageGeneral/ImageGeneral';
import { DEFAULTS } from '../SettingsDialog/SettingsForm';
import { TMType } from '@genaitm/util/TeachableModel';

function delta(data: IVariantContext, template: VARIANTS): Partial<IVariantContext> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    const keys = Object.keys(data) as (keyof IVariantContext)[];
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

interface Props {
    id: string;
    usb?: boolean;
    image?: string;
}

export default function Model({ id, usb, image }: Props) {
    const { t } = useTranslation('image_adv');

    const url = useMemo(() => {
        const state: IVariantContext = {
            modelVariant: id as TMType,
            namespace: 'image_adv',
            allowSerialUSB: usb ? true : undefined,
        };
        const str = JSON.stringify(delta(state, 'general'));
        const urlCode = compressToEncodedURIComponent(str);
        return str === '{}' ? `/${id}/general` : `/${id}/general?c=${urlCode}`;
    }, [id, usb]);

    return (
        <Link
            to={url}
            className={style.step}
        >
            {image && (
                <img
                    src={image}
                    width={128}
                    height={128}
                    alt={t(`app.models.${id}`)}
                    className={style.stepImage}
                />
            )}
            <div className={style.stepContent}>
                <h2>{t(`app.models.${id}`)}</h2>
            </div>
        </Link>
    );
}
