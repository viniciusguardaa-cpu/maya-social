import { Controller, Get, Post, Delete, Query, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InstagramService } from './instagram.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Instagram')
@Controller()
export class InstagramController {
  constructor(private instagramService: InstagramService) {}

  @Get('organizations/:orgId/brands/:brandId/instagram/auth-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Instagram OAuth authorization URL' })
  getAuthUrl(@Param('brandId') brandId: string) {
    const url = this.instagramService.getAuthorizationUrl(brandId);
    return { url };
  }

  @Get('auth/instagram/callback')
  @ApiOperation({ summary: 'Instagram OAuth callback' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      // Decode state to get brandId
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      const brandId = stateData.brandId;

      // Exchange code for token
      const tokenData = await this.instagramService.exchangeCodeForToken(code);

      // Get long-lived token
      const longLivedToken = await this.instagramService.getLongLivedToken(tokenData.access_token);

      // Get Instagram Business Account
      const igAccount = await this.instagramService.getInstagramBusinessAccountId(longLivedToken);

      if (!igAccount) {
        return res.redirect(
          `https://midiaweb-production.up.railway.app/dashboard/settings?instagram=error&message=${encodeURIComponent('Nenhuma conta Business do Instagram encontrada. Certifique-se de ter uma Página do Facebook conectada ao Instagram.')}`
        );
      }

      // Save connection
      await this.instagramService.saveConnection(brandId, {
        accessToken: longLivedToken,
        igAccountId: igAccount.igAccountId,
        pageId: igAccount.pageId,
        username: igAccount.username,
      });

      // Redirect to frontend with success
      return res.redirect(
        `https://midiaweb-production.up.railway.app/dashboard/settings?instagram=success&username=${igAccount.username}`
      );
    } catch (error) {
      console.error('Instagram callback error:', error);
      return res.redirect(
        `https://midiaweb-production.up.railway.app/dashboard/settings?instagram=error&message=${encodeURIComponent(error.message)}`
      );
    }
  }

  @Get('organizations/:orgId/brands/:brandId/instagram/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Instagram connection status' })
  async getStatus(@Param('brandId') brandId: string) {
    const connection = await this.instagramService.getConnection(brandId);
    return connection || { connected: false };
  }

  @Delete('organizations/:orgId/brands/:brandId/instagram/disconnect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect Instagram account' })
  async disconnect(@Param('brandId') brandId: string) {
    await this.instagramService.disconnect(brandId);
    return { success: true };
  }

  @Post('organizations/:orgId/brands/:brandId/instagram/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish content to Instagram' })
  async publish(
    @Param('brandId') brandId: string,
    @Query('imageUrl') imageUrl: string,
    @Query('caption') caption: string,
  ) {
    const result = await this.instagramService.publishImage(brandId, imageUrl, caption);
    return result;
  }

  @Get('organizations/:orgId/brands/:brandId/instagram/insights')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Instagram account insights' })
  async getInsights(
    @Param('brandId') brandId: string,
    @Query('period') period: 'day' | 'week' | 'days_28' = 'day',
  ) {
    const insights = await this.instagramService.getAccountInsights(brandId, period);
    return { insights };
  }
}
