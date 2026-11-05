import { act, renderHook } from "@testing-library/react";
import { UploadStatus, UploadType } from "@datasets/shared";
import { useUploadStatusRefresh } from "./useUploadStatusRefresh";
import { getFileStatus } from "components/tables/FileStatus";

const file: UploadType = {
  fileId: "file-1",
  filename: "file.csv",
  datasetId: "dataset-1",
  uploadedUsername: "user",
  uploadedDate: "2026-10-22T12:00:00.000Z",
  state: "NY",
  filesize: 70011,
  uploadStatus: UploadStatus.PENDING,
};

describe("useUploadStatusRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(file.uploadedDate));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test.each([UploadStatus.PENDING, UploadStatus.WORKING])(
    "refreshes %s uploads after two minutes and repeats",
    async (uploadStatus) => {
      const refresh = vi.fn().mockResolvedValue(undefined);
      renderHook(() =>
        useUploadStatusRefresh([{ ...file, uploadStatus }], refresh)
      );
      await act(() => vi.advanceTimersByTimeAsync(120_000));
      expect(refresh).not.toHaveBeenCalled();
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(getFileStatus(file)).toBe(UploadStatus.ERROR);
      await act(() => vi.advanceTimersByTimeAsync(120_001));
      expect(refresh).toHaveBeenCalledTimes(2);
    }
  );

  test("stops when uploads resolve and cleans up on unmount", async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const { rerender, unmount } = renderHook(
      ({ files }) => useUploadStatusRefresh(files, refresh),
      { initialProps: { files: [file] } }
    );
    rerender({ files: [{ ...file, uploadStatus: UploadStatus.COMPLETE }] });
    await act(() => vi.advanceTimersByTimeAsync(120_001));
    expect(refresh).not.toHaveBeenCalled();
    rerender({ files: [file] });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("stops after a refresh when a pending upload displays as Error", async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ files }) => useUploadStatusRefresh(files, refresh),
      { initialProps: { files: [file] } }
    );
    await act(() => vi.advanceTimersByTimeAsync(120_001));
    expect(refresh).toHaveBeenCalledTimes(1);
    rerender({ files: [{ ...file }] });
    expect(getFileStatus(file)).toBe(UploadStatus.ERROR);
    expect(vi.getTimerCount()).toBe(0);
    await act(() => vi.advanceTimersByTimeAsync(240_002));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test("does not start polling for an already timed-out pending upload", () => {
    vi.setSystemTime(new Date(new Date(file.uploadedDate).getTime() + 120_001));
    const refresh = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useUploadStatusRefresh([file], refresh));
    expect(vi.getTimerCount()).toBe(0);
  });

  test("continues polling when another file is still processing", async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const files = [
      file,
      { ...file, fileId: "file-2", uploadStatus: UploadStatus.WORKING },
    ];
    const { rerender } = renderHook(() =>
      useUploadStatusRefresh(files, refresh)
    );
    await act(() => vi.advanceTimersByTimeAsync(120_001));
    rerender();
    await act(() => vi.advanceTimersByTimeAsync(120_001));
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  test("uses the latest refresh callback without resetting the timer", async () => {
    const first = vi.fn().mockResolvedValue(undefined);
    const latest = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ refresh }) => useUploadStatusRefresh([file], refresh),
      { initialProps: { refresh: first } }
    );
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    rerender({ refresh: latest });
    await act(() => vi.advanceTimersByTimeAsync(60_001));
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  test("does not overlap requests", async () => {
    let finish!: () => void;
    const refresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    renderHook(() => useUploadStatusRefresh([file], refresh));
    await act(() => vi.advanceTimersByTimeAsync(240_002));
    expect(refresh).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    await act(() => vi.advanceTimersByTimeAsync(120_001));
    expect(refresh).toHaveBeenCalledTimes(2);
    await act(async () => finish());
  });

  test("logs refresh failures and retries on the next interval", async () => {
    const error = new Error("Network unavailable");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const refresh = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue(undefined);
    renderHook(() => useUploadStatusRefresh([file], refresh));
    await act(() => vi.advanceTimersByTimeAsync(120_001));
    expect(log).toHaveBeenCalledWith(
      "Failed to refresh upload statuses",
      error
    );
    await act(() => vi.advanceTimersByTimeAsync(120_001));
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
