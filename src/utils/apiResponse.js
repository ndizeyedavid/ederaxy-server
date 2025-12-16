export const successResponse = (
  res,
  data = {},
  message = "Success",
  statusCode = 200
) =>
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });

export const createdResponse = (res, data = {}, message = "Created") =>
  successResponse(res, data, message, 201);

export default {
  successResponse,
  createdResponse,
};
