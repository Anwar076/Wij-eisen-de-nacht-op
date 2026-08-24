import { prisma } from "@/lib/prisma";

export class NotificationService {
  static async createAlert(userId: string, title: string, body: string) {
    return prisma.notification.create({
      data: { userId, title, body, type: "SAFETY_ALERT" },
    });
  }
}
