import { IMultipleRequest, IRequest, ISingleRequest } from "..";
import {
  MultipleRequestSchema,
  RequestSchema,
  SingleRequestSchema,
} from "../request";

export function isSingleRequest(request: unknown): request is ISingleRequest {
  return SingleRequestSchema.safeParse(request).success;
}

export function isMultipleRequest(
  requests: unknown
): requests is IMultipleRequest {
  return MultipleRequestSchema.safeParse(requests).success;
}

export function isRequest(request: unknown): request is IRequest {
  return RequestSchema.safeParse(request).success;
}
