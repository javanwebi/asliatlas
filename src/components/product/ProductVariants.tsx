import React, { useMemo, useState } from 'react';
import type { ProductVariant } from '../../types';
import { normalizeCatalogueText } from '../../data/userProducts';
import { toPersianDigits } from '../../utils/formatters';

export const ProductVariants: React.FC<{ variants: ProductVariant[]; selected: string; onSelect: (code: string) => void }> = ({ variants, selected, onSelect }) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const results = useMemo(() => variants.filter(v => normalizeCatalogueText(`${v.code} ${v.size} ${v.name}`).includes(normalizeCatalogueText(query))), [variants, query]);
  const totalPages = Math.max(1, Math.ceil(results.length / 20));
  return <section className="space-y-3 rounded-2xl border border-slate-200 p-4 bg-white" aria-label="سایزها و کدهای کالا">
    <div className="flex justify-between gap-2 items-center"><h2 className="font-bold text-sm">انتخاب سایز و کد کالا</h2><span className="text-xs text-slate-500">{toPersianDigits(variants.length)} کد کالا</span></div>
    <label className="block text-xs text-slate-600">جستجو در سایز، کد یا شرح کالا
      <input type="search" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" placeholder="مثلاً 32893 یا 5*42" />
    </label>
    <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">
      <table className="w-full text-xs text-right"><thead className="sticky top-0 bg-slate-100"><tr><th className="p-2">کد کالا</th><th className="p-2">سایز</th><th className="p-2">شرح ثبت‌شده</th><th className="p-2">انتخاب</th></tr></thead>
        <tbody>{results.slice((page - 1) * 20, page * 20).map(v => <tr key={v.code} className={`border-t border-slate-100 ${selected === v.code ? 'bg-orange-50' : ''}`}>
          <td className="p-2 font-mono" dir="ltr">{v.code}</td><td className="p-2" dir="auto">{v.size}</td><td className="p-2 min-w-40 leading-6">{v.name}</td>
          <td className="p-2"><button type="button" aria-pressed={selected === v.code} onClick={() => onSelect(v.code)} className="rounded-lg border border-orange-200 px-2 py-1.5 text-orange-700 whitespace-nowrap">{selected === v.code ? 'انتخاب‌شده' : `انتخاب ${v.code}`}</button></td>
        </tr>)}</tbody>
      </table>
      {!results.length && <p className="p-4 text-sm text-slate-500">کد یا سایز مطابق پیدا نشد.</p>}
    </div>
    {totalPages > 1 && <div className="flex items-center justify-between text-xs"><button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="disabled:opacity-40 p-2">قبلی</button><span>{toPersianDigits(page)} از {toPersianDigits(totalPages)}</span><button type="button" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="disabled:opacity-40 p-2">بعدی</button></div>}
  </section>;
};
