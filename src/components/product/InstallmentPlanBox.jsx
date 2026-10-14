import React from 'react';

export function InstallmentPlanBox({ isInstallment, setIsInstallment, installmentPlan, setInstallmentPlan }) {
  return (
    <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200/70 mb-2.5">
      <label htmlFor="installment-toggle" className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          id="installment-toggle"
          checked={isInstallment}
          onChange={(e) => setIsInstallment(e.target.checked)}
          className="w-3.5 h-3.5 text-indigo-600 bg-white border-indigo-300 rounded focus:ring-indigo-600 accent-indigo-600 cursor-pointer shrink-0"
        />
        <span className="text-xs sm:text-[12.5px] font-bold text-[#112338]">Request Installment Plan</span>
      </label>
      <p className="text-[10px] sm:text-[11px] text-indigo-700/80 mt-0.5 pl-5.5">
        T&C apply. Requires physical bank cheques. Approval via WhatsApp.
      </p>
      {isInstallment && (
        <div className="mt-2 pl-5.5">
          <select
            value={installmentPlan}
            onChange={(e) => setInstallmentPlan(e.target.value)}
            className="w-full bg-white border border-indigo-200 text-[#112338] text-xs font-bold h-8 px-2 rounded-md outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
          >
            <option value="3 Months">3 Months (0% Markup)</option>
            <option value="6 Months">6 Months</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default InstallmentPlanBox;
