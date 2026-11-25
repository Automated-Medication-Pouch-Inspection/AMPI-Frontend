import { Button } from 'antd';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { clearNotice, getNotice, useNotice } from './noticeStore';

// 저장 결과 안내(D-003). 영역은 항상 렌더링해 두어 문구가 바뀔 때 스크린 리더가 읽게 한다.
export function FlashNotice() {
  const notice = useNotice();
  const { pathname } = useLocation();

  // 안내 대상 화면이 아닌 곳으로 이동하면 지운다.
  useEffect(() => {
    const current = getNotice();
    if (current && current.path !== pathname) clearNotice();
  }, [pathname]);

  const visible = notice && notice.path === pathname ? notice : null;
  return (
    <div role="status" aria-live="polite" className="flash-region">
      {visible && (
        <div className="flash-notice" key={visible.id}>
          <span>{visible.message}</span>
          <Button type="text" onClick={clearNotice}>안내 닫기</Button>
        </div>
      )}
    </div>
  );
}
