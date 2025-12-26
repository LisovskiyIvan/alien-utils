type TypeGuard<T> = (value: unknown) => value is T;

type Handler<T, R> = (value: T) => R;

type HandlerEntry<T, R> = {
  guard: TypeGuard<T>;
  handler: Handler<T, R>;
};

export function dispatch<T = any, R = any>() {
  const handlers: HandlerEntry<any, R>[] = [];
  let defaultHandler: ((value: T) => R) | null = null;

  function dispatchFn(value: T): R {
    for (const { guard, handler } of handlers) {
      if (guard(value)) {
        return handler(value as any);
      }
    }

    if (defaultHandler) {
      return defaultHandler(value);
    }

    throw new Error(`No handler registered for value: ${value}`);
  }

  dispatchFn.on = function <U>(guard: TypeGuard<U>, handler: Handler<U, R>): typeof dispatchFn {
    handlers.push({ guard, handler });
    return dispatchFn as any;
  };

  dispatchFn.default = function (handler: (value: T) => R): typeof dispatchFn {
    defaultHandler = handler;
    return dispatchFn as any;
  };

  return dispatchFn;
}

export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isNull = (value: unknown): value is null => value === null;
export const isUndefined = (value: unknown): value is undefined => value === undefined;
export const isObject = (value: unknown): value is Record<string, unknown> => 
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => 
  typeof value === 'function';
