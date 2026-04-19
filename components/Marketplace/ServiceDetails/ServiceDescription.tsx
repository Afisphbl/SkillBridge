type ServiceDescriptionProps = {
  description?: string;
  tags?: unknown;
  features?: unknown;
};

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter(
      (tag): tag is string => typeof tag === "string" && Boolean(tag.trim()),
    );
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeFeatures(features: unknown): string[] {
  if (Array.isArray(features)) {
    return features.filter(
      (feature): feature is string =>
        typeof feature === "string" && Boolean(feature.trim()),
    );
  }

  if (typeof features === "string") {
    return features
      .split("\n")
      .map((feature) => feature.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }

  return [];
}

export default function ServiceDescription({
  description,
  tags,
  features,
}: ServiceDescriptionProps) {
  const normalizedTags = normalizeTags(tags);
  const normalizedFeatures = normalizeFeatures(features);

  return (
    <section className="space-y-5 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-(--text-primary)">
          About this service
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-(--text-secondary)">
          {description || "No description provided for this service yet."}
        </p>
      </div>

      {normalizedTags.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-(--text-primary)">Tags</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {normalizedTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-(--color-primary)/30 bg-(--color-primary)/12 px-3 py-1 text-xs font-medium text-(--color-primary)"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {normalizedFeatures.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-(--text-primary)">
            What&apos;s included
          </h3>
          <ul className="mt-2 space-y-2 text-sm text-(--text-secondary)">
            {normalizedFeatures.map((feature) => (
              <li
                key={feature}
                className="rounded-md bg-(--bg-secondary) px-3 py-2"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
