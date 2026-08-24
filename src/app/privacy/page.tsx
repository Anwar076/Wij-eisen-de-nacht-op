export default function PrivacyPage() {
  return (
    <div className="container-page py-6">
      <article className="card space-y-3 text-sm">
        <h1 className="text-2xl font-semibold">Privacy</h1>
        <p>We verzamelen alleen gegevens die nodig zijn om meldingen en veiligheidsfuncties te laten werken.</p>
        <p>Openbaar zichtbaar: categorie, benaderde locatie, tijd, beschrijving en ernstniveau.</p>
        <p>Privé: exacte locatie, bewijsbestanden, abuse-preventie identifiers en accountgegevens.</p>
        <p>Kaartlocaties worden geanonimiseerd via een radius zodat de exacte plek niet publiek zichtbaar is.</p>
        <p>Live locatiesessies zijn tijdelijk en verlopen automatisch.</p>
        <p>Je kunt verwijderverzoeken indienen via support en moderators houden audit-logs bij voor acties.</p>
      </article>
    </div>
  );
}
