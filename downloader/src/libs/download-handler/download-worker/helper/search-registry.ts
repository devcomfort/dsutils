import { Registry } from "~/libs/address";
import { DownloadRequest } from "../../schema";

const searchRegistry = (request: DownloadRequest) => {
  const { url } = request;
  return new Registry().getTransformedHosts(url);
};

export default searchRegistry;
