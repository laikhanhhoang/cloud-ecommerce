import React from 'react';

const isPlainObject = (value) => {
  if (!value || typeof value !== 'object') return false;
  return !Array.isArray(value);
};

export default function ProductSpecsTable({ specs }) {
  if (!isPlainObject(specs)) return null;

  const entries = Object.entries(specs).filter(([key, value]) => {
    const keyText = String(key ?? '').trim();
    const valueText = String(value ?? '').trim();
    return Boolean(keyText) && Boolean(valueText);
  });

  if (entries.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={String(key)} className="border-t border-gray-100 first:border-t-0">
                <th className="w-1/3 text-left text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-3 align-top">
                  {String(key)}
                </th>
                <td className="text-sm text-gray-700 px-4 py-3">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
