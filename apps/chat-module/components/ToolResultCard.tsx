"use client";

import { Icon, useT } from "@tessera/shared-ui";

export interface ToolResultCardProps {
  name: string;
  result: unknown;
  durationMs?: number;
  status?: "success" | "error";
}

interface WeatherResult {
  city: string;
  temperatureC: number;
  condition?: string;
}

interface DocResult {
  title: string;
  snippet?: string;
}

function asWeather(result: unknown): WeatherResult | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) return null;
  const value = result as Record<string, unknown>;
  if (typeof value.city !== "string" || typeof value.temperatureC !== "number") return null;
  return {
    city: value.city,
    temperatureC: value.temperatureC,
    condition: typeof value.condition === "string" ? value.condition : undefined,
  };
}

function asDocs(result: unknown): DocResult[] | null {
  if (!Array.isArray(result) || result.length === 0) return null;
  if (!result.every((item) => item && typeof item === "object" && typeof item.title === "string")) {
    return null;
  }
  return result.map((item) => {
    const value = item as Record<string, unknown>;
    return {
      title: String(value.title),
      snippet: typeof value.snippet === "string" ? value.snippet : undefined,
    };
  });
}

/**
 * Kết quả tool hiển thị ngay trong bong bóng chat: người xem demo thấy agent đã lấy được gì,
 * không phải chuyển sang Dashboard rồi tự suy ra. Dashboard vẫn giữ vai trò lịch sử/đo lường.
 */
export function ToolResultCard({
  name,
  result,
  durationMs,
  status = "success",
}: ToolResultCardProps) {
  const t = useT();
  const weather = asWeather(result);
  const docs = weather ? null : asDocs(result);

  return (
    <div className="ts-toolcard" data-tool={name}>
      <div className="ts-toolcard__head">
        <Icon name="tool" size={12} />
        <span className="ts-toolcard__name">{name}</span>
        <span className="ts-toolcard__meta">
          {status === "error" ? t("chat.toolFailed") : t("chat.toolResult")}
          {typeof durationMs === "number" ? ` · ${durationMs} ms` : ""}
        </span>
      </div>

      {weather ? (
        <p className="ts-toolcard__result">
          {weather.city} · <strong>{weather.temperatureC}°C</strong>
          {weather.condition ? ` · ${weather.condition}` : ""}
        </p>
      ) : docs ? (
        <ul className="ts-toolcard__list">
          {docs.map((doc) => (
            <li key={doc.title}>
              {doc.title}
              {doc.snippet ? <span className="ts-toolcard__meta"> — {doc.snippet}</span> : null}
            </li>
          ))}
        </ul>
      ) : typeof result === "string" || typeof result === "number" ? (
        <p className="ts-toolcard__result">{String(result)}</p>
      ) : (
        <pre className="ts-toolcard__json">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
