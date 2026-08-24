import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HulpPage() {
  const resources = await prisma.emergencyResource
    .findMany({ where: { countryCode: "NL", locale: "nl", isActive: true } })
    .catch(() => []);
  return (
    <div className="container-page space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Hulp</h1>
      <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
        Ben je nu in direct gevaar? Neem direct contact op met de hulpdiensten.
      </p>
      {resources.map((item) => (
        <article key={item.id} className="card">
          <p className="text-xs">{item.type}</p>
          <h2 className="font-semibold">{item.title}</h2>
          {item.phone ? <p>{item.phone}</p> : null}
          {item.description ? <p className="text-sm">{item.description}</p> : null}
          {item.url ? <a href={item.url} className="text-brand-700 underline">{item.url}</a> : null}
        </article>
      ))}
    </div>
  );
}
