/**
 * URL Handler
 */

/**
 * 원본 URL을 입력하면, 미러 서버의 유효성을 확인 후 반환함
 * @param url
 */
export default function (url: string) {
  try {
    const _url = new URL(url);
    _url.host = "dcms.dongseo.ac.kr";
    _url.port = "";

    return _url.toString();
  } catch (err) {
    console.error(err);
    return;
  }
}
