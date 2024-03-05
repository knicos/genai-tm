import { ILine } from './SvgLayer';

export interface INode {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
}

export function extractNodesFromElements(div: HTMLElement, initial?: Map<string, INode[]>) {
    const result = initial || new Map<string, INode[]>();
    for (let i = 0; i < div.children.length; ++i) {
        const child = div.children[i] as HTMLElement;
        const widgetType = child.getAttribute('data-widget');
        if (widgetType === 'container') {
            extractNodesFromElements(child, result);
        } else if (widgetType) {
            if (!result.has(widgetType)) {
                result.set(widgetType, []);
            }
            const width = child.offsetWidth;
            const height = child.offsetHeight;
            if (width > 0 && height > 0) {
                result
                    .get(widgetType)
                    ?.push({ x: child.offsetLeft, y: child.offsetTop, width, height, id: child.id || 'noid' });
            }
        }
    }
    return result;
}

export type ConnectionPoint = 'left' | 'right' | 'top' | 'bottom';

export interface IConnection {
    start: string;
    startPoint: ConnectionPoint;
    end: string;
    endPoint: ConnectionPoint;
}

export function generateLines(data: Map<string, INode[]>, connections: IConnection[]) {
    const lines: ILine[] = [];
    for (const connection of connections) {
        const ins = data.get(connection.start) || [];
        const outs = data.get(connection.end) || [];
        for (const input of ins) {
            for (const output of outs) {
                lines.push({
                    id1: input.id,
                    id2: output.id,
                    x1:
                        connection.startPoint === 'left'
                            ? input.x
                            : connection.startPoint === 'right'
                            ? input.x + input.width
                            : input.x + input.width / 2,
                    x2:
                        connection.endPoint === 'left'
                            ? output.x
                            : connection.endPoint === 'right'
                            ? output.x + output.width
                            : output.x + output.width / 2,
                    y1:
                        connection.startPoint === 'top'
                            ? input.y
                            : connection.startPoint === 'bottom'
                            ? input.y + input.height
                            : input.y + input.height / 2,
                    y2:
                        connection.endPoint === 'top'
                            ? output.y
                            : connection.endPoint === 'bottom'
                            ? output.y + output.height
                            : output.y + output.height / 2,
                    direction:
                        connection.startPoint === 'top' || connection.startPoint === 'bottom'
                            ? 'vertical'
                            : 'horizontal',
                });
            }
        }
    }
    return lines;
}
