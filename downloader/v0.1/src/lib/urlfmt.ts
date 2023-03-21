import isURL from "./isurl";

const formatURL = (url: string) => {
  if (!isURL(url)) return new Error(`잘못된 URL 형식입니다`);

  const URLObject = new URL(url);
  URLObject.host = "dcms.dongseo.ac.kr";
  URLObject.port = "";

  return URLObject.toString();
};

export default formatURL;
export { formatURL };
