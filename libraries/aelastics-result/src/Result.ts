/* eslint-disable @typescript-eslint/typedef */
import { ErrorCode } from './ErrorCode';

/**
 *  Result of some function, operation or service can be success or failure
 */
export type ServiceResult<T> = Success<T> | Failure;
export type Result<T> = ServiceResult<T>;
/**
 *  Failure has one or more errors
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface Failure {
  type: 'failure';
  errors: ServiceError[];
}

/**
 * Success has some value as result
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface Success<T> {
  type: 'success';
  value: T;
}

/**
 * Functions for distinguish between success and failure, defined as baseType guards
 */

/**
 *
 * @param arg
 */
export const isFailure = <T>(arg: ServiceResult<T>): arg is Failure => arg.type === 'failure';

/**
 *
 * @param arg
 */
export const isSuccess = <T>(arg: ServiceResult<T>): arg is Success<T> => arg.type === 'success';

/**
 * Functions for creating success or failure
 */

/**
 *
 * @param value
 */
export const success = <T>(value: T): ServiceResult<T> => ({ type: 'success', value })

/**
 * 
 * @param res 
 * @returns value if it is success or undefiend otherwise 
 */
export const getValue = <T>(res:Result<T>) => isSuccess(res)?res.value:undefined

/**
 *
 * @param err
 */
export const failure = <T>(err: ServiceError | Error): ServiceResult<T> => ({ type: 'failure', errors: [ServiceError.toServiceError(err)] });

/**
 * 
 * @param res 
 * @returns  errors if it is success or undefiend otherwise 
 */
export const getErrors = <T>(res:Result<T>) => isFailure(res)?res.errors:undefined

/**
 *  Create Failure result from an array of errors
 * @param errs
 */
export const failures = <T>(errs: ServiceError[]): ServiceResult<T> => ({ type: 'failure', errors: errs });

/**
 *  Add new error to failure
 *
 * @param failure
 * @param error
 */
export const addError = <T>(failure: Failure, error: ServiceError): ServiceResult<T> => {
  failure.errors.push(error);
  return failure;
};

/**
 * Translate Error instance subtype into a corresponding ServiceError code
 * @param error
 */
function findCode(error: Error): ErrorCode {
  switch (true) {
    case error instanceof TypeError:
      return 'TypeError';
      break;
    case error instanceof EvalError:
      return 'EvalError';
      break;
    case error instanceof RangeError:
      return 'RangeError';
      break;
    case error instanceof ReferenceError:
      return 'ReferenceError';
      break;
    case error instanceof SyntaxError:
      return 'SyntaxError';
      break;
    case error instanceof URIError:
      return 'URIError';
      break;
    default:
      return 'UnknownError';
      break;
  }
}

/**
 *  Service error class
 */
export class ServiceError /*extends Error*/ {
  /** custom error code */
  public readonly name: string;
  public readonly message: string;
  public readonly code: ErrorCode;

  public constructor(code: ErrorCode, message: string, name: string = code) {
    //    super(message)
    this.message = message;
    this.name = name;
    this.code = code;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error["captureStackTrace"]) {
      Error["captureStackTrace"](this, ServiceError);
    }
  }

  /**
   * Capture standard Javascript/Typescript error in the framework
   * - subclass of Error is treated as an error code of created ServiceError
   * @param error
   */
  public static toServiceError(error: Error | ServiceError): ServiceError {
    if (error instanceof ServiceError) return error;
    //  let ext: Partial<ServiceError> = { code: 'UnknownError' }
    const code = findCode(error);
    const f = new ServiceError(code, error.message, error.name);
    // Object.assign(f, error.stack);
    return f;
  }
}

/**
 *  Cumulative error class
 */
export class CumulativeError extends ServiceError {
  public readonly errors: ServiceError[] = [];

  public constructor(code: ErrorCode, message: string, errors: Error[] = []) {
    super(code, message);
    errors.map((err) => {
      let resultError: ServiceError;
      if (!(err instanceof ServiceError)) {
        resultError = ServiceError.toServiceError(err);
      } else resultError = err;
      this.errors.push(resultError);
    });
  }
}

