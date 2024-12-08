type Severity = 'debug' | 'warn' | 'info' | 'log' | 'error';
type JsonValue = string | number | boolean | null | { [key: string]: JsonValue; } | JsonValue[];

export const createLogger = (name: string) => {
  return {
    log: (severity: Severity = 'log', message: JsonValue) => {
      const fn = console[severity];
      if (!fn) return;
      fn(`[${name}] ${JSON.stringify(message)}`);
    }
  };
};