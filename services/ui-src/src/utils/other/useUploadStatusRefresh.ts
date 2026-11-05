import { useEffect, useRef } from "react";
import { UploadStatus, UploadType } from "@datasets/shared";
import { getFileStatus } from "components/tables/FileStatus";

export const useUploadStatusRefresh = (
  files: UploadType[],
  refresh: () => Promise<void>
) => {
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const hasInProgressUploads = files.some((file) => {
    const status = getFileStatus(file);
    return status === UploadStatus.PENDING || status === UploadStatus.WORKING;
  });

  useEffect(() => {
    if (!hasInProgressUploads) return;

    let refreshing = false;
    const timer = window.setInterval(async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        await refreshRef.current();
      } catch (error) {
        console.error("Failed to refresh upload statuses", error);
      } finally {
        refreshing = false;
      }
    }, 120001); // The pending timeout applies strictly after two minutes.

    return () => window.clearInterval(timer);
  }, [hasInProgressUploads]);
};
