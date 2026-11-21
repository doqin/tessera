"use client";

import { Icon, useT, type IconName, type TranslationKey } from "@tessera/shared-ui";

interface Layer {
  kind: TranslationKey;
  name: TranslationKey;
  desc: TranslationKey;
  items: TranslationKey[];
  tone: "host" | "remote" | "shared";
  icon: IconName;
}

const LAYERS: Layer[] = [
  {
    kind: "overview.layer.kind.host",
    name: "overview.host.name",
    desc: "overview.host.desc",
    items: ["overview.host.item1", "overview.host.item2", "overview.host.item3"],
    tone: "host",
    icon: "layers",
  },
  {
    kind: "overview.layer.kind.remote",
    name: "overview.chat.name",
    desc: "overview.chat.desc",
    items: ["overview.chat.item1", "overview.chat.item2", "overview.chat.item3"],
    tone: "remote",
    icon: "chat",
  },
  {
    kind: "overview.layer.kind.remote",
    name: "overview.dash.name",
    desc: "overview.dash.desc",
    items: ["overview.dash.item1", "overview.dash.item2", "overview.dash.item3"],
    tone: "remote",
    icon: "dashboard",
  },
  {
    kind: "overview.layer.kind.shared",
    name: "overview.shared.name",
    desc: "overview.shared.desc",
    items: ["overview.shared.item1", "overview.shared.item2", "overview.shared.item3"],
    tone: "shared",
    icon: "layers",
  },
];

const STEPS: { title: TranslationKey; body: TranslationKey }[] = [
  { title: "overview.flow.1.title", body: "overview.flow.1.desc" },
  { title: "overview.flow.2.title", body: "overview.flow.2.desc" },
  { title: "overview.flow.3.title", body: "overview.flow.3.desc" },
  { title: "overview.flow.4.title", body: "overview.flow.4.desc" },
];

const DECISIONS: TranslationKey[] = [
  "overview.decisions.1",
  "overview.decisions.2",
  "overview.decisions.3",
  "overview.decisions.4",
];

/**
 * Overview — the architecture page, rebuilt as one sequenced stack.
 *
 * Two equal card grids (four layers, four steps) made the page a template.
 * A stack reads as containment: the shell at the top, the remotes under it,
 * the shared layer underneath both. The runtime flow is a single band, not a
 * second grid. The page is the report's "what is this thing" screen.
 */
export default function OverviewPage() {
  const t = useT();

  return (
    <div className="ts-overview">
      <header className="ts-page__head">
        <div>
          <h1 className="ts-page__title">{t("overview.title")}</h1>
          <p className="ts-page__sub">{t("overview.sub")}</p>
        </div>
      </header>

      <section className="ts-section" aria-labelledby="layers">
        <div className="ts-section__head">
          <h2 className="ts-section__title" id="layers">
            {t("overview.layers")}
          </h2>
          <span className="ts-section__hint">{t("overview.layersHint")}</span>
        </div>

        <ol className="ts-stack">
          {LAYERS.map((layer, index) => (
            <li key={layer.name} className={`ts-stack__row ts-stack__row--${layer.tone}`}>
              <span className="ts-stack__index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="ts-stack__body">
                <div className="ts-stack__kind">
                  <Icon name={layer.icon} size={13} />
                  {t(layer.kind)}
                </div>
                <div className="ts-stack__name">{t(layer.name)}</div>
                <p className="ts-stack__desc">{t(layer.desc)}</p>
                <ul className="ts-stack__list">
                  {layer.items.map((item) => (
                    <li key={item}>{t(item)}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="ts-section" aria-labelledby="flow">
        <div className="ts-section__head">
          <h2 className="ts-section__title" id="flow">
            {t("overview.flow")}
          </h2>
          <span className="ts-section__hint">{t("overview.flowHint")}</span>
        </div>
        <ol className="ts-flow">
          {STEPS.map((step, index) => (
            <li key={step.title} className="ts-flow__step">
              <span className="ts-flow__num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{t(step.title)}</strong>
              <span className="ts-flow__body">{t(step.body)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="ts-section" aria-labelledby="decisions">
        <div className="ts-section__head">
          <h2 className="ts-section__title" id="decisions">
            {t("overview.decisions")}
          </h2>
        </div>
        <ol className="ts-decisions">
          {DECISIONS.map((decision, index) => (
            <li key={decision}>
              <span className="ts-decisions__num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{t(decision)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
