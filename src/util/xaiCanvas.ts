/**
 * Singleton off-DOM canvas registered with the model as the XAI target.
 * Survives panel open/close cycles so every prediction draws the heatmap here.
 * UnderTheHood copies its content to the visible display canvas via requestAnimationFrame.
 *
 * The model receives a Proxy-wrapped canvas (`proxy`) so we can intercept drawImage
 * calls and set dirty flags without mutating any built-in objects.
 * Reflect APIs are used throughout the Proxy traps so native internal-slot checks
 * always run against the real target, not the proxy.
 */

class XAICanvas {
    /** Real backing canvas — copy source in the rAF loop and for direct fallback draws. */
    readonly element: HTMLCanvasElement;

    /** Proxy canvas to pass to model.setXAICanvas(). */
    readonly proxy: HTMLCanvasElement;

    private _proxyCtx: CanvasRenderingContext2D | null = null;
    private _drawn = false;
    private _copied = true;

    constructor(size: number) {
        this.element = document.createElement('canvas');
        this.element.width = size;
        this.element.height = size;
        this.proxy = this._buildProxy();
    }

    resize(size: number): void {
        if (this.element.width !== size || this.element.height !== size) {
            this.element.width = size;
            this.element.height = size;
            this._proxyCtx = null;
        }
    }

    isCopied(): boolean {
        return this._copied;
    }
    markCopied(): void {
        this._copied = true;
    }
    wasDrawn(): boolean {
        return this._drawn;
    }
    resetDrawn(): void {
        this._drawn = false;
    }

    /** Draws a fallback image (e.g. raw input when no pose is detected) and marks dirty. */
    drawInputImage(image: HTMLCanvasElement): void {
        const ctx = this.element.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, this.element.width, this.element.height);
            ctx.drawImage(image, 0, 0, this.element.width, this.element.height);
        }
        this._copied = false;
    }

    private _buildProxy(): HTMLCanvasElement {
        return new Proxy(this.element, {
            get: (target, prop) => {
                if (prop === 'getContext') {
                    return (contextId: string, ...args: unknown[]) =>
                        contextId === '2d'
                            ? this._getTrackedContext()
                            : Reflect.apply(target.getContext, target, [contextId, ...args]);
                }
                const value = Reflect.get(target, prop, target);
                return typeof value === 'function' ? value.bind(target) : value;
            },
            set: (target, prop, value) => Reflect.set(target, prop, value, target),
        });
    }

    private _getTrackedContext(): CanvasRenderingContext2D {
        if (this._proxyCtx) return this._proxyCtx;
        const real = this.element.getContext('2d');
        if (!real) {
            throw new Error('Failed to get 2D context');
        }
        this._proxyCtx = new Proxy(real, {
            get: (target, prop) => {
                if (prop === 'drawImage') {
                    return (...args: unknown[]) => {
                        this._drawn = true;
                        this._copied = false;
                        return Reflect.apply(target.drawImage, target, args);
                    };
                }
                const value = Reflect.get(target, prop, target);
                return typeof value === 'function' ? value.bind(target) : value;
            },
            set: (target, prop, value) => Reflect.set(target, prop, value, target),
        });
        return this._proxyCtx;
    }
}

let _instance: XAICanvas | null = null;

export function getXAI(size?: number): XAICanvas {
    if (!_instance) {
        _instance = new XAICanvas(size ?? 224);
    } else if (size !== undefined) {
        _instance.resize(size);
    }
    return _instance;
}

export function isXAICopied(): boolean {
    return _instance?.isCopied() ?? true;
}
export function markXAICopied(): void {
    _instance?.markCopied();
}
export function resetXAIDrawn(): void {
    _instance?.resetDrawn();
}
export function wasXAIDrawn(): boolean {
    return _instance?.wasDrawn() ?? false;
}
