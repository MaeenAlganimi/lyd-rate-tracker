"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CURRENCIES } from "@/lib/currencies";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

export function AdminForm({ dict, locale, demoMode }: { dict: Dictionary; locale: Locale; demoMode: boolean }) {
  const router = useRouter();
  const [token, setToken] = useState(demoMode ? "demo-admin" : "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("saving");
    setMessage("");
    const response = await fetch("/api/admin/rates", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        currency: form.get("currency"),
        date: form.get("date"),
        kind: form.get("kind"),
        lydPerUnit: form.get("lydPerUnit"),
        note: form.get("note"),
      }),
    });
    const payload = (await response.json()) as { error?: { message: string } };
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error?.message ?? "Error");
      return;
    }
    setStatus("saved");
    setMessage(dict.adminSaved);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="panel grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
      {demoMode ? <p className="sm:col-span-2 text-sm leading-6 text-sample">{dict.adminDemo}</p> : null}
      <label className="grid gap-1 text-sm">
        {dict.adminToken}
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2"
          autoComplete="off"
          required
        />
      </label>
      <label className="grid gap-1 text-sm">
        {dict.adminCurrency}
        <select name="currency" className="rounded-lg border border-line bg-white px-3 py-2" defaultValue="USD">
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} — {locale === "ar" ? currency.nameAr : currency.nameEn}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        {dict.adminDate}
        <input name="date" type="date" required className="rounded-lg border border-line bg-white px-3 py-2" defaultValue="2026-10-08" />
      </label>
      <label className="grid gap-1 text-sm">
        {dict.adminKind}
        <select name="kind" className="rounded-lg border border-line bg-white px-3 py-2" defaultValue="official">
          <option value="official">{dict.adminKindOfficial}</option>
          <option value="parallel">{dict.adminKindParallel}</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        {dict.adminRate}
        <input
          name="lydPerUnit"
          inputMode="decimal"
          required
          placeholder="6.4287"
          className="rounded-lg border border-line bg-white px-3 py-2 tabular-nums"
        />
      </label>
      <label className="grid gap-1 text-sm">
        {dict.adminNote}
        <input name="note" className="rounded-lg border border-line bg-white px-3 py-2" maxLength={500} />
      </label>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper" disabled={status === "saving"}>
          {status === "saving" ? dict.adminSaving : dict.adminSubmit}
        </button>
        {message ? <p className={status === "error" ? "text-sm text-copper" : "text-sm text-sea"}>{message}</p> : null}
      </div>
    </form>
  );
}
