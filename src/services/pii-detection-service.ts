const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phone = /(\+?\d[\d\s\-()]{7,}\d)/;
const url = /https?:\/\/[^\s/$.?#].[^\s]*/i;
const licensePlate = /\b([A-Z]{2}-\d{2}-\d{2}|\d{2}-[A-Z]{3}-\d|\d-[A-Z]{3}-\d{2})\b/i;

export class PIIDetectionService {
  static detect(text: string): string[] {
    const reasons: string[] = [];
    if (email.test(text)) reasons.push("email");
    if (phone.test(text)) reasons.push("telefoonnummer");
    if (url.test(text)) reasons.push("url");
    if (licensePlate.test(text)) reasons.push("kenteken-achtig patroon");
    return reasons;
  }
}
