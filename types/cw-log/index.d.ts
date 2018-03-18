/**
 * cw-log
 *
 * @copyright © 2015 OKUNOKENTARO
 * @since cw-log v 0.1.0 (Mar 5, 2015)
 */
declare module cw {
  export function logger(level: number): Log;
  export function t(): string; // timestamp
  export interface Log {
    t(): string;

    trace(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    fatal(...args: any[]): void;
  }
}

declare module 'cw-log' {
  export = cw;
}