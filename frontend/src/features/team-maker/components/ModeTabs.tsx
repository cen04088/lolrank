import { AUTO_FILL_MODES, type AutoFillMode } from '@/api/types'
import { AUTO_FILL_MODE_LABELS } from '@/lib/labels'

interface ModeTabsProps {
  value: AutoFillMode
  onChange: (mode: AutoFillMode) => void
}

/** 배정 방식 선택 탭 (실력 균형 / 포지션 균형 / 완전 랜덤). 자동 채우기에만 영향을 준다. */
export function ModeTabs({ value, onChange }: ModeTabsProps) {
  return (
    <div className="modes">
      <span className="modes__label font-pixel-ko">배정 방식 선택</span>
      <div className="modes__tabs" role="tablist" aria-label="배정 방식">
        {AUTO_FILL_MODES.map((mode) => {
          const meta = AUTO_FILL_MODE_LABELS[mode]
          const selected = mode === value
          return (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={selected}
              className={selected ? 'modes__tab modes__tab--on' : 'modes__tab'}
              onClick={() => onChange(mode)}
              title={meta.hint}
            >
              <span aria-hidden>{meta.icon}</span>
              <span className="font-pixel-ko">{meta.label}</span>
            </button>
          )
        })}
      </div>
      <p className="modes__hint">{AUTO_FILL_MODE_LABELS[value].hint}</p>
    </div>
  )
}
