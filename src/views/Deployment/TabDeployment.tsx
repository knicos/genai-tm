import { useState, useCallback } from 'react';
import Deployment from './Deployment';
import { useTabModel } from './useRemoteModel';
import { useParams } from 'react-router-dom';

export function Component() {
    const { code } = useParams();
    const [hadError, setHadError] = useState(false);
    const onError = useCallback(() => setHadError(true), [setHadError]);
    const [model, behaviours] = useTabModel(code || '', onError);

    const closeError = useCallback(() => setHadError(false), [setHadError]);

    return (
        <Deployment
            model={model}
            behaviours={behaviours}
            error={hadError}
            onCloseError={closeError}
        />
    );
}
