import { act, renderHook } from "@testing-library/react";
import { useCopy } from "./useCopy";

describe("useCopy", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("copies text and resets the copied flag after the timeout", async () => {
    const { result } = renderHook(() => useCopy(500));

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(false);
  });

  it("falls back to execCommand when the Clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const execCommand = jest.fn();
    Object.defineProperty(document, "execCommand", { value: execCommand, configurable: true });

    const { result } = renderHook(() => useCopy());
    await act(async () => {
      await result.current.copy("fallback");
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.copied).toBe(true);
  });

  it("still reports success when the clipboard rejects", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });

    const { result } = renderHook(() => useCopy());
    await act(async () => {
      await result.current.copy("nope");
    });
    expect(result.current.copied).toBe(true);
  });
});
