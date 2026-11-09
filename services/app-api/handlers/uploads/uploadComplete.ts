import { StateAbbr, UploadStatus } from "@datasets/shared";
import s3Lib from "../../libs/s3-lib";
import { updateUploadStatus } from "../../storage/uploads";
import { isLocalStack } from "../../libs/localstack";
import { sendEmail } from "../../utils/notifications/email";
import { logger } from "../../libs/debug-lib";
import { ScannedFileInfo, ScanStatus } from "../../types/uploads";

/**
 * Write back to the dynamo Uploads table on S3 activity.
 * Triggering this lambda at all is proof of a completed upload.
 * Additionally tracks S3 Virus Scanning status.
 */
const s3EventHandler = () => {
  return async (event: AwsStreamEvent) => {
    console.debug(`Raw event: ${JSON.stringify(event, null, 2)}`);

    const updates: ScannedFileInfo[] = [];
    for (const record of event.Records ?? []) {
      const fileInfo = await handleRecord(record);
      if (fileInfo) {
        updates.push(fileInfo);
      }
    }

    for (const fileInfo of updates) {
      let status;

      switch (fileInfo.scanStatus) {
        case ScanStatus.NO_THREATS_FOUND:
          status = UploadStatus.COMPLETE;
          break;
        case ScanStatus.THREATS_FOUND:
          console.warn("Quarantined File Identified", fileInfo);
          status = UploadStatus.ERROR;
          break;
        case ScanStatus.FAILED:
        case ScanStatus.COMPLETED_WITH_ISSUES:
          status = UploadStatus.ERROR;
          break;
        default:
          status = UploadStatus.WORKING;
      }

      if (isLocalStack()) {
        // Change this locally to test other statuses if needed
        status = UploadStatus.COMPLETE;
      }

      // notify assigned users if file upload complete
      if (status === UploadStatus.COMPLETE) {
        try {
          await sendEmail(fileInfo);
        } catch (error) {
          // log and allow call to succeed even if email fails
          logger.error(error);
        }
      }

      console.info(`Marking ${fileInfo.state} ${fileInfo.fileId}: ${status}`);
      await updateUploadStatus(fileInfo.state, fileInfo.fileId, status); // This would be best as a batch in the future
    }
  };
};

/**
 * Translate an AWS stream event record into tags we care about
 */
const handleRecord = async (
  record: NonNullable<AwsStreamEvent["Records"]>[number]
) => {
  if ("s3" in record) {
    const { s3 } = record;
    const bucket = s3.bucket.name;
    const key = s3.object.key;

    // Skip zips, they are not tracked in db
    if (key.includes("zips/")) return;
    const object = await getFileInfo!(bucket, key);

    return object;
  }
};

/**
 * Parse file info from the file name and s3 tags. Includes quarantine info.
 */
const getFileInfo = async (bucket: string, key: string) => {
  const { TagSet } = await s3Lib.getObjectTagging({
    Bucket: bucket,
    Key: key,
  });

  // Virus Scan status
  let scanStatus = ScanStatus.RUNNING; // This may be nonexistent until completion. Default to Running for our own handling
  const scanTag = TagSet?.find(
    (tag) => tag.Key === "GuardDutyMalwareScanStatus"
  )?.Value;
  if (scanTag) {
    scanStatus = scanTag as ScanStatus;
  }

  /**
   *   NOTE: RHTP & Datasets differ here. RHTP Prefixed: RHTP/AK/reportId/fileId
   *     RHTP - RHTP/AK/reportId/fileId
   *     Datasets - AK/fileId
   */
  const fragments = key.split("/");
  const fileInfo: ScannedFileInfo = {
    state: fragments[0] as StateAbbr,
    fileId: fragments[1],
    scanStatus,
  };
  console.log(`File Info: ${fileInfo}`);
  return fileInfo;
};

export const handler = s3EventHandler();

type AwsStreamEvent = S3StreamEvent;

type S3StreamEvent = {
  Records?: S3StreamRecord[];
};
type S3StreamRecord = {
  eventSourceARN: string;
  eventName: string;
  eventTime: string;
  s3: {
    bucket: {
      arn: string;
      name: string;
    };
    object: {
      key: string;
      size?: number;
    };
  };
};
