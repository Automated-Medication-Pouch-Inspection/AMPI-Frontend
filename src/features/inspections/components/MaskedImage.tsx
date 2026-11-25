import { formatTime } from '../../../utils/formatDate';
import { isMaskingBlocked } from '../masking';
import type { Device, Inspection } from '../types';

interface Props {
  item: Inspection;
  device: Device | undefined;
  size?: 'large' | 'small';
}

// 이미지를 보여주는 모든 곳은 이 컴포넌트를 거친다(계획 §3-3-1).
// 차단 시 <img>를 아예 렌더링하지 않는다. 흐림 처리나 CSS 숨김을 쓰지 않는다.
export function MaskedImage({ item, device, size = 'large' }: Props) {
  if (isMaskingBlocked(item, device)) {
    const reason = device?.maskingStatus !== 'ok' ? '장비 마스킹 실패' : item.image.maskingStatus === 'failed' ? '마스킹 실패' : '마스킹 상태 확인 불가';
    return (
      <div className={`image-placeholder image-blocked ${size}`} data-testid="masking-blocked">
        <strong>개인정보 보호를 위해 표시를 차단했습니다</strong>
        <small>{reason} · {item.deviceName} · {formatTime(item.capturedAt)} 촬영</small>
      </div>
    );
  }
  if (!item.image.url) {
    return <div className={`image-placeholder ${size}`}>이미지 없음<small>장비에서 이미지를 받지 못했습니다.</small></div>;
  }
  return (
    <img
      className={`capture-image ${size}`}
      src={item.image.url}
      width={640}
      height={400}
      alt={`${item.deviceName} ${item.sequenceNo} 약포지 촬영 이미지(시연)`}
      draggable={false}
    />
  );
}
