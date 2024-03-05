import { describe, it } from 'vitest';
import { extractNodesFromElements, generateLines, IConnection, INode } from './lines';

describe('extractNodesFromElements()', () => {
    it('can extract tagged elements', async ({ expect }) => {
        const node = document.createElement('div');

        const child1 = document.createElement('div');
        child1.setAttribute('data-widget', 'c1');
        node.appendChild(child1);

        const child2 = document.createElement('div');
        child2.setAttribute('data-widget', 'c2');
        node.appendChild(child2);

        const result = extractNodesFromElements(node);

        expect(result.has('c1')).toBe(true);
        expect(result.has('c2')).toBe(true);
    });

    it('ignores non-tagged children', async ({ expect }) => {
        const node = document.createElement('div');

        const child1 = document.createElement('div');
        child1.setAttribute('data-widget', 'c1');
        node.appendChild(child1);

        const child2 = document.createElement('div');
        node.appendChild(child2);

        const result = extractNodesFromElements(node);

        expect(result.size).toBe(1);
    });

    it('enters container children', async ({ expect }) => {
        const node = document.createElement('div');

        const child1 = document.createElement('div');
        child1.setAttribute('data-widget', 'container');
        node.appendChild(child1);

        const child2 = document.createElement('div');
        child2.setAttribute('data-widget', 'c2');
        child1.appendChild(child2);

        const result = extractNodesFromElements(node);

        expect(result.has('c2')).toBe(true);
    });
});

describe('generateLines()', () => {
    it('will create a right to left line', async ({ expect }) => {
        const nodes = new Map<string, INode[]>();
        nodes.set('c1', [{ x: 10, y: 10, width: 100, height: 100, id: '' }]);
        nodes.set('c2', [{ x: 200, y: 10, width: 100, height: 100, id: '' }]);

        const connections: IConnection[] = [{ start: 'c1', startPoint: 'right', end: 'c2', endPoint: 'left' }];

        const lines = generateLines(nodes, connections);
        expect(lines).toHaveLength(1);
        expect(lines[0].x1).toBe(110);
        expect(lines[0].x2).toBe(200);
    });
});
