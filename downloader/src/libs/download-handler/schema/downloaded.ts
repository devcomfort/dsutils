/**
 * 다운로드 된 데이터 인터페이스
 */
export interface Downloaded {
  /**
   * 다운로드 된 파일 (as Blob object)
   *
   * - Blob | File 객체 외의 타입이 입력되면 안 됨
   * - 파일 객체가 입력되기 전, `"downloaded"` 상태가 아닌 경우, undefined 형태로 유지될 수 있음
   */
  blob?: Blob;
}
