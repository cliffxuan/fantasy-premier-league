import React from 'react';

const AnalysisResult = ({ data }) => {
	if (!data) return null;

	return (
		<div className="grid gap-6">
			<div className="bg-fpl-card p-6 rounded-2xl border border-white/10">
				<h2 className="mt-0 text-xl border-b border-white/10 pb-3 mb-4 font-bold text-fpl-red">🚨 Immediate Action</h2>
				<p>{data.immediate_action}</p>
			</div>

			<div className="bg-fpl-card p-6 rounded-2xl border border-white/10">
				<h2 className="mt-0 text-xl border-b border-white/10 pb-3 mb-4 font-bold text-fpl-green">🔄 Transfer Plan</h2>
				<div className="mb-4 p-4 bg-white/5 rounded-lg last:mb-0">
					<h3 className="mt-0 text-base text-gray-400 font-normal mb-2">Option A (Conservative)</h3>
					<p>{data.transfer_plan["Option A (Conservative)"]}</p>
				</div>
				<div className="mb-4 p-4 bg-white/5 rounded-lg last:mb-0">
					<h3 className="mt-0 text-base text-gray-400 font-normal mb-2">Option B (Aggressive)</h3>
					<p>{data.transfer_plan["Option B (Aggressive)"]}</p>
				</div>
			</div>

			<div className="bg-fpl-card p-6 rounded-2xl border border-white/10">
				<h2 className="mt-0 text-xl border-b border-white/10 pb-3 mb-4 font-bold text-fpl-yellow">©️ Captaincy</h2>
				<p>{data.captaincy}</p>
			</div>

			<div className="bg-fpl-card p-6 rounded-2xl border border-white/10">
				<h2 className="mt-0 text-xl border-b border-white/10 pb-3 mb-4 font-bold text-fpl-green">🔮 Future Watch</h2>
				<p>{data.future_watch}</p>
			</div>
		</div>
	);
};

export default AnalysisResult;
