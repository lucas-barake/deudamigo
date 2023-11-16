import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  constructor() {}

  @Get("/healthcheck")
  public getData() {
    return { message: "OK" };
  }
}
