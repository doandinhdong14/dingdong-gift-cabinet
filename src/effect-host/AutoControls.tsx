import React, { useState } from 'react';
import type { EffectControlDefinition, EffectControls } from '../effect-sdk/types';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface AutoControlsProps {
  controls: EffectControls;
  config: Record<string, any>;
  onChange: (newConfig: Record<string, any>) => void;
  disabled?: boolean;
}

export const AutoControls: React.FC<AutoControlsProps> = ({
  controls,
  config,
  onChange,
  disabled = false,
}) => {
  const updateField = (key: string, value: any) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="auto-controls-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Object.entries(controls).map(([key, def]) => {
        if (!def) return null;
        return (
          <ControlItem
            key={key}
            fieldKey={key}
            definition={def}
            value={config?.[key]}
            onChange={(val) => updateField(key, val)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};

interface ControlItemProps {
  fieldKey: string;
  definition: EffectControlDefinition;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
}

const ControlItem: React.FC<ControlItemProps> = ({
  definition,
  value,
  onChange,
  disabled,
}) => {
  const [collapsed, setCollapsed] = useState(
    definition.type === 'group' ? Boolean((definition as any).collapsed) : false
  );

  switch (definition.type) {
    case 'number': {
      const numVal = typeof value === 'number' && Number.isFinite(value) ? value : definition.min;
      const step = definition.step || (definition.max - definition.min <= 2 ? 0.01 : 1);
      return (
        <div className="control-field number-field" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <label style={{ fontWeight: 500, color: '#334155' }}>{definition.label}</label>
            <span style={{ color: '#64748b', fontFamily: 'monospace' }}>
              {numVal} {definition.unit || ''}
            </span>
          </div>
          {definition.description && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{definition.description}</p>
          )}
          <input
            type="range"
            min={definition.min}
            max={definition.max}
            step={step}
            value={numVal}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
        </div>
      );
    }

    case 'toggle': {
      const boolVal = Boolean(value);
      return (
        <div
          className="control-field toggle-field"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#334155' }}>{definition.label}</label>
            {definition.description && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{definition.description}</p>
            )}
          </div>
          <input
            type="checkbox"
            checked={boolVal}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', width: '18px', height: '18px' }}
          />
        </div>
      );
    }

    case 'color': {
      const strVal = typeof value === 'string' && value ? value : '#ffffff';
      return (
        <div
          className="control-field color-field"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#334155' }}>{definition.label}</label>
            {definition.description && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{definition.description}</p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>{strVal}</span>
            <input
              type="color"
              value={strVal}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                width: '32px',
                height: '32px',
                border: 'none',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      );
    }

    case 'text': {
      const textVal = typeof value === 'string' ? value : '';
      return (
        <div className="control-field text-field" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#334155' }}>{definition.label}</label>
          {definition.description && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{definition.description}</p>
          )}
          <input
            type="text"
            value={textVal}
            maxLength={definition.maxLength}
            placeholder={definition.placeholder}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
            }}
          />
        </div>
      );
    }

    case 'select': {
      const selected = value !== undefined ? value : definition.options[0]?.value;
      return (
        <div className="control-field select-field" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#334155' }}>{definition.label}</label>
          {definition.description && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{definition.description}</p>
          )}
          <select
            value={selected}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              backgroundColor: '#fff',
            }}
          >
            {definition.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    case 'media': {
      const mediaVal = typeof value === 'string' ? value : '';
      return (
        <div className="control-field media-field" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#334155' }}>{definition.label}</label>
          {definition.description && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{definition.description}</p>
          )}
          <input
            type="file"
            accept={definition.mediaType === 'audio' ? 'audio/*' : 'image/*'}
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const objectUrl = URL.createObjectURL(file);
                onChange(objectUrl);
              }
            }}
            style={{ fontSize: '0.875rem' }}
          />
          {mediaVal && definition.mediaType === 'image' && (
            <img
              src={mediaVal}
              alt="Media preview"
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginTop: '4px' }}
            />
          )}
        </div>
      );
    }

    case 'group': {
      const groupVal = typeof value === 'object' && value !== null ? value : {};
      return (
        <div
          className="control-group"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#1e293b',
            }}
          >
            <span>{definition.label}</span>
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          {!collapsed && (
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(definition.controls).map(([subKey, subDef]) => (
                <ControlItem
                  key={subKey}
                  fieldKey={subKey}
                  definition={subDef}
                  value={groupVal[subKey]}
                  onChange={(subVal) => onChange({ ...groupVal, [subKey]: subVal })}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'repeater': {
      const listVal = Array.isArray(value) ? value : [];
      const addItem = () => {
        if (definition.max && listVal.length >= definition.max) return;
        onChange([...listVal, { id: `item_${Date.now()}` }]);
      };
      const removeItem = (idx: number) => {
        if (definition.min && listVal.length <= definition.min) return;
        onChange(listVal.filter((_, i) => i !== idx));
      };
      const updateItem = (idx: number, updatedItem: any) => {
        const next = [...listVal];
        next[idx] = updatedItem;
        onChange(next);
      };

      return (
        <div className="control-repeater" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#334155' }}>
              {definition.label} ({listVal.length})
            </label>
            <button
              type="button"
              onClick={addItem}
              disabled={disabled || (Boolean(definition.max) && listVal.length >= (definition.max || 99))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Thêm
            </button>
          </div>
          {listVal.map((item, idx) => (
            <div
              key={item?.id || idx}
              style={{
                padding: '8px',
                border: '1px dashed #cbd5e1',
                borderRadius: '6px',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => removeItem(idx)}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: '#ef4444',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(definition.itemSchema).map(([fKey, fDef]) => (
                  <ControlItem
                    key={fKey}
                    fieldKey={fKey}
                    definition={fDef}
                    value={item?.[fKey]}
                    onChange={(val) => updateItem(idx, { ...item, [fKey]: val })}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
};
