import { EventEmitter } from 'events';

/**
 * Interface of an {@link EventEmitter} that's supposed to emit `reload` events for refreshing the user's page.
 */
export interface ReloadEmitter extends EventEmitter {
    /**
     * Adds a listener for the `reload` event, which is supposed to be emitted when the user's page should be reloaded.
     *
     * @param event Event name.
     * @param listener Event handler. Receives full path in FS of the file that caused the reload.
     */
    on(event: 'reload', listener: (filePath: string) => void): this;

    /**
     * Removes specified listener for the `reload` event.
     *
     * @param event Event name.
     * @param listener Event handler.
     */
    off(event: 'reload', listener: (filePath: string) => void): this;

    /**
     * Synchronously calls each of the listeners registered for the `reload` event, in the order they were registered,
     * passing the causing file's full path to each.
     *
     * @param event Event name.
     * @param filePath Full path of the file that caused the reload.
     */
    emit(event: 'reload', filePath: string): boolean;
}
