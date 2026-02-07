import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook that encapsulates shared popover logic:
 * - Position calculation relative to a trigger element
 * - Visibility state with show/hide
 * - Timer-based delayed hide (so user can move cursor to the popover)
 * - Mobile click toggle vs desktop hover
 * - Scroll/resize repositioning listeners
 *
 * @param {Object} options
 * @param {Function} [options.onShow] - Called when the popover becomes visible (e.g. to fetch data)
 * @param {number}  [options.hideDelay=100] - Delay in ms before hiding on mouse leave
 * @param {number}  [options.flipThreshold=500] - If trigger's top is below this value (px), popover flips below
 * @param {number}  [options.mobileBreakpoint=768] - Width breakpoint for mobile behaviour
 *
 * @returns {Object} popover - All state, refs, and handlers needed by the consuming component
 */
export function usePopover({ onShow, hideDelay = 100, flipThreshold = 500, mobileBreakpoint = 768 } = {}) {
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState({
		top: 0,
		left: 0,
		transform: '-translate-x-1/2 -translate-y-full',
	});

	const triggerRef = useRef(null);
	const popoverRef = useRef(null);
	const timerRef = useRef(null);

	// ------- Position calculation -------
	const updatePosition = useCallback(() => {
		if (!triggerRef.current) return;

		const rect = triggerRef.current.getBoundingClientRect();
		const isMobile = window.innerWidth < mobileBreakpoint;

		let top = rect.top - 10;
		let transform = '-translate-x-1/2 -translate-y-full';

		if (rect.top < flipThreshold) {
			top = rect.bottom + 10;
			transform = '-translate-x-1/2';
		}

		if (isMobile) {
			setPosition({ top, left: window.innerWidth / 2, transform });
		} else {
			setPosition({ top, left: rect.left + rect.width / 2, transform });
		}
	}, [flipThreshold, mobileBreakpoint]);

	// ------- Scroll / resize listeners -------
	useEffect(() => {
		if (isVisible) {
			updatePosition();
			window.addEventListener('scroll', updatePosition, true);
			window.addEventListener('resize', updatePosition);
			return () => {
				window.removeEventListener('scroll', updatePosition, true);
				window.removeEventListener('resize', updatePosition);
			};
		}
	}, [isVisible, updatePosition]);

	// ------- Timer helpers -------
	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	// ------- Core visibility handlers -------
	const show = useCallback(() => {
		clearTimer();
		setIsVisible(true);
		if (onShow) onShow();
	}, [clearTimer, onShow]);

	const hide = useCallback(() => {
		setIsVisible(false);
	}, []);

	const delayedHide = useCallback(() => {
		timerRef.current = setTimeout(() => {
			setIsVisible(false);
		}, hideDelay);
	}, [hideDelay]);

	// ------- Event handlers for the trigger element -------
	const handleMouseEnter = useCallback(() => {
		show();
	}, [show]);

	const handleMouseLeave = useCallback(() => {
		delayedHide();
	}, [delayedHide]);

	const handleClick = useCallback(() => {
		if (window.innerWidth < mobileBreakpoint) {
			if (isVisible) {
				hide();
			} else {
				show();
			}
		}
	}, [mobileBreakpoint, isVisible, hide, show]);

	// ------- Event handlers for the popover element itself -------
	const popoverMouseEnter = useCallback(() => {
		clearTimer();
	}, [clearTimer]);

	const popoverMouseLeave = useCallback(() => {
		hide();
	}, [hide]);

	const popoverClick = useCallback((e) => {
		e.stopPropagation();
	}, []);

	// Convenience objects so consumers can spread props directly
	const triggerProps = {
		ref: triggerRef,
		onMouseEnter: handleMouseEnter,
		onMouseLeave: handleMouseLeave,
		onClick: handleClick,
	};

	const popoverProps = {
		ref: popoverRef,
		onMouseEnter: popoverMouseEnter,
		onMouseLeave: popoverMouseLeave,
		onClick: popoverClick,
		style: { top: position.top, left: position.left },
	};

	return {
		isVisible,
		position,
		triggerRef,
		popoverRef,
		triggerProps,
		popoverProps,
		show,
		hide,
		delayedHide,
		clearTimer,
	};
}
