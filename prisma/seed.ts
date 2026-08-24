import { PrismaClient, ReportStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const categories = [
  ["catcalling", "Nageroepen / seksuele opmerkingen"],
  ["followed", "Achtervolgd"],
  ["intimidation", "Intimidatie"],
  ["threat", "Bedreiging"],
  ["unwanted_touch", "Ongewenste aanraking"],
  ["stalking", "Stalking"],
  ["suspicious", "Verdacht gedrag"],
  ["attempted_violence", "Poging tot geweld"],
  ["violence", "Geweld"],
  ["sexual_violence", "Seksueel geweld"],
  ["unsafe_group", "Onveilige groep"],
  ["poor_lighting", "Slechte verlichting"],
  ["unsafe_area", "Onveilige omgeving"],
  ["public_transport", "Openbaar vervoer"],
  ["other", "Anders"],
];

const demoReports = [
  { city: "Amsterdam", lat: 52.3676, lng: 4.9041, text: "Intimidatie rond het station laat in de avond.", severity: 3 },
  { city: "Rotterdam", lat: 51.9225, lng: 4.47917, text: "Onveilig gevoel door achtervolging in centrum.", severity: 4 },
  { city: "Utrecht", lat: 52.0907, lng: 5.1214, text: "Slechte verlichting en nare opmerkingen.", severity: 2 },
  { city: "Den Haag", lat: 52.0705, lng: 4.3007, text: "Onveilige groep bij tramhalte.", severity: 3 },
  { city: "Breda", lat: 51.5719, lng: 4.7683, text: "Bedreigende sfeer in uitgaansgebied.", severity: 4 },
];

async function main() {
  for (const [key, labelNl] of categories) {
    await prisma.reportCategory.upsert({
      where: { key },
      update: {},
      create: { key, labelNl, labelEn: key },
    });
  }

  for (const report of demoReports) {
    const created = await prisma.report.create({
      data: {
        publicId: randomUUID(),
        latitudeProtected: String(report.lat),
        longitudeProtected: String(report.lng),
        publicLatitude: report.lat,
        publicLongitude: report.lng,
        locationLabel: report.city,
        city: report.city,
        municipality: report.city,
        country: "NL",
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        description: report.text,
        severity: report.severity,
        isAnonymous: true,
        isPublic: true,
        isDemoData: true,
        status: ReportStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    const category = await prisma.reportCategory.findFirst({ where: { key: "intimidation" } });
    if (category) {
      await prisma.reportCategoryRelation.create({
        data: { reportId: created.id, categoryId: category.id },
      });
    }
  }

  await prisma.emergencyResource.createMany({
    data: [
      {
        countryCode: "NL",
        type: "EMERGENCY",
        title: "Spoed",
        phone: "112",
        description: "Bel 112 bij direct gevaar.",
        locale: "nl",
      },
      {
        countryCode: "NL",
        type: "NON_EMERGENCY",
        title: "Politie (geen spoed)",
        phone: "0900-8844",
        locale: "nl",
      },
      {
        countryCode: "NL",
        type: "SUPPORT",
        title: "Slachtofferhulp Nederland",
        phone: "0900-0101",
        url: "https://www.slachtofferhulp.nl/",
        locale: "nl",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.user.upsert({
    where: { email: "admin@nachtveilig.local" },
    update: {},
    create: {
      email: "admin@nachtveilig.local",
      passwordHash: "$2b$12$QfLkrpG0DmM8AmlNlQzW7ejT7gJfHk0jZPj2xQWqSbnln3EVS0e/K",
      role: "ADMIN",
      name: "Admin",
    },
  });
}

main().finally(async () => prisma.$disconnect());
