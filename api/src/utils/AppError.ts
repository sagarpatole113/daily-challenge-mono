export class AppError extends Error {
  status: number;
  errors?: unknown[];

  constructor(message: string, status = 400, errors?: unknown[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, errors?: unknown[]) {
    return new AppError(message, 400, errors);
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }
  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }
  static notFound(message = "Not found") {
    return new AppError(message, 404);
  }
  static conflict(message: string) {
    return new AppError(message, 409);
  }
  static internal(message = "Internal server error") {
    return new AppError(message, 500);
  }
}
