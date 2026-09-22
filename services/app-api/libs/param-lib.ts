import { isStateAbbr } from "@datasets/shared";
import { APIGatewayProxyEvent } from "../types/types";
import { logger } from "./debug-lib";

export const emptyParser = (_event: APIGatewayProxyEvent) => ({});

export const parseBannerId = (event: APIGatewayProxyEvent) => {
  const { bannerId } = event.pathParameters ?? {};
  if (!bannerId) {
    logger.warn("Invalid banner id in path");
    return undefined;
  }

  return { bannerId };
};

export const parseDatasetId = (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters ?? {};
  if (!id) {
    logger.warn("Invalid banner id in path");
    return undefined;
  }

  return { id };
};

export const parseDatasetFileUploadDownloadParameters = (
  event: APIGatewayProxyEvent
) => {
  const { state, id, fileId } = event.pathParameters ?? {};

  if (!isStateAbbr(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }

  if (!id || !fileId) {
    logger.warn("Missing file ID in path");
    return undefined;
  }

  return { state, id, fileId };
};

export const parseDatasetFileCreateParameters = (
  event: APIGatewayProxyEvent
) => {
  const { state, id } = event.pathParameters ?? {};

  if (!isStateAbbr(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }

  if (!id) {
    logger.warn("Missing file ID in path");
    return undefined;
  }

  return { state, id };
};

export const parseDatasetFileUploadParameters = (
  event: APIGatewayProxyEvent
) => {
  const { state } = event.pathParameters ?? {};

  if (!isStateAbbr(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }

  return { state };
};

export const parseZipIdParameters = (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters ?? {};

  if (!id) {
    logger.warn("Missing file ID in path");
    return undefined;
  }

  return { id };
};
