import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { SidebarMode } from '../workflow/Preview/PreviewMenu';

export function getPathSegments(pathname: string) {
    return pathname.split('/').filter(Boolean);
}

export function getWorkspaceBasePath(pathname: string) {
    const segments = getPathSegments(pathname);
    const baseSegments = segments.slice(0, 2);
    return baseSegments.length > 0 ? `/${baseSegments.join('/')}` : '/';
}

export function getWorkspaceSubPath(pathname: string) {
    const segments = getPathSegments(pathname);
    return segments.length > 2 ? `/${segments.slice(2).join('/')}` : '';
}

export function useWorkspaceRoute() {
    const navigate = useNavigate();
    const location = useLocation();

    const basePath = useMemo(() => getWorkspaceBasePath(location.pathname), [location.pathname]);
    const subPath = useMemo(() => getWorkspaceSubPath(location.pathname), [location.pathname]);

    const openSidebar = useCallback(
        (mode: SidebarMode) => {
            navigate(`${basePath}/${mode}${location.search}`, { replace: true });
        },
        [basePath, navigate, location.search]
    );

    const closeSidebar = useCallback(() => {
        if (!subPath) return;
        navigate(`${basePath}${location.search}`, { replace: true });
    }, [basePath, navigate, location.search, subPath]);

    return {
        basePath,
        subPath,
        openSidebar,
        closeSidebar,
    };
}
