import React from 'react';

const formatOptionLabel = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return String(value);
};

const isSameOptionValue = (a, b) => {
  if (a === null || a === undefined) return b === null || b === undefined;
  if (b === null || b === undefined) return false;
  return String(a) === String(b);
};

export default function VariantSelector({
  versions,
  colors,
  selectedVersion,
  selectedColor,
  onSelectVersion,
  onSelectColor,
}) {
  const canRender = Array.isArray(versions) && versions.length > 0 && Array.isArray(colors) && colors.length > 0;

  if (!canRender) return null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">Phiên bản</p>
        <div className="flex flex-wrap gap-2">
          {versions.map((version) => {
            const isSelected = isSameOptionValue(selectedVersion, version);

            return (
              <button
                key={`version-${String(version)}`}
                type="button"
                onClick={() => onSelectVersion?.(version)}
                className={
                  isSelected
                    ? 'px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium border border-blue-600 transition'
                    : 'px-3 py-2 rounded-lg bg-white text-gray-800 text-sm font-medium border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition'
                }
              >
                {formatOptionLabel(version)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">Màu sắc</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const isSelected = isSameOptionValue(selectedColor, color);

            return (
              <button
                key={`color-${String(color)}`}
                type="button"
                onClick={() => onSelectColor?.(color)}
                className={
                  isSelected
                    ? 'px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium border border-blue-600 transition'
                    : 'px-3 py-2 rounded-lg bg-white text-gray-800 text-sm font-medium border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition'
                }
              >
                {formatOptionLabel(color)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
