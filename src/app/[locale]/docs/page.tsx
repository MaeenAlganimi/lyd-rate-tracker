import { notFound } from "next/navigation";

import { openApiSpec } from "@/lib/api/openapi";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locale";

type Parameter = {
  name: string;
  in: string;
  required?: boolean;
  schema?: { type?: string; default?: string; enum?: readonly string[] };
};

type Operation = {
  summary?: string;
  description?: string;
  parameters?: readonly Parameter[];
  security?: unknown;
};

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const paths = openApiSpec.paths;

  return (
    <article className="mx-auto grid max-w-3xl gap-6 px-5 py-10">
      <header>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{dict.docsTitle}</h1>
        <p className="mt-4 text-lg leading-8 text-ink-soft">{dict.docsLede}</p>
        <p className="mt-3 text-sm">
          <a className="font-semibold text-sea" href="/api/openapi.json">
            {dict.docsSpec}
          </a>
        </p>
      </header>
      {Object.entries(paths).map(([path, methods]) =>
        Object.entries(methods).map(([method, operation]) => {
          const spec = operation as Operation;
          return (
            <section key={`${method} ${path}`} className="panel rounded-2xl p-5">
              <p className="font-mono text-sm">
                <span className="me-2 rounded-full bg-sea px-2 py-0.5 text-xs font-semibold uppercase text-white">{method}</span>
                {path}
              </p>
              <h2 className="mt-3 text-xl font-semibold">{spec.summary}</h2>
              {spec.description ? <p className="mt-2 text-sm leading-6 text-ink-soft">{spec.description}</p> : null}
              {spec.parameters && spec.parameters.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {spec.parameters.map((parameter) => (
                    <li key={parameter.name}>
                      <code>{parameter.name}</code>
                      {parameter.required ? " *" : ""} — {parameter.schema?.type ?? "string"}
                      {parameter.schema?.default ? ` · ${parameter.schema.default}` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        }),
      )}
    </article>
  );
}
