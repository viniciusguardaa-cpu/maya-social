import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MediaContainer {
  id: string;
  status: 'IN_PROGRESS' | 'FINISHED' | 'ERROR';
  statusCode?: string;
}

export interface PublishResult {
  id: string;
  permalink?: string;
}

export interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
  followersCount?: number;
}

export interface MediaUploadParams {
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'REELS' | 'CAROUSEL_ALBUM';
  coverUrl?: string;
  locationId?: string;
  userTags?: Array<{ username: string; x: number; y: number }>;
  carouselItems?: Array<{ imageUrl?: string; videoUrl?: string }>;
}

export interface ScheduleParams extends MediaUploadParams {
  publishTime: Date;
}

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);
  private readonly accessToken: string | undefined;
  private readonly isEnabled: boolean;
  private readonly apiVersion = 'v18.0';
  private readonly baseUrl = 'https://graph.facebook.com';

  constructor(private configService: ConfigService) {
    this.accessToken = this.configService.get('META_ACCESS_TOKEN');
    this.isEnabled = !!this.accessToken;

    if (!this.isEnabled) {
      this.logger.warn('⚠️  Meta API not configured - publication will be mocked');
    }
  }

  private async apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, any>,
  ): Promise<T> {
    const url = `${this.baseUrl}/${this.apiVersion}/${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method === 'POST' && body) {
      options.body = JSON.stringify({
        ...body,
        access_token: this.accessToken,
      });
    }

    const separator = endpoint.includes('?') ? '&' : '?';
    const finalUrl = method === 'GET' 
      ? `${url}${separator}access_token=${this.accessToken}`
      : url;

    const response = await fetch(finalUrl, options);
    const data = await response.json();

    if (!response.ok) {
      this.logger.error('Meta API error', data);
      throw new BadRequestException(data.error?.message || 'Meta API error');
    }

    return data as T;
  }

  async getInstagramAccount(igUserId: string): Promise<InstagramAccount> {
    if (!this.isEnabled) {
      return {
        id: igUserId,
        username: 'mock_account',
        name: 'Mock Account',
        followersCount: 1000,
      };
    }

    const data = await this.apiRequest<any>(
      `${igUserId}?fields=id,username,name,profile_picture_url,followers_count`
    );

    return {
      id: data.id,
      username: data.username,
      name: data.name,
      profilePictureUrl: data.profile_picture_url,
      followersCount: data.followers_count,
    };
  }

  async createMediaContainer(
    igUserId: string,
    params: MediaUploadParams,
  ): Promise<MediaContainer> {
    if (!this.isEnabled) {
      return {
        id: `mock-container-${Date.now()}`,
        status: 'FINISHED',
      };
    }

    const body: Record<string, any> = {
      caption: params.caption,
    };

    if (params.mediaType === 'IMAGE') {
      body.image_url = params.imageUrl;
    } else if (params.mediaType === 'VIDEO' || params.mediaType === 'REELS') {
      body.video_url = params.videoUrl;
      body.media_type = params.mediaType === 'REELS' ? 'REELS' : 'VIDEO';
      if (params.coverUrl) {
        body.cover_url = params.coverUrl;
      }
    } else if (params.mediaType === 'CAROUSEL_ALBUM') {
      if (!params.carouselItems || params.carouselItems.length < 2) {
        throw new BadRequestException('Carousel requires at least 2 items');
      }

      const childrenIds: string[] = [];
      for (const item of params.carouselItems) {
        const childBody: Record<string, any> = {
          is_carousel_item: true,
        };
        if (item.imageUrl) {
          childBody.image_url = item.imageUrl;
        } else if (item.videoUrl) {
          childBody.video_url = item.videoUrl;
          childBody.media_type = 'VIDEO';
        }

        const childContainer = await this.apiRequest<{ id: string }>(
          `${igUserId}/media`,
          'POST',
          childBody,
        );
        childrenIds.push(childContainer.id);
      }

      body.media_type = 'CAROUSEL';
      body.children = childrenIds.join(',');
    }

    if (params.locationId) {
      body.location_id = params.locationId;
    }

    if (params.userTags && params.userTags.length > 0) {
      body.user_tags = params.userTags.map(tag => ({
        username: tag.username,
        x: tag.x,
        y: tag.y,
      }));
    }

    const data = await this.apiRequest<{ id: string }>(
      `${igUserId}/media`,
      'POST',
      body,
    );

    return {
      id: data.id,
      status: 'IN_PROGRESS',
    };
  }

  async checkContainerStatus(containerId: string): Promise<MediaContainer> {
    if (!this.isEnabled) {
      return {
        id: containerId,
        status: 'FINISHED',
      };
    }

    const data = await this.apiRequest<{ id: string; status_code: string }>(
      `${containerId}?fields=id,status_code`
    );

    const statusMap: Record<string, MediaContainer['status']> = {
      'FINISHED': 'FINISHED',
      'IN_PROGRESS': 'IN_PROGRESS',
      'ERROR': 'ERROR',
    };

    return {
      id: data.id,
      status: statusMap[data.status_code] || 'IN_PROGRESS',
      statusCode: data.status_code,
    };
  }

  async publishMedia(igUserId: string, containerId: string): Promise<PublishResult> {
    if (!this.isEnabled) {
      const mockId = `mock-post-${Date.now()}`;
      return {
        id: mockId,
        permalink: `https://instagram.com/p/${mockId}`,
      };
    }

    const data = await this.apiRequest<{ id: string }>(
      `${igUserId}/media_publish`,
      'POST',
      { creation_id: containerId },
    );

    const mediaData = await this.apiRequest<{ permalink: string }>(
      `${data.id}?fields=permalink`
    );

    return {
      id: data.id,
      permalink: mediaData.permalink,
    };
  }

  async scheduleMedia(
    igUserId: string,
    params: ScheduleParams,
  ): Promise<MediaContainer> {
    if (!this.isEnabled) {
      return {
        id: `mock-scheduled-${Date.now()}`,
        status: 'FINISHED',
      };
    }

    const publishTimestamp = Math.floor(params.publishTime.getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    const minTime = now + 10 * 60;
    const maxTime = now + 75 * 24 * 60 * 60;

    if (publishTimestamp < minTime) {
      throw new BadRequestException('Schedule time must be at least 10 minutes in the future');
    }

    if (publishTimestamp > maxTime) {
      throw new BadRequestException('Schedule time must be within 75 days');
    }

    const body: Record<string, any> = {
      caption: params.caption,
      published: false,
      scheduled_publish_time: publishTimestamp,
    };

    if (params.mediaType === 'IMAGE') {
      body.image_url = params.imageUrl;
    } else if (params.mediaType === 'VIDEO' || params.mediaType === 'REELS') {
      body.video_url = params.videoUrl;
      body.media_type = params.mediaType === 'REELS' ? 'REELS' : 'VIDEO';
    }

    const data = await this.apiRequest<{ id: string }>(
      `${igUserId}/media`,
      'POST',
      body,
    );

    return {
      id: data.id,
      status: 'FINISHED',
    };
  }

  async getMediaInsights(mediaId: string): Promise<Record<string, number>> {
    if (!this.isEnabled) {
      return {
        impressions: Math.floor(Math.random() * 10000),
        reach: Math.floor(Math.random() * 8000),
        engagement: Math.floor(Math.random() * 500),
        saved: Math.floor(Math.random() * 100),
        likes: Math.floor(Math.random() * 300),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 20),
      };
    }

    const metrics = 'impressions,reach,engagement,saved,likes,comments,shares';
    
    try {
      const data = await this.apiRequest<{ data: Array<{ name: string; values: Array<{ value: number }> }> }>(
        `${mediaId}/insights?metric=${metrics}`
      );

      const insights: Record<string, number> = {};
      for (const metric of data.data) {
        insights[metric.name] = metric.values[0]?.value || 0;
      }

      return insights;
    } catch (error) {
      this.logger.warn(`Could not fetch insights for ${mediaId}`, error);
      return {};
    }
  }

  async getAccountInsights(
    igUserId: string,
    period: 'day' | 'week' | 'month' = 'day',
  ): Promise<Record<string, number>> {
    if (!this.isEnabled) {
      return {
        impressions: Math.floor(Math.random() * 50000),
        reach: Math.floor(Math.random() * 40000),
        follower_count: Math.floor(Math.random() * 10000),
        profile_views: Math.floor(Math.random() * 1000),
      };
    }

    const metrics = 'impressions,reach,follower_count,profile_views';

    try {
      const data = await this.apiRequest<{ data: Array<{ name: string; values: Array<{ value: number }> }> }>(
        `${igUserId}/insights?metric=${metrics}&period=${period}`
      );

      const insights: Record<string, number> = {};
      for (const metric of data.data) {
        insights[metric.name] = metric.values[0]?.value || 0;
      }

      return insights;
    } catch (error) {
      this.logger.warn(`Could not fetch account insights`, error);
      return {};
    }
  }

  isConfigured(): boolean {
    return this.isEnabled;
  }
}
