import React from 'react';

import './App.css';
import Home from './views/Home/Home';
import {
    RouterProvider,
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    useRouteError,
    Navigate,
} from 'react-router-dom';
import gitInfo from './generatedGitInfo.json';
import GenerateCustom from './views/GenerateCustom/GenerateCustom';
import { RecoilRoot } from 'recoil';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StyledEngineProvider } from '@mui/material/styles';
import About from './views/About/About';

function ErrorComponent() {
    const error = useRouteError();

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

const router = createBrowserRouter(
    createRoutesFromElements(
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
                path="about"
                element={<About />}
            />
            <Route
                path="home"
                element={<Home />}
            />
            <Route
                path=":kind/:variant"
                lazy={() => import('./views/ImageGeneral/ImageGeneral')}
            />
        </Route>
    )
);

function App() {
    return (
        <React.Suspense fallback={<div></div>}>
            <RecoilRoot>
                <DndProvider backend={HTML5Backend}>
                    <StyledEngineProvider injectFirst>
                        <RouterProvider router={router} />
                        <div
                            aria-hidden
                            className="versionBox"
                        >
                            Version:{' '}
                            <a
                                href={`https://github.com/knicos/genai-tm/releases/tag/${gitInfo.gitTag}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {gitInfo.gitTag}
                            </a>
                        </div>
                    </StyledEngineProvider>
                </DndProvider>
            </RecoilRoot>
        </React.Suspense>
    );
}

export default App;
