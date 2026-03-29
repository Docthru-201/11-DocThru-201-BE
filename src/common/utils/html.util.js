/**
 * HTML 본문·속성에 삽입할 사용자 제어 문자열을 이스케이프합니다.
 * JSON API 응답은 JSON 직렬화이므로 DOM XSS는 주로 프론트 책임입니다.
 */
export function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
