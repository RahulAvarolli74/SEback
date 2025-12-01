class ApiRes extends Error {
  constructor(
    statusCode,
    data,
    message = 'Success'
  ){
    super(message); 
    this.statusCode = statusCode;
    this.data = data;
    this.success = statusCode < 400;
    this.name = this.constructor.name;
  }
}

export { ApiRes };
