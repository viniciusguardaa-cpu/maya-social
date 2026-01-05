import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

interface InstagramUserResponse {
  id: string;
  username: string;
}

interface InstagramMediaResponse {
  id: string;
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.appId = this.config.get<string>('FACEBOOK_APP_ID') || '';
    this.appSecret = this.config.get<string>('FACEBOOK_APP_SECRET') || '';
    this.redirectUri = this.config.get<string>('INSTAGRAM_REDIRECT_URI') || 
      'https://midiaapi-production.up.railway.app/api/auth/instagram/callback';
  }

  // Generate OAuth URL for user to authorize
  getAuthorizationUrl(brandId: string): string {
    const scope = [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement',
    ].join(',');

    const state = Buffer.from(JSON.stringify({ brandId })).toString('base64');

    return `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${this.appId}` +
      `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&response_type=code`;
  }

  // Exchange code for access token
  async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
    const url = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${this.appId}` +
      `&client_secret=${this.appSecret}` +
      `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
      `&code=${code}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      this.logger.error('Token exchange error:', data.error);
      throw new Error(data.error.message);
    }

    return data;
  }

  // Get long-lived token (60 days)
  async getLongLivedToken(shortLivedToken: string): Promise<string> {
    const url = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${this.appId}` +
      `&client_secret=${this.appSecret}` +
      `&fb_exchange_token=${shortLivedToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.access_token;
  }

  // Get Instagram Business Account ID from Facebook Page
  async getInstagramBusinessAccountId(accessToken: string): Promise<{ igAccountId: string; pageId: string; username: string } | null> {
    // First, get user's pages
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return null;
    }

    // Find page with Instagram account
    for (const page of pagesData.data) {
      const igUrl = `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`;
      const igResponse = await fetch(igUrl);
      const igData = await igResponse.json();

      if (igData.instagram_business_account) {
        // Get Instagram username
        const usernameUrl = `https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?fields=username&access_token=${accessToken}`;
        const usernameResponse = await fetch(usernameUrl);
        const usernameData = await usernameResponse.json();

        return {
          igAccountId: igData.instagram_business_account.id,
          pageId: page.id,
          username: usernameData.username,
        };
      }
    }

    return null;
  }

  // Save Instagram connection to database
  async saveConnection(brandId: string, data: {
    accessToken: string;
    igAccountId: string;
    pageId: string;
    username: string;
  }) {
    // Check if connection exists
    const existing = await this.prisma.socialConnection.findFirst({
      where: { brandId, platform: 'INSTAGRAM' },
    });

    if (existing) {
      return this.prisma.socialConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: data.accessToken,
          platformUserId: data.igAccountId,
          platformPageId: data.pageId,
          username: data.username,
          isActive: true,
          connectedAt: new Date(),
        },
      });
    }

    return this.prisma.socialConnection.create({
      data: {
        brandId,
        platform: 'INSTAGRAM',
        accessToken: data.accessToken,
        platformUserId: data.igAccountId,
        platformPageId: data.pageId,
        username: data.username,
        isActive: true,
        connectedAt: new Date(),
      },
    });
  }

  // Get connection for brand
  async getConnection(brandId: string) {
    return this.prisma.socialConnection.findFirst({
      where: { brandId, platform: 'INSTAGRAM', isActive: true },
    });
  }

  // Publish image to Instagram
  async publishImage(brandId: string, imageUrl: string, caption: string): Promise<{ id: string }> {
    const connection = await this.getConnection(brandId);
    if (!connection) {
      throw new Error('Instagram not connected');
    }

    // Step 1: Create media container
    const createUrl = `https://graph.facebook.com/v18.0/${connection.platformUserId}/media`;
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: connection.accessToken,
      }),
    });
    const createData = await createResponse.json();

    if (createData.error) {
      throw new Error(createData.error.message);
    }

    // Step 2: Publish the container
    const publishUrl = `https://graph.facebook.com/v18.0/${connection.platformUserId}/media_publish`;
    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: connection.accessToken,
      }),
    });
    const publishData = await publishResponse.json();

    if (publishData.error) {
      throw new Error(publishData.error.message);
    }

    return { id: publishData.id };
  }

  // Publish carousel to Instagram
  async publishCarousel(brandId: string, imageUrls: string[], caption: string): Promise<{ id: string }> {
    const connection = await this.getConnection(brandId);
    if (!connection) {
      throw new Error('Instagram not connected');
    }

    // Step 1: Create media containers for each image
    const containerIds: string[] = [];
    for (const imageUrl of imageUrls) {
      const createUrl = `https://graph.facebook.com/v18.0/${connection.platformUserId}/media`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          is_carousel_item: true,
          access_token: connection.accessToken,
        }),
      });
      const createData = await createResponse.json();

      if (createData.error) {
        throw new Error(createData.error.message);
      }
      containerIds.push(createData.id);
    }

    // Step 2: Create carousel container
    const carouselUrl = `https://graph.facebook.com/v18.0/${connection.platformUserId}/media`;
    const carouselResponse = await fetch(carouselUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: containerIds.join(','),
        caption,
        access_token: connection.accessToken,
      }),
    });
    const carouselData = await carouselResponse.json();

    if (carouselData.error) {
      throw new Error(carouselData.error.message);
    }

    // Step 3: Publish
    const publishUrl = `https://graph.facebook.com/v18.0/${connection.platformUserId}/media_publish`;
    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: carouselData.id,
        access_token: connection.accessToken,
      }),
    });
    const publishData = await publishResponse.json();

    if (publishData.error) {
      throw new Error(publishData.error.message);
    }

    return { id: publishData.id };
  }

  // Get insights for a media
  async getMediaInsights(brandId: string, mediaId: string) {
    const connection = await this.getConnection(brandId);
    if (!connection) {
      throw new Error('Instagram not connected');
    }

    const url = `https://graph.facebook.com/v18.0/${mediaId}/insights?` +
      `metric=engagement,impressions,reach,saved,likes,comments,shares` +
      `&access_token=${connection.accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.data || [];
  }

  // Get account insights
  async getAccountInsights(brandId: string, period: 'day' | 'week' | 'days_28' = 'day') {
    const connection = await this.getConnection(brandId);
    if (!connection) {
      throw new Error('Instagram not connected');
    }

    const url = `https://graph.facebook.com/v18.0/${connection.platformUserId}/insights?` +
      `metric=impressions,reach,follower_count,profile_views` +
      `&period=${period}` +
      `&access_token=${connection.accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.data || [];
  }

  // Disconnect Instagram
  async disconnect(brandId: string) {
    return this.prisma.socialConnection.updateMany({
      where: { brandId, platform: 'INSTAGRAM' },
      data: { isActive: false },
    });
  }
}
