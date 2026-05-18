import { useLocation } from 'react-router-dom';
import { UnderTheHood } from './UnderTheHood';
import { SidebarMode } from '../../workflow/Preview/PreviewMenu';

export function Component() {
    const { pathname } = useLocation();
    const mode: SidebarMode = pathname.endsWith('/statistics') ? 'statistics' : 'visualization';
    return <UnderTheHood mode={mode} />;
}

export { UnderTheHood };
export default UnderTheHood;
