class ApiResponse {
  static success(data, message = "Success") {
    return {
      success: true,
      message,
      data
    };
  }
}

module.exports = ApiResponse;
