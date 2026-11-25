import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { formatShortTime } from '../../utils/formatDate';

// 브라우저 연결 배너. 장비 오프라인은 장비 카드에만 표시하고 이 배너에 섞지 않는다.
export function ConnectionBanner() {
  const { online, offlineSince } = useOnlineStatus();
  return (
    <div role="status" aria-live="assertive" className="connection-region">
      {!online && (
        <div className="connection-banner">
          <strong>이 브라우저의 네트워크 연결이 끊겼습니다</strong>
          <span>
            화면은 마지막 갱신 {offlineSince ? formatShortTime(offlineSince) : '—'} 기준입니다. 연결될 때까지 판정을 저장할 수 없으며, 입력한 내용은 유지됩니다.
          </span>
        </div>
      )}
    </div>
  );
}
