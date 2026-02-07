import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Key, ClipboardPaste } from 'lucide-react';
import { getAuthUrl } from '../api';
import { useExchangeCode } from '../hooks/queries';

const AuthModal = ({ isOpen, onClose, currentToken, onAuthenticated }) => {
	const [token, setToken] = useState(currentToken);
	const [step, setStep] = useState('initial');
	const [code, setCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(null);
	const [popupStatus, setPopupStatus] = useState(null);
	const codeInputRef = useRef(null);
	const popupRef = useRef(null);
	const pollRef = useRef(null);

	const exchangeCodeMutation = useExchangeCode();

	useEffect(() => {
		if (isOpen) {
			setStep('initial');
			setSuccess(false);
			setError(null);
			setCode('');
			setPopupStatus(null);
		}
		setToken(currentToken);
	}, [currentToken, isOpen]);

	useEffect(() => {
		return () => {
			if (pollRef.current) clearInterval(pollRef.current);
		};
	}, []);

	const handleStartLogin = async () => {
		try {
			setLoading(true);
			setError(null);
			const { url } = await getAuthUrl();
			if (url) {
				const w = 500,
					h = 650;
				const left = window.screenX + (window.outerWidth - w) / 2;
				const top = window.screenY + (window.outerHeight - h) / 2;
				const popup = window.open(
					url,
					'fpl-login',
					`width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`,
				);
				popupRef.current = popup;
				setStep('paste');
				setPopupStatus('waiting');

				if (pollRef.current) clearInterval(pollRef.current);
				pollRef.current = setInterval(() => {
					if (!popup || popup.closed) {
						clearInterval(pollRef.current);
						pollRef.current = null;
						popupRef.current = null;
						setPopupStatus('closed');
						setTimeout(() => codeInputRef.current?.focus(), 100);
					}
				}, 500);
			}
		} catch (err) {
			setError('Failed to start login: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handlePasteFromClipboard = async () => {
		try {
			const text = await navigator.clipboard.readText();
			if (text) {
				setCode(text.trim());
				const trimmed = text.trim();
				if (trimmed.includes('code=') || (trimmed.length > 20 && !trimmed.includes(' '))) {
					setTimeout(() => handleVerifyCode(trimmed), 300);
				}
			}
		} catch {
			codeInputRef.current?.focus();
		}
	};

	const handleVerifyCode = async (directCode) => {
		try {
			setLoading(true);
			setError(null);
			let cleanCode = (directCode || code).trim();
			if (cleanCode.includes('code=')) {
				cleanCode = cleanCode.split('code=')[1].split('&')[0];
			}

			const data = await exchangeCodeMutation.mutateAsync(cleanCode);
			if (data.access_token) {
				setSuccess(true);
				setTimeout(() => {
					onAuthenticated(data.access_token);
					onClose();
				}, 1000);
			} else {
				setError('Invalid code. Please try again.');
			}
		} catch (err) {
			setError('Failed to verify code: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
			<div className="bg-ds-card w-full max-w-lg rounded-xl border border-ds-border shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
				<div className="flex justify-between items-center p-6 border-b border-ds-border bg-ds-card/50">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-ds-primary/10 rounded-lg text-ds-primary">
							<Key size={24} />
						</div>
						<div>
							<h3 className="text-xl font-bold text-ds-text">Sign in with FPL</h3>
							<p className="text-xs text-ds-text-muted">Import your team securely</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-ds-surface rounded-full text-ds-text-muted hover:text-ds-text transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				<div className="p-6 space-y-6">
					{error && (
						<div className="bg-ds-danger/10 border border-ds-danger text-ds-danger p-3 rounded-lg text-sm">{error}</div>
					)}

					{step === 'initial' ? (
						<div className="space-y-4">
							<p className="text-sm text-ds-text-muted leading-relaxed">
								Connect your FPL account to automatically load your team, improved recommendations, and private league
								data. This token is stored only in your browser.
							</p>

							<button
								onClick={handleStartLogin}
								disabled={loading || Boolean(currentToken)}
								className={`w-full font-bold rounded-lg px-6 py-4 text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 ${
									currentToken
										? 'bg-ds-surface border border-ds-border text-ds-text-muted cursor-not-allowed'
										: 'bg-ds-primary text-white hover:bg-ds-primary-hover shadow-ds-primary/20'
								}`}
							>
								{loading ? (
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : currentToken ? (
									<>
										<Check size={18} className="text-green-500" />
										<span>Already Authenticated</span>
									</>
								) : (
									<>
										<Key size={18} />
										<span>Open FPL Login Page</span>
									</>
								)}
							</button>

							{!currentToken && (
								<>
									<div className="relative py-2">
										<div className="absolute inset-0 flex items-center">
											<span className="w-full border-t border-ds-border"></span>
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-ds-card px-2 text-ds-text-muted">Or handle manually</span>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-xs font-bold text-ds-text uppercase tracking-wider">Manual Token / ID</label>
										<input
											type="text"
											className="w-full bg-ds-surface border border-ds-border rounded-md px-4 py-3 text-sm outline-none focus:border-ds-primary focus:ring-1 focus:ring-ds-primary transition-all font-mono placeholder-ds-text-muted/30"
											placeholder="Enter token manually..."
											value={token}
											onChange={(e) => setToken(e.target.value)}
										/>
									</div>
								</>
							)}
						</div>
					) : (
						<div className="space-y-4 animate-in slide-in-from-right-4">
							{/* Status indicator */}
							{popupStatus === 'waiting' && (
								<div className="flex items-center gap-3 bg-ds-primary/5 border border-ds-primary/20 p-3 rounded-lg">
									<div className="w-2 h-2 bg-ds-primary rounded-full animate-pulse" />
									<p className="text-xs text-ds-primary font-medium">
										Login popup is open — sign in there, then come back here
									</p>
								</div>
							)}
							{popupStatus === 'closed' && !code && !success && (
								<div className="flex items-center gap-3 bg-ds-accent/5 border border-ds-accent/20 p-3 rounded-lg">
									<Check size={14} className="text-ds-accent" />
									<p className="text-xs text-ds-accent font-medium">
										Popup closed — now paste the URL from your address bar
									</p>
								</div>
							)}

							<div className="flex items-start gap-3 bg-ds-surface p-4 rounded-lg border border-ds-border">
								<div className="bg-ds-primary/10 text-ds-primary p-1.5 rounded-full mt-0.5">
									<span className="font-bold text-xs">1</span>
								</div>
								<div>
									<h4 className="font-bold text-sm mb-1">Log in to FPL</h4>
									<p className="text-xs text-ds-text-muted">
										Sign in on the official FPL page in the popup. After login you'll land on a page starting with{' '}
										<code className="bg-black/20 px-1 rounded">premierleague.com/robots.txt</code>.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3 bg-ds-surface p-4 rounded-lg border border-ds-border">
								<div className="bg-ds-primary/10 text-ds-primary p-1.5 rounded-full mt-0.5">
									<span className="font-bold text-xs">2</span>
								</div>
								<div>
									<h4 className="font-bold text-sm mb-1">Copy the entire URL</h4>
									<p className="text-xs text-ds-text-muted">
										Click the address bar, select all (
										<kbd className="bg-black/20 px-1 rounded text-[10px]">Ctrl+A</kbd>), and copy (
										<kbd className="bg-black/20 px-1 rounded text-[10px]">Ctrl+C</kbd>). Then close the popup and come
										back here.
									</p>
								</div>
							</div>

							<div className="pt-2 space-y-2">
								<label className="text-xs font-bold text-ds-text uppercase tracking-wider block">
									Paste URL or Code
								</label>
								<div className="flex gap-2">
									<input
										ref={codeInputRef}
										type="text"
										autoFocus
										className="flex-1 bg-ds-surface border border-ds-border rounded-md px-4 py-3 text-sm outline-none focus:border-ds-primary focus:ring-1 focus:ring-ds-primary transition-all font-mono"
										placeholder="Paste the full URL..."
										value={code}
										onChange={(e) => setCode(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && code && handleVerifyCode()}
									/>
									<button
										onClick={handlePasteFromClipboard}
										className="bg-ds-surface border border-ds-border rounded-md px-3 hover:border-ds-primary hover:text-ds-primary transition-colors text-ds-text-muted"
										title="Paste from clipboard"
									>
										<ClipboardPaste size={18} />
									</button>
								</div>
							</div>

							<button
								onClick={() => handleVerifyCode()}
								disabled={loading || !code || success}
								className={`w-full font-bold rounded-lg px-6 py-3 text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${
									success
										? 'bg-green-500 text-white shadow-green-500/20'
										: 'bg-ds-primary text-white hover:bg-ds-primary-hover active:scale-95 shadow-ds-primary/20'
								}`}
							>
								{success ? (
									<>
										<Check size={18} />
										<span>Success! Redirecting...</span>
									</>
								) : loading ? (
									'Verifying...'
								) : (
									'Complete Sign In'
								)}
							</button>
						</div>
					)}
				</div>

				<div className="p-6 border-t border-ds-border bg-ds-card/50 flex justify-between items-center rounded-b-xl">
					{step === 'paste' ? (
						<button
							onClick={() => {
								setStep('initial');
								setPopupStatus(null);
								if (pollRef.current) clearInterval(pollRef.current);
							}}
							className="text-xs font-bold text-ds-text-muted hover:text-ds-text transition-colors"
						>
							Back
						</button>
					) : (
						<span></span>
					)}

					<div className="flex gap-3">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-bold text-ds-text-muted hover:text-ds-text transition-colors"
						>
							Cancel
						</button>
						{step === 'initial' && token !== currentToken && (
							<button
								onClick={() => {
									onAuthenticated(token);
									onClose();
								}}
								className="bg-ds-surface border border-ds-border text-ds-text font-bold rounded-md px-4 py-2 text-sm hover:bg-ds-card-hover transition-all"
							>
								Save Manual Token
							</button>
						)}
						{step === 'initial' && !!currentToken && (
							<button
								onClick={() => {
									onAuthenticated('');
								}}
								className="text-ds-danger font-bold text-sm hover:underline px-2"
							>
								Sign Out
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthModal;
