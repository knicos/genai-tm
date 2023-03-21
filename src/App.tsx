import React from 'react';

import './App.css';
import Home from "./views/Home/Home";
import { RouterProvider, Route, Navigate, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import gitInfo from "./generatedGitInfo.json";
import ImageVariants from './views/ImageVariants/ImageVariants';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route index element={<Navigate replace to="/image" />} />
            <Route path="image">
                <Route index element={<ImageVariants />} />
                <Route path="grade4_9" lazy={() => import("./views/ImageAge4To9/ImageAge4To9")} />
                <Route path="general" lazy={() => import("./views/ImageGeneral/ImageGeneral")} />
            </Route>
            <Route path="home" element={<Home />} />
        </Route>
    )
)

function App() {
    return (
    <React.Suspense fallback={<div></div>}>
        <RouterProvider router={router} />
        <div className="versionBox">
            Version: {gitInfo.gitTag}
        </div>
    </React.Suspense>
    );
}

export default App;
