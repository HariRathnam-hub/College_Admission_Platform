export class ApiResponse<T = unknown> {
  public success: boolean;
  public message: string;
  public data?: T;

  constructor(message: string, data?: T, success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
