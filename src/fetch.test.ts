import { vi, afterEach, describe, test, expect } from "vitest";
import { fetchShelf, fetchWidgetShelf } from "./fetch.js";
import { SortChoice } from "./ordering.js";

const mockData = "text";
const timeoutError = new DOMException("Request timed out", "TimeoutError");
const response = new Response("valid response", {
  status: 200,
});

describe("fetchShelf", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("successful retrieval", async () => {
    const signalMatcher: unknown = expect.any(AbortSignal);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => mockData,
      }),
    );

    const data = await fetchShelf("123", "read");

    expect(data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      new URL("https://www.goodreads.com/review/list_rss/123?shelf=read"),
      { signal: signalMatcher },
    );
  });

  test("shelf encoding", async () => {
    const signalMatcher: unknown = expect.any(AbortSignal);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => mockData,
      }),
    );

    const data = await fetchShelf("123", "#read");

    expect(data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      new URL("https://www.goodreads.com/review/list_rss/123?shelf=%23read"),
      { signal: signalMatcher },
    );
  });

  test("HTTP failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(fetchShelf("123", "read")).rejects.toThrow(
      "HTTP error! Status: 500",
    );
  });

  test("network failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(
      new Error("Network failure"),
    );
    await expect(fetchShelf("123", "read")).rejects.toThrow("Network failure");
  });

  test("body reading failure", async () => {
    vi.spyOn(response, "text").mockRejectedValue(
      new Error("Failed to read body"),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    await expect(fetchShelf("123", "read")).rejects.toThrow(
      "Failed to read body",
    );
  });

  test("timeout before response", async () => {
    const abortController = new AbortController();
    const timeoutSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(abortController.signal);

    const fetchMock = vi.fn<typeof fetch>((_input, init) => {
      const signal = init?.signal;
      return new Promise<Response>((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(timeoutError));
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const shelfPromise = fetchShelf("123", "read");
    abortController.abort(timeoutError);
    await expect(shelfPromise).rejects.toThrow("Request timed out");
    expect(timeoutSpy).toHaveBeenCalledWith(5000);
  });

  test("timeout during body reading", async () => {
    const abortController = new AbortController();
    const timeoutSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(abortController.signal);

    let bodyStartedResolve!: () => void;
    const bodyStarted = new Promise<void>((resolve) => {
      bodyStartedResolve = resolve;
    });
    const fetchMock = vi.fn<typeof fetch>((_input, init) => {
      const signal = init?.signal;
      const response = new Response();
      vi.spyOn(response, "text").mockImplementation(
        () =>
          new Promise<string>((_resolve, reject) => {
            bodyStartedResolve();
            signal?.addEventListener("abort", () => {
              reject(timeoutError);
            });
          }),
      );
      return Promise.resolve(response);
    });
    vi.stubGlobal("fetch", fetchMock);

    const shelfPromise = fetchShelf("123", "read");
    const rejectText =
      expect(shelfPromise).rejects.toThrow("Request timed out");
    await bodyStarted;
    abortController.abort(timeoutError);
    await rejectText;
    expect(timeoutSpy).toHaveBeenCalledWith(5000);
  });
});

describe("fetchWidgetShelf", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("successful retrieval", async () => {
    const signalMatcher: unknown = expect.any(AbortSignal);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(mockData, {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchWidgetShelf(
      "123",
      "456",
      "read",
      SortChoice.DateAdded,
      5,
    );

    expect(fetch).toHaveBeenCalledOnce();
    const call = fetchMock.mock.calls[0];
    if (!call) {
      expect.fail("call undefined");
    }
    const [request, options] = call;
    if (!(request instanceof URL)) {
      expect.fail("fetch mock did not contain URL");
    }
    expect(data).toEqual(mockData);
    expect(options).toEqual({ signal: signalMatcher });
    expect(request.origin).toBe("https://www.goodreads.com");
    expect(request.pathname).toBe(
      "/review/custom_widget/123.goodreads-readme-action",
    );
    expect(request.searchParams.get("widget_id")).toBe("456");
    expect(request.searchParams.get("shelf")).toBe("read");
    expect(request.searchParams.get("order")).toBe("d");
    expect(request.searchParams.get("sort")).toBe("date_added");
    expect(request.searchParams.get("num_books")).toBe("5");
    expect(request.searchParams.get("show_title")).toBe("1");
    expect(request.searchParams.get("show_author")).toBe("1");
    expect(request.searchParams.get("show_rating")).toBe("1");
  });

  test("sort choice date read, limit 10", async () => {
    const signalMatcher: unknown = expect.any(AbortSignal);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(mockData, {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchWidgetShelf(
      "123",
      "456",
      "read",
      SortChoice.DateRead,
      10,
    );

    expect(fetch).toHaveBeenCalledOnce();
    const call = fetchMock.mock.calls[0];
    if (!call) {
      expect.fail("call undefined");
    }
    const [request, options] = call;
    if (!(request instanceof URL)) {
      expect.fail("fetch mock did not contain URL");
    }
    expect(data).toEqual(mockData);
    expect(options).toEqual({ signal: signalMatcher });
    expect(request.origin).toBe("https://www.goodreads.com");
    expect(request.pathname).toBe(
      "/review/custom_widget/123.goodreads-readme-action",
    );
    expect(request.searchParams.get("widget_id")).toBe("456");
    expect(request.searchParams.get("shelf")).toBe("read");
    expect(request.searchParams.get("order")).toBe("d");
    expect(request.searchParams.get("sort")).toBe("date_read");
    expect(request.searchParams.get("num_books")).toBe("10");
    expect(request.searchParams.get("show_title")).toBe("1");
    expect(request.searchParams.get("show_author")).toBe("1");
    expect(request.searchParams.get("show_rating")).toBe("1");
  });

  test("shelf encoding", async () => {
    const signalMatcher: unknown = expect.any(AbortSignal);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(mockData, {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchWidgetShelf(
      "123",
      "456",
      "#currently-reading",
      SortChoice.DateAdded,
      10,
    );

    expect(fetch).toHaveBeenCalledOnce();
    const call = fetchMock.mock.calls[0];
    if (!call) {
      expect.fail("call undefined");
    }
    const [request, options] = call;
    if (!(request instanceof URL)) {
      expect.fail("fetch mock did not contain URL");
    }
    expect(data).toEqual(mockData);
    expect(options).toEqual({ signal: signalMatcher });
    expect(request.origin).toBe("https://www.goodreads.com");
    expect(request.pathname).toBe(
      "/review/custom_widget/123.goodreads-readme-action",
    );
    expect(request.searchParams.get("widget_id")).toBe("456");
    expect(request.searchParams.get("shelf")).toBe("#currently-reading");
    expect(request.searchParams.get("order")).toBe("d");
    expect(request.searchParams.get("sort")).toBe("date_added");
    expect(request.searchParams.get("num_books")).toBe("10");
    expect(request.searchParams.get("show_title")).toBe("1");
    expect(request.searchParams.get("show_author")).toBe("1");
    expect(request.searchParams.get("show_rating")).toBe("1");
  });

  test("HTTP failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(
      fetchWidgetShelf("123", "456", "read", SortChoice.DateAdded, 5),
    ).rejects.toThrow("HTTP error! Status: 500");
  });

  test("network failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(
      new Error("Network failure"),
    );
    await expect(
      fetchWidgetShelf("123", "456", "read", SortChoice.DateAdded, 5),
    ).rejects.toThrow("Network failure");
  });

  test("body reading failure", async () => {
    vi.spyOn(response, "text").mockRejectedValue(
      new Error("Failed to read body"),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    await expect(
      fetchWidgetShelf("123", "456", "read", SortChoice.DateAdded, 5),
    ).rejects.toThrow("Failed to read body");
  });

  test("timeout before response", async () => {
    const abortController = new AbortController();
    const timeoutSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(abortController.signal);

    const fetchMock = vi.fn<typeof fetch>((_input, init) => {
      const signal = init?.signal;
      return new Promise<Response>((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(timeoutError));
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const shelfPromise = fetchWidgetShelf(
      "123",
      "456",
      "read",
      SortChoice.DateAdded,
      5,
    );
    abortController.abort(timeoutError);
    await expect(shelfPromise).rejects.toThrow("Request timed out");
    expect(timeoutSpy).toHaveBeenCalledWith(5000);
  });

  test("timeout during body reading", async () => {
    const abortController = new AbortController();
    const timeoutSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(abortController.signal);

    let bodyStartedResolve!: () => void;
    const bodyStarted = new Promise<void>((resolve) => {
      bodyStartedResolve = resolve;
    });
    const fetchMock = vi.fn<typeof fetch>((_input, init) => {
      const signal = init?.signal;
      const response = new Response();
      vi.spyOn(response, "text").mockImplementation(
        () =>
          new Promise<string>((_resolve, reject) => {
            bodyStartedResolve();
            signal?.addEventListener("abort", () => {
              reject(timeoutError);
            });
          }),
      );
      return Promise.resolve(response);
    });
    vi.stubGlobal("fetch", fetchMock);

    const shelfPromise = fetchWidgetShelf(
      "123",
      "456",
      "read",
      SortChoice.DateAdded,
      5,
    );
    const rejectText =
      expect(shelfPromise).rejects.toThrow("Request timed out");
    await bodyStarted;
    abortController.abort(timeoutError);
    await rejectText;
    expect(timeoutSpy).toHaveBeenCalledWith(5000);
  });
});
