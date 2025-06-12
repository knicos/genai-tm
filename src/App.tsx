import React from 'react';

import './App.css';
import {
    RouterProvider,
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    useRouteError,
    Navigate,
} from 'react-router-dom';
import GenerateCustom from './views/GenerateCustom/GenerateCustom';
import { Provider } from 'jotai';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StyledEngineProvider } from '@mui/material/styles';
import About from './views/About/About';

function ErrorComponent() {
    const error = useRouteError();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).status === 404) {
        return (
            <section className="errorView">
                <h1>Page not found</h1>
            </section>
        );
    }

    return (
        <section className="errorView">
            <h1>Something went wrong</h1>
            <p>
                Please report this issue to{' '}
                <a
                    href="https://github.com/knicos/genai-tm/issues"
                    target="_blank"
                    rel="noreferrer"
                >
                    our project on github
                </a>{' '}
                if you have time, including the information below. Refresh the page to try again.
            </p>
            <p className="code">{JSON.stringify(error)}</p>
        </section>
    );
}

export const routes = createRoutesFromElements(
    <Route
        path="/"
        ErrorBoundary={ErrorComponent}
    >
        <Route
            index
            element={
                <Navigate
                    replace
                    to="/image/general"
                />
            }
        />
        <Route
            path="settings"
            element={<GenerateCustom />}
        />
        <Route
            path="deploy/b/:code"
            lazy={() => import('./views/Deployment/TabDeployment')}
        />
        <Route
            path="deploy/p/:code"
            lazy={() => import('./views/Deployment/PeerDeployment')}
        />
        <Route
            path="collect/:code/:classIndex"
            lazy={() => import('./views/Collection/Collection')}
        />
        <Route
            path="input/:code"
            lazy={() => import('./views/Input/Input')}
        />
        <Route
            path="about"
            element={<About />}
        />
        <Route
            path=":kind/:variant"
            lazy={() => import('./views/ImageGeneral/ImageGeneral')}
        />
    </Route>
);
const defaultRouter = createBrowserRouter(routes);

interface Props {
    router?: typeof defaultRouter;
}

function App({ router }: Props) {
    return (
        <React.Suspense fallback={<div></div>}>
            <Provider>
                <DndProvider backend={HTML5Backend}>
                    <StyledEngineProvider injectFirst>
                        <RouterProvider router={router || defaultRouter} />
                    </StyledEngineProvider>
                </DndProvider>
            </Provider>
        </React.Suspense>
    );
}

export default App;
