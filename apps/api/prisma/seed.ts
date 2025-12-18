import { PrismaClient, Role, ContentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: 'maya-agency' },
    update: {},
    create: {
      name: 'Maya Agency',
      slug: 'maya-agency',
    },
  });

  console.log('✅ Organization created:', org.name);

  // Create demo user with password
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@maya.com' },
    update: {},
    create: {
      email: 'demo@maya.com',
      name: 'Demo User',
      organizations: {
        create: {
          organizationId: org.id,
          role: Role.OWNER,
        },
      },
    },
  });

  console.log('✅ User created:', user.email);
  console.log('   📧 Login: demo@maya.com');

  // Create demo brand
  const brand = await prisma.brand.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: 'maya-brand',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Maya Brand',
      slug: 'maya-brand',
      primaryColor: '#6366f1',
    },
  });

  console.log('✅ Brand created:', brand.name);

  // Create default templates
  const templates = await prisma.contentTemplate.findMany({ where: { brandId: brand.id } });
  
  if (templates.length === 0) {
    await prisma.contentTemplate.createMany({
      data: [
        { brandId: brand.id, name: 'Feed Segunda', type: 'FEED', dayOfWeek: 1, time: '10:00', category: 'PRODUTO' },
        { brandId: brand.id, name: 'Reels Terça', type: 'REELS', dayOfWeek: 2, time: '12:00', category: 'TREND' },
        { brandId: brand.id, name: 'Carousel Quarta', type: 'CAROUSEL', dayOfWeek: 3, time: '10:00', category: 'EDUCATIVO' },
        { brandId: brand.id, name: 'Stories Quinta', type: 'STORIES', dayOfWeek: 4, time: '18:00', category: 'ENGAJAMENTO' },
        { brandId: brand.id, name: 'Reels Sexta', type: 'REELS', dayOfWeek: 5, time: '12:00', category: 'BASTIDORES' },
        { brandId: brand.id, name: 'Feed Sábado', type: 'FEED', dayOfWeek: 6, time: '10:00', category: 'LIFESTYLE' },
      ],
    });
    console.log('✅ Templates created: 6');
  } else {
    console.log('✅ Templates already exist:', templates.length);
  }

  // Create demo calendar month
  const now = new Date();
  const calendarMonth = await prisma.calendarMonth.upsert({
    where: {
      brandId_year_month: {
        brandId: brand.id,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    },
    update: {},
    create: {
      brandId: brand.id,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      status: 'DRAFT',
    },
  });

  console.log('✅ Calendar month created:', `${calendarMonth.year}-${calendarMonth.month}`);

  // Create sample content items
  const contentTypes = ['FEED', 'REELS', 'STORIES'] as const;
  const statuses = ['PLANNED', 'BRIEFED', 'IN_PRODUCTION', 'READY', 'AWAITING_APPROVAL'] as const;

  for (let i = 1; i <= 5; i++) {
    const type = contentTypes[i % 3];
    const status = statuses[i % 5];
    const scheduledAt = new Date(now);
    scheduledAt.setDate(scheduledAt.getDate() + i);
    scheduledAt.setHours(12, 0, 0, 0);

    const code = `DEMO_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}_${type.substring(0, 2)}_${String(i).padStart(2, '0')}_v1`;

    await prisma.contentItem.upsert({
      where: { code },
      update: {},
      create: {
        brandId: brand.id,
        calendarMonthId: calendarMonth.id,
        code,
        type,
        status,
        scheduledAt,
      },
    });

    console.log(`✅ Content item created: ${code}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
