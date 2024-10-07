import { D as DetectOptions, d as DetectResult } from './shared/package-manager-detector.dd6a353c.js';

/**
 * Detects the package manager used in the project.
 *
 * @param options {DetectOptions} The options to use when detecting the package manager.
 *
 * @returns {Promise<DetectResult | null>} The detected package manager or `null` if not found.
 */
declare function detect(options?: DetectOptions): Promise<DetectResult | null>;

export { detect };
