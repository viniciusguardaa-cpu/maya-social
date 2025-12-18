import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaService } from '../meta/meta.service';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ContentPerformance {
  contentItemId: string;
  code: string;
  type: string;
  title?: string;
  publishedAt?: Date;
  reach: number;
  impressions: number;
  engagement: number;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface DashboardSummary {
  totalPosts: number;
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topContent: ContentPerformance[];
  byContentType: Record<string, { count: number; avgEngagement: number }>;
  byDayOfWeek: Record<string, { count: number; avgEngagement: number }>;
  trend: Array<{ date: string; reach: number; engagement: number }>;
}

export interface BrandReport {
  brandId: string;
  brandName: string;
  period: DateRange;
  summary: DashboardSummary;
  contentList: ContentPerformance[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private metaService: MetaService,
  ) {}

  async getContentPerformance(contentItemId: string): Promise<ContentPerformance | null> {
    const content = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        brief: { select: { title: true } },
        insights: { orderBy: { date: 'desc' }, take: 1 },
      },
    });

    if (!content) {
      throw new NotFoundException('Content item not found');
    }

    const insight = content.insights[0];
    if (!insight) {
      return {
        contentItemId: content.id,
        code: content.code,
        type: content.type,
        title: content.brief?.title,
        publishedAt: content.publishedAt || undefined,
        reach: 0,
        impressions: 0,
        engagement: 0,
        engagementRate: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
      };
    }

    const engagement = (insight.likes || 0) + (insight.comments || 0) + (insight.shares || 0) + (insight.saves || 0);
    const engagementRate = insight.reach ? (engagement / insight.reach) * 100 : 0;

    return {
      contentItemId: content.id,
      code: content.code,
      type: content.type,
      title: content.brief?.title,
      publishedAt: content.publishedAt || undefined,
      reach: insight.reach || 0,
      impressions: insight.impressions || 0,
      engagement,
      engagementRate: Math.round(engagementRate * 100) / 100,
      likes: insight.likes || 0,
      comments: insight.comments || 0,
      shares: insight.shares || 0,
      saves: insight.saves || 0,
    };
  }

  async getBrandDashboard(brandId: string, range: DateRange): Promise<DashboardSummary> {
    const insights = await this.prisma.insight.findMany({
      where: {
        brandId,
        date: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
      include: {
        contentItem: {
          select: {
            id: true,
            code: true,
            type: true,
            publishedAt: true,
            brief: { select: { title: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const contentMap = new Map<string, ContentPerformance>();
    const byType: Record<string, { count: number; totalEngagement: number }> = {};
    const byDayOfWeek: Record<string, { count: number; totalEngagement: number }> = {};
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    let totalReach = 0;
    let totalImpressions = 0;
    let totalEngagement = 0;

    for (const insight of insights) {
      const engagement = (insight.likes || 0) + (insight.comments || 0) + 
                        (insight.shares || 0) + (insight.saves || 0);

      totalReach += insight.reach || 0;
      totalImpressions += insight.impressions || 0;
      totalEngagement += engagement;

      if (insight.contentItem) {
        const existing = contentMap.get(insight.contentItemId!);
        const engagementRate = insight.reach ? (engagement / insight.reach) * 100 : 0;

        if (!existing || engagement > existing.engagement) {
          contentMap.set(insight.contentItemId!, {
            contentItemId: insight.contentItemId!,
            code: insight.contentItem.code,
            type: insight.contentItem.type,
            title: insight.contentItem.brief?.title,
            publishedAt: insight.contentItem.publishedAt || undefined,
            reach: insight.reach || 0,
            impressions: insight.impressions || 0,
            engagement,
            engagementRate: Math.round(engagementRate * 100) / 100,
            likes: insight.likes || 0,
            comments: insight.comments || 0,
            shares: insight.shares || 0,
            saves: insight.saves || 0,
          });
        }

        const type = insight.contentItem.type;
        if (!byType[type]) {
          byType[type] = { count: 0, totalEngagement: 0 };
        }
        byType[type].count++;
        byType[type].totalEngagement += engagement;

        if (insight.contentItem.publishedAt) {
          const dayOfWeek = dayNames[insight.contentItem.publishedAt.getDay()];
          if (!byDayOfWeek[dayOfWeek]) {
            byDayOfWeek[dayOfWeek] = { count: 0, totalEngagement: 0 };
          }
          byDayOfWeek[dayOfWeek].count++;
          byDayOfWeek[dayOfWeek].totalEngagement += engagement;
        }
      }
    }

    const contentList = Array.from(contentMap.values());
    const topContent = contentList
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    const trendMap = new Map<string, { reach: number; engagement: number }>();
    for (const insight of insights) {
      const dateKey = insight.date.toISOString().split('T')[0];
      const existing = trendMap.get(dateKey) || { reach: 0, engagement: 0 };
      const engagement = (insight.likes || 0) + (insight.comments || 0) + 
                        (insight.shares || 0) + (insight.saves || 0);
      existing.reach += insight.reach || 0;
      existing.engagement += engagement;
      trendMap.set(dateKey, existing);
    }

    const trend = Array.from(trendMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

    return {
      totalPosts: contentMap.size,
      totalReach,
      totalImpressions,
      totalEngagement,
      avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
      topContent,
      byContentType: Object.fromEntries(
        Object.entries(byType).map(([type, data]) => [
          type,
          { count: data.count, avgEngagement: Math.round(data.totalEngagement / data.count) },
        ])
      ),
      byDayOfWeek: Object.fromEntries(
        Object.entries(byDayOfWeek).map(([day, data]) => [
          day,
          { count: data.count, avgEngagement: Math.round(data.totalEngagement / data.count) },
        ])
      ),
      trend,
    };
  }

  async generateReport(brandId: string, range: DateRange): Promise<BrandReport> {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const summary = await this.getBrandDashboard(brandId, range);

    const contents = await this.prisma.contentItem.findMany({
      where: {
        brandId,
        publishedAt: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
      include: {
        brief: { select: { title: true } },
        insights: { orderBy: { date: 'desc' }, take: 1 },
      },
      orderBy: { publishedAt: 'desc' },
    });

    const contentList: ContentPerformance[] = contents.map(content => {
      const insight = content.insights[0];
      const engagement = insight
        ? (insight.likes || 0) + (insight.comments || 0) + (insight.shares || 0) + (insight.saves || 0)
        : 0;
      const engagementRate = insight?.reach ? (engagement / insight.reach) * 100 : 0;

      return {
        contentItemId: content.id,
        code: content.code,
        type: content.type,
        title: content.brief?.title,
        publishedAt: content.publishedAt || undefined,
        reach: insight?.reach || 0,
        impressions: insight?.impressions || 0,
        engagement,
        engagementRate: Math.round(engagementRate * 100) / 100,
        likes: insight?.likes || 0,
        comments: insight?.comments || 0,
        shares: insight?.shares || 0,
        saves: insight?.saves || 0,
      };
    });

    return {
      brandId,
      brandName: brand.name,
      period: range,
      summary,
      contentList,
    };
  }

  async syncAllInsights(brandId: string, userId: string) {
    const publications = await this.prisma.publication.findMany({
      where: {
        contentItem: { brandId },
        status: 'PUBLISHED',
        platformPostId: { not: null },
      },
      include: { contentItem: true },
    });

    const results = [];
    const errors = [];

    for (const pub of publications) {
      try {
        const insights = await this.metaService.getMediaInsights(pub.platformPostId!);

        const today = new Date(new Date().toISOString().split('T')[0]);
        
        const existingInsight = await this.prisma.insight.findFirst({
          where: {
            contentItemId: pub.contentItemId,
            date: today,
          },
        });

        if (existingInsight) {
          await this.prisma.insight.update({
            where: { id: existingInsight.id },
            data: {
              reach: insights.reach,
              impressions: insights.impressions,
              engagement: insights.engagement,
              likes: insights.likes,
              comments: insights.comments,
              shares: insights.shares,
              saves: insights.saved,
              metadata: insights,
            },
          });
        } else {
          await this.prisma.insight.create({
            data: {
              contentItemId: pub.contentItemId,
              brandId,
              date: today,
              reach: insights.reach,
              impressions: insights.impressions,
              engagement: insights.engagement,
              likes: insights.likes,
              comments: insights.comments,
              shares: insights.shares,
              saves: insights.saved,
              metadata: insights,
            },
          });
        }

        results.push({ contentItemId: pub.contentItemId, success: true });
      } catch (error) {
        errors.push({ contentItemId: pub.contentItemId, error: error.message });
      }
    }

    return { synced: results.length, errors };
  }

  async getComparison(brandId: string, contentIds: string[]): Promise<ContentPerformance[]> {
    const performances: ContentPerformance[] = [];

    for (const id of contentIds) {
      const perf = await this.getContentPerformance(id);
      if (perf) {
        performances.push(perf);
      }
    }

    return performances.sort((a, b) => b.engagement - a.engagement);
  }

  async getBestPostingTimes(brandId: string): Promise<Array<{ hour: number; dayOfWeek: string; avgEngagement: number }>> {
    const insights = await this.prisma.insight.findMany({
      where: { brandId },
      include: {
        contentItem: {
          select: { publishedAt: true },
        },
      },
    });

    const timeMap = new Map<string, { total: number; count: number }>();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (const insight of insights) {
      if (insight.contentItem?.publishedAt) {
        const date = insight.contentItem.publishedAt;
        const hour = date.getHours();
        const dayOfWeek = dayNames[date.getDay()];
        const key = `${dayOfWeek}-${hour}`;

        const engagement = (insight.likes || 0) + (insight.comments || 0) +
                          (insight.shares || 0) + (insight.saves || 0);

        const existing = timeMap.get(key) || { total: 0, count: 0 };
        existing.total += engagement;
        existing.count++;
        timeMap.set(key, existing);
      }
    }

    return Array.from(timeMap.entries())
      .map(([key, data]) => {
        const [dayOfWeek, hourStr] = key.split('-');
        return {
          hour: parseInt(hourStr),
          dayOfWeek,
          avgEngagement: Math.round(data.total / data.count),
        };
      })
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10);
  }

  async getContentTypeAnalysis(brandId: string, range: DateRange) {
    const insights = await this.prisma.insight.findMany({
      where: {
        brandId,
        date: { gte: range.startDate, lte: range.endDate },
      },
      include: {
        contentItem: { select: { type: true } },
      },
    });

    const typeStats: Record<string, {
      count: number;
      totalReach: number;
      totalEngagement: number;
      totalImpressions: number;
    }> = {};

    for (const insight of insights) {
      const type = insight.contentItem?.type || 'UNKNOWN';
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, totalReach: 0, totalEngagement: 0, totalImpressions: 0 };
      }

      const engagement = (insight.likes || 0) + (insight.comments || 0) +
                        (insight.shares || 0) + (insight.saves || 0);

      typeStats[type].count++;
      typeStats[type].totalReach += insight.reach || 0;
      typeStats[type].totalEngagement += engagement;
      typeStats[type].totalImpressions += insight.impressions || 0;
    }

    return Object.entries(typeStats).map(([type, stats]) => ({
      type,
      count: stats.count,
      avgReach: Math.round(stats.totalReach / stats.count),
      avgEngagement: Math.round(stats.totalEngagement / stats.count),
      avgImpressions: Math.round(stats.totalImpressions / stats.count),
      engagementRate: stats.totalReach > 0 
        ? Math.round((stats.totalEngagement / stats.totalReach) * 10000) / 100 
        : 0,
    }));
  }

  async getGrowthMetrics(brandId: string, range: DateRange) {
    const currentInsights = await this.prisma.insight.aggregate({
      where: {
        brandId,
        date: { gte: range.startDate, lte: range.endDate },
      },
      _sum: {
        reach: true,
        impressions: true,
        likes: true,
        comments: true,
        shares: true,
        saves: true,
        followersDelta: true,
      },
      _count: true,
    });

    const daysDiff = Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = new Date(range.startDate);
    previousStart.setDate(previousStart.getDate() - daysDiff);

    const previousInsights = await this.prisma.insight.aggregate({
      where: {
        brandId,
        date: { gte: previousStart, lt: range.startDate },
      },
      _sum: {
        reach: true,
        impressions: true,
        likes: true,
        comments: true,
        shares: true,
        saves: true,
      },
      _count: true,
    });

    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 10000) / 100;
    };

    const currentEngagement = (currentInsights._sum.likes || 0) + (currentInsights._sum.comments || 0) +
                              (currentInsights._sum.shares || 0) + (currentInsights._sum.saves || 0);
    const previousEngagement = (previousInsights._sum.likes || 0) + (previousInsights._sum.comments || 0) +
                               (previousInsights._sum.shares || 0) + (previousInsights._sum.saves || 0);

    return {
      current: {
        posts: currentInsights._count,
        reach: currentInsights._sum.reach || 0,
        impressions: currentInsights._sum.impressions || 0,
        engagement: currentEngagement,
        followersDelta: currentInsights._sum.followersDelta || 0,
      },
      previous: {
        posts: previousInsights._count,
        reach: previousInsights._sum.reach || 0,
        impressions: previousInsights._sum.impressions || 0,
        engagement: previousEngagement,
      },
      growth: {
        reach: calcGrowth(currentInsights._sum.reach || 0, previousInsights._sum.reach || 0),
        impressions: calcGrowth(currentInsights._sum.impressions || 0, previousInsights._sum.impressions || 0),
        engagement: calcGrowth(currentEngagement, previousEngagement),
      },
    };
  }
}
