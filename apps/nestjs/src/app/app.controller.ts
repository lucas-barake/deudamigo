import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  constructor() {}

  @Get("/healthcheck")
  getData() {
    return { message: "OK" };
  }
}
