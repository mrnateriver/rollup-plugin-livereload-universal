/**
 * This typings only provide types required for this project.
 */

import { EventEmitter } from 'events';

export interface Config {
    port?: number;
    debug?: boolean;
}

export interface Server extends EventEmitter {
    refresh(filePath: string): void;
    close(): void;
}

export function createServer(config?: Config, onListening?: () => void): Server;
