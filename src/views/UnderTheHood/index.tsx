import { useLocation } from 'react-router';
import { UnderTheHood } from './UnderTheHood';
import type { SidebarMode } from '../../workflow/Preview/PreviewMenu';

export function Component() {
    const { pathname } = useLocation();
    const mode: SidebarMode = pathname.endsWith('/statistics')
        ? 'statistics'
        : pathname.endsWith('/transferLearning')
        ? 'transferLearning'
        : 'visualization';
    return <UnderTheHood mode={mode} />;
}

export { UnderTheHood };
export default UnderTheHood;
