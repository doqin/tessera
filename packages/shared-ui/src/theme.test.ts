import { THEME_STORAGE_KEY, applyTheme, currentTheme, readStoredTheme, toggleTheme } from "./theme";

describe("theme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("defaults to light when nothing is stored", () => {
    expect(readStoredTheme()).toBe("light");
  });

  it("reads a stored theme", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(readStoredTheme()).toBe("dark");
  });

  it("ignores invalid stored values", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "neon");
    expect(readStoredTheme()).toBe("light");
  });

  it("applies the theme to <html> and persists it", () => {
    expect(applyTheme("dark")).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("reads the theme currently applied to <html>", () => {
    document.documentElement.dataset.theme = "dark";
    expect(currentTheme()).toBe("dark");
  });

  it("falls back to the stored theme when no data-theme is applied", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(currentTheme()).toBe("dark");
  });

  it("toggles between light and dark", () => {
    expect(toggleTheme()).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(toggleTheme()).toBe("light");
  });

  it("ignores a blocked localStorage instead of throwing", () => {
    const original = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => undefined,
        removeItem: () => undefined,
      },
    });
    expect(readStoredTheme()).toBe("light");
    Object.defineProperty(window, "localStorage", { configurable: true, value: original });
  });
});
