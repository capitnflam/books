import { Controller, Get, Post, Req, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { ApplicationService } from './service'

@Controller()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('auth/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @Get('auth/google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirtect(@Req() req: Request) {
    return this.applicationService.googleLogin(req)
  }

  @Get()
  getHello(): string {
    return this.applicationService.getHello()
  }
}
