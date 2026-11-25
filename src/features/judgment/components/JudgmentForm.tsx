import { Button, Checkbox, Input, Radio, Select } from 'antd';
import type { GetRef } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { decisionLabels, errorTypeLabels, errorTypes } from '../../inspections/constants';
import type { Decision, ErrorType } from '../../inspections/types';
import { isErrorDetailEnabled, type FieldError, type FieldName, type FormValues } from '../judgmentRules';

interface Props {
  values: FormValues;
  onChange: (patch: Partial<FormValues>) => void;
  fieldErrors: FieldError[];
  saving: boolean;
  saveError: string | null;
  onSave: () => void;
}

export interface JudgmentFormHandle { focusField: (field: FieldName) => void; focusSaveError: () => void }

// 판정 저장 버튼은 항상 활성(D-002). 저장 중에만 잠그고 "저장 중…"으로 표시한다.
export const JudgmentForm = forwardRef<JudgmentFormHandle, Props>(function JudgmentForm({ values, onChange, fieldErrors, saving, saveError, onSave }, ref) {
  const decisionRef = useRef<HTMLDivElement>(null);
  const errorTypeRef = useRef<GetRef<typeof Select>>(null);
  const saveErrorRef = useRef<HTMLDivElement>(null);
  const detailEnabled = isErrorDetailEnabled(values) && !saving;
  const errorFor = (field: FieldName) => fieldErrors.find(error => error.field === field);
  const decisionError = errorFor('decision');
  const errorTypeError = errorFor('errorType');

  useImperativeHandle(ref, () => ({
    focusField(field) {
      if (field === 'decision') {
        const inputs = decisionRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        const checked = Array.from(inputs ?? []).find(input => input.checked);
        (checked ?? inputs?.[0])?.focus();
      } else {
        errorTypeRef.current?.focus();
      }
    },
    focusSaveError() { saveErrorRef.current?.focus(); },
  }));

  return (
    <form className="form-stack" noValidate onSubmit={event => { event.preventDefault(); onSave(); }} aria-label="약사 판정 입력">
      <fieldset className="field" aria-describedby={decisionError ? 'decision-error' : 'decision-help'}>
        <legend>판정 선택 <span className="required">(필수)</span></legend>
        <div ref={decisionRef}>
          <Radio.Group
            name="decision"
            className="decision-options"
            optionType="button"
            buttonStyle="solid"
            value={values.decision}
            disabled={saving}
            aria-invalid={Boolean(decisionError)}
            onChange={event => onChange({ decision: event.target.value as Decision })}
            options={(['error', 'false-positive'] as Decision[]).map(value => ({ value, label: decisionLabels[value] }))}
          />
        </div>
        {decisionError
          ? <p id="decision-error" className="field-error">{decisionError.message}</p>
          : <p id="decision-help" className="muted small">방향키로 선택을 바꿀 수 있습니다.</p>}
      </fieldset>

      <div className="field">
        <label htmlFor="error-type">오류 유형 <span className="muted small">(실제 오류일 때 필수)</span></label>
        <Select<ErrorType>
          id="error-type"
          ref={errorTypeRef}
          className="full-width"
          placeholder="오류 유형 선택…"
          value={values.errorType}
          disabled={!detailEnabled}
          status={errorTypeError ? 'error' : undefined}
          aria-invalid={Boolean(errorTypeError)}
          aria-describedby={errorTypeError ? 'error-type-error' : undefined}
          onChange={value => onChange({ errorType: value })}
          options={errorTypes.map(value => ({ value, label: errorTypeLabels[value] }))}
        />
        {errorTypeError && <p id="error-type-error" className="field-error">{errorTypeError.message}</p>}
      </div>

      <div className="field">
        <label htmlFor="judgment-memo">메모 <span className="muted small">(선택)</span></label>
        <Input.TextArea
          id="judgment-memo"
          name="memo"
          autoComplete="off"
          value={values.memo}
          maxLength={500}
          showCount
          rows={3}
          readOnly={saving}
          onChange={event => onChange({ memo: event.target.value })}
          placeholder="예: 2번째 칸 정제 1정 부족 확인…"
        />
      </div>

      <Checkbox className="touch-checkbox" checked={values.actionDone} disabled={!detailEnabled} onChange={event => onChange({ actionDone: event.target.checked })}>
        조치 완료 <span className="muted small">(실제 오류에만 적용)</span>
      </Checkbox>

      <div className="save-row">
        <Button type="primary" htmlType="submit" size="large" loading={saving} aria-disabled={saving}>
          {saving ? '저장 중…' : '판정 저장'}
        </Button>
      </div>
      <div ref={saveErrorRef} tabIndex={-1} role="alert" className="save-error-region">
        {saveError && (
          <div className="save-error">
            <strong>판정을 저장하지 못했습니다</strong>
            <span>{saveError}</span>
            <span className="muted small">입력한 내용은 그대로 있습니다. 이 약포지는 미확인 상태로 남아 있습니다. 판정 저장을 다시 누르세요.</span>
          </div>
        )}
      </div>
    </form>
  );
});
