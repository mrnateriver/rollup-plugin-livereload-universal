import * as url from 'url';

/**
 * Sanitizes user-provided URL.
 */
export function sanitizeUrl(userUrl: string): string | undefined {
    if (!userUrl) {
        return undefined;
    }

    try {
        const urlInstance = new url.URL(userUrl);
        return urlInstance.toString();
    } catch (e) {
        return undefined;
    }
}

/**
 * Surrounds string with markers for outputting it in green.
 */
export function green(text: string): string {
    return '\u001b[1m\u001b[32m' + text + '\u001b[39m\u001b[22m';
}
