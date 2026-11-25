import { Modal, Result } from 'antd';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { showNotice } from '../../../components/ui/noticeStore';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { ApiError } from '../../../lib/api/client';
import { formatTime } from '../../../utils/formatDate';
import { saveJudgment } from '../../inspections/api';
import { decisionLabels, errorTypeLabels } from '../../inspections/constants';
import { isMaskingBlocked } from '../../inspections/masking';
import { findDevice, selectDeviceTimeline, useInspectionStore } from '../../inspections/useInspectionStore';
import { ImageViewer } from '../components/ImageViewer';
import { JudgmentForm, type JudgmentFormHandle } from '../components/JudgmentForm';
import { JudgmentInfo } from '../components/JudgmentInfo';
import { NeighborCaptures } from '../components/NeighborCaptures';
import { canJudge, emptyValues, isDirty, saveErrorMessage, toInput, validate, type FieldError, type FormValues } from '../judgmentRules';
import { useReturnTarget } from '../useReturnTarget';

// S-04 이상 약포지 판정. 직전·직후로 이동하면 id를 key로 줘서 폼을 새 검수 건 기준으로 초기화한다.
export function JudgmentPage() {
  const { id = '' } = useParams();
  return <JudgmentScreen key={id} id={id} />;
}

function JudgmentScreen({ id }: { id: string }) {
  usePageTitle('약포지 판정');
  const { inspections, devices } = useInspectionStore();
  const item = inspections.find(row => row.id === id);
  const device = item ? findDevice(devices, item.deviceId) : undefined;
  const { target, entryState } = useReturnTarget();
  const navigate = useNavigate();
  const [modal, modalHolder] = Modal.useModal();

  const [values, setValues] = useState<FormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const formRef = useRef<JudgmentFormHandle>(null);
  const editable = item ? canJudge(item) : false;
  const dirty = editable && isDirty(values);

  // 저장하지 않은 입력이 있으면 새로고침·탭 닫기 전에 경고한다.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /** 앱 안 링크 이동 전 확인. 새 탭 열기(Cmd/Ctrl·가운데 클릭)는 막지 않는다. */
  function guardNavigation(event: MouseEvent<HTMLAnchorElement>, to: string, state?: unknown) {
    if (!dirty && !savingRef.current) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    modal.confirm({
      title: savingRef.current ? '판정을 저장하는 중입니다' : '저장하지 않은 판정이 있습니다',
      content: '이동하면 입력한 내용이 사라지고 이 약포지는 미확인으로 남습니다.',
      okText: '저장하지 않고 이동',
      cancelText: '계속 입력',
      onOk: () => navigate(to, { state }),
    });
  }

  if (!item) {
    return (
      <Result
        status="404"
        title="검수 건을 찾을 수 없습니다"
        subTitle={`요청한 검수 건(${id})이 없거나 삭제됐습니다. 목록에서 다시 선택하세요.`}
        extra={<Link className="button-link" to={target.to}>{target.label}</Link>}
      />
    );
  }

  const timeline = selectDeviceTimeline(inspections, item.deviceId);
  const index = timeline.findIndex(row => row.id === item.id);
  const blocked = isMaskingBlocked(item, device);

  function updateValues(patch: Partial<FormValues>) {
    setValues(current => ({ ...current, ...patch }));
    setFieldErrors(current => current.filter(error => !(error.field in patch) && !(patch.decision && error.field === 'errorType' && patch.decision !== 'error')));
    setSaveError(null);
  }

  async function handleSave() {
    if (!item || savingRef.current) return; // 저장 중 재요청 무시(완료 조건 5)
    const errors = validate(values);
    setFieldErrors(errors);
    if (errors.length) {
      formRef.current?.focusField(errors[0].field);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await saveJudgment(item.id, toInput(values, item.version, crypto.randomUUID()));
      const saved = result.inspection.judgment!;
      const parts = [
        `${item.deviceName} ${item.sequenceNo} 판정이 저장됐습니다`,
        decisionLabels[saved.decision],
        saved.errorType ? errorTypeLabels[saved.errorType] : null,
        saved.judgedBy,
        formatTime(saved.judgedAt),
        `미확인 ${result.unconfirmedCount}건 남음`,
      ];
      savingRef.current = false;
      showNotice(parts.filter(Boolean).join(' · '), target.pathname);
      navigate(target.to); // D-003 들어온 화면으로 자동 복귀
    } catch (cause) {
      savingRef.current = false;
      setSaving(false);
      setSaveError(saveErrorMessage(cause instanceof ApiError ? cause.kind : 'server'));
      requestAnimationFrame(() => formRef.current?.focusSaveError());
    }
  }

  return (
    <div className="screen-stack">
      {modalHolder}
      <div className="screen-heading">
        <div>
          <Link to={target.to} onClick={event => guardNavigation(event, target.to)} className="back-link">← {target.label}</Link>
          <h1>{item.deviceName} · {item.sequenceNo} 약포지 판정</h1>
          <p className="muted">AI 결과를 확인하고 약사 판정을 기록하세요.</p>
        </div>
      </div>

      <div className="judgment-grid">
        <div className="screen-stack">
          <section className="panel" aria-labelledby="image-title">
            <div className="panel-heading">
              <h2 id="image-title">약포지 이미지</h2>
              <span className="muted">{item.sequenceNo} · {formatTime(item.capturedAt)}</span>
            </div>
            <ImageViewer item={item} device={device} />
          </section>
          <NeighborCaptures
            previous={timeline[index - 1]}
            next={timeline[index + 1]}
            device={device}
            entryState={entryState}
            onNavigate={(event, to) => guardNavigation(event, to, entryState)}
          />
        </div>

        <section className="panel" aria-labelledby="judgment-title">
          <h2 id="judgment-title">약사 판정</h2>
          <JudgmentInfo item={item} />
          {editable ? (
            <>
              {blocked && <p className="notice-inline">이미지가 차단된 건입니다. 실물 약포지를 직접 확인한 뒤 판정하세요.</p>}
              <JudgmentForm ref={formRef} values={values} onChange={updateValues} fieldErrors={fieldErrors} saving={saving} saveError={saveError} onSave={handleSave} />
            </>
          ) : (
            <p className="notice-inline" role="note">
              {item.aiResult === 'match'
                ? 'AI가 개수 일치로 본 약포지입니다. 약사 판정 대상이 아닙니다.'
                : '이미 판정된 약포지입니다. 판정 변경(재판정)은 이후 단계에서 제공합니다.'}
            </p>
          )}
          <p className="muted small">시연 데이터로만 저장되며 새로고침하면 초기화됩니다.</p>
        </section>
      </div>
    </div>
  );
}
