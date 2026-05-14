import React from 'react';

export default function ProductDescriptionSection({ description }) {
  const normalized = typeof description === 'string' ? description.trim() : '';
  if (!normalized) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{normalized}</p>
      </div>
    </section>
  );
}
