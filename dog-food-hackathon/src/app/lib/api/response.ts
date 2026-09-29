import { ApiResponse } from "./types";

class ResponseUtil {
  public static success<T>(data: T , message : string = ""): Response {
    return Response.json({
      success: true,
      data: data,
      message: message,
      error: null,
    } , {
      status : 200
    });
  }

  public static error(code: string, message: string): Response {
    return Response.json({
      success: false,
      data: null,
      error: {
        code,
        message,
      },
      message: "",
    } , {
      status : 401
    });
  }
}

export default ResponseUtil;