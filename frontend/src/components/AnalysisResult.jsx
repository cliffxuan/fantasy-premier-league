import React from 'react';
import { FileText } from 'lucide-react';

const AnalysisResult = ({ data, onShowPrompt }) => {
	if (!data) return null;

	return (
		<div className="grid gap-6">
			<div className="bg-ds-card p-6 rounded-xl border border-ds-border shadow-sm">
				<h2 className="mt-0 text-lg border-b border-ds-border pb-3 mb-4 font-bold text-ds-danger flex items-center gap-2">
					<span>🚨</span> Immediate Action
				</h2>
				<p className="text-ds-text font-mono text-sm leading-relaxed">{data.immediate_action}</p>
			</div>

			<div className="bg-ds-card p-6 rounded-xl border border-ds-border shadow-sm">
				<h2 className="mt-0 text-lg border-b border-ds-border pb-3 mb-4 font-bold text-ds-accent flex items-center gap-2">
					<span>🔄</span> Transfer Plan
				</h2>
				<div className="mb-4 p-4 bg-ds-bg/50 border border-ds-border rounded-lg last:mb-0">
					<h3 className="mt-0 text-sm text-ds-text-muted font-bold mb-2 uppercase tracking-wider">Option A (Conservative)</h3>
					<p className="text-ds-text font-mono text-sm leading-relaxed">{data.transfer_plan["Option A (Conservative)"]}</p>
				</div>
				<div className="mb-4 p-4 bg-ds-bg/50 border border-ds-border rounded-lg last:mb-0">
					<h3 className="mt-0 text-sm text-ds-text-muted font-bold mb-2 uppercase tracking-wider">Option B (Aggressive)</h3>
					<p className="text-ds-text font-mono text-sm leading-relaxed">{data.transfer_plan["Option B (Aggressive)"]}</p>
				</div>
			</div>

			<div className="bg-ds-card p-6 rounded-xl border border-ds-border shadow-sm">
				<h2 className="mt-0 text-lg border-b border-ds-border pb-3 mb-4 font-bold text-ds-warning flex items-center gap-2">
					<span>©️</span> Captaincy
				</h2>
				<p className="text-ds-text font-mono text-sm leading-relaxed">{data.captaincy}</p>
			</div>

			<div className="bg-ds-card p-6 rounded-xl border border-ds-border shadow-sm">
				<h2 className="mt-0 text-lg border-b border-ds-border pb-3 mb-4 font-bold text-ds-primary flex items-center gap-2">
					<span>🔮</span> Future Watch
				</h2>
				<p className="text-ds-text font-mono text-sm leading-relaxed">{data.future_watch}</p>
			</div>

			{data.generated_prompt && (
				<div className="flex justify-center mt-2">
					<button
						onClick={onShowPrompt}
						className="flex items-center gap-2 text-xs text-ds-text-muted hover:text-ds-primary transition-colors uppercase tracking-wider font-bold"
					>
						<FileText size={14} />
						View Analysis Prompt Used
					</button>
				</div>
			)}
		</div>
	);
};

export default AnalysisResult;
