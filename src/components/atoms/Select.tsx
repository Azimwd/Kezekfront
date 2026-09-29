import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

import {
    createPortal
} from 'react-dom';

import {
    ChevronDown,
    Check,
    type LucideIcon
} from 'lucide-react';

import Icon from './Icon';

export interface SelectOption {
    id: string | number;
    label?: string;
    icon?: LucideIcon;
    city?: string;
    ru?: string;
    eng?: string;
}

interface SelectProps {
    options: SelectOption[];
    value: SelectOption;
    onChange: (option: SelectOption) => void;
    leftIcon?: LucideIcon;
    className?: string;
}

interface DropdownPosition {
    top: number;
    left: number;
    width: number;
    maxHeight: number;
}

export default function Select({
    options,
    value,
    onChange,
    leftIcon,
    className = 'w-40'
}: SelectProps) {
    const [
        isOpen,
        setIsOpen
    ] = useState(false);

    const [
        dropdownPosition,
        setDropdownPosition
    ] = useState<DropdownPosition | null>(
        null
    );

    const triggerRef =
        useRef<HTMLDivElement>(
            null
        );

    const dropdownRef =
        useRef<HTMLDivElement>(
            null
        );

    const updateDropdownPosition =
        useCallback(
            () => {
                if (
                    !triggerRef.current
                ) {
                    return;
                }

                const rect =
                    triggerRef.current.getBoundingClientRect();

                const viewportPadding = 8;
                const gap = 4;
                const preferredHeight = 240;

                const spaceBelow =
                    window.innerHeight -
                    rect.bottom -
                    viewportPadding -
                    gap;

                const spaceAbove =
                    rect.top -
                    viewportPadding -
                    gap;

                const openAbove =
                    spaceBelow < 180 &&
                    spaceAbove > spaceBelow;

                const availableHeight =
                    openAbove
                        ? spaceAbove
                        : spaceBelow;

                const maxHeight =
                    Math.max(
                        120,
                        Math.min(
                            preferredHeight,
                            availableHeight
                        )
                    );

                const width =
                    rect.width;

                const maxLeft =
                    Math.max(
                        viewportPadding,
                        window.innerWidth -
                        width -
                        viewportPadding
                    );

                const left =
                    Math.min(
                        Math.max(
                            rect.left,
                            viewportPadding
                        ),
                        maxLeft
                    );

                const top =
                    openAbove
                        ? Math.max(
                            viewportPadding,
                            rect.top -
                            maxHeight -
                            gap
                        )
                        : Math.min(
                            rect.bottom +
                            gap,
                            window.innerHeight -
                            viewportPadding
                        );

                setDropdownPosition({
                    top,
                    left,
                    width,
                    maxHeight
                });
            },
            []
        );

    useEffect(
        () => {
            if (
                !isOpen
            ) {
                return;
            }

            updateDropdownPosition();

            const handleClickOutside =
                (
                    event: MouseEvent
                ) => {
                    const target =
                        event.target as Node;

                    const clickedTrigger =
                        triggerRef.current?.contains(
                            target
                        );

                    const clickedDropdown =
                        dropdownRef.current?.contains(
                            target
                        );

                    if (
                        !clickedTrigger &&
                        !clickedDropdown
                    ) {
                        setIsOpen(false);
                    }
                };

            const handleViewportChange =
                () => {
                    updateDropdownPosition();
                };

            document.addEventListener(
                'mousedown',
                handleClickOutside
            );

            window.addEventListener(
                'resize',
                handleViewportChange
            );

            window.addEventListener(
                'scroll',
                handleViewportChange,
                true
            );

            return () => {
                document.removeEventListener(
                    'mousedown',
                    handleClickOutside
                );

                window.removeEventListener(
                    'resize',
                    handleViewportChange
                );

                window.removeEventListener(
                    'scroll',
                    handleViewportChange,
                    true
                );
            };
        },
        [
            isOpen,
            updateDropdownPosition
        ]
    );

    const handleSelect =
        (
            option: SelectOption
        ) => {
            onChange(
                option
            );

            setIsOpen(
                false
            );
        };

    const handleToggle =
        () => {
            setIsOpen(
                previous =>
                    !previous
            );
        };

    return (
        <>
            <div
                className={`relative ${className}`}
                ref={triggerRef}
            >
                <div
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer select-none hover:bg-slate-50 transition-colors"
                    onClick={handleToggle}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        {leftIcon && (
                            <Icon
                                icon={leftIcon}
                                className="text-slate-500 w-4 h-4"
                            />
                        )}

                        <span className="text-slate-900 font-medium text-sm truncate">
                            {value.label}
                        </span>
                    </div>

                    <Icon
                        icon={ChevronDown}
                        className={`text-slate-500 w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isOpen
                                ? 'rotate-180'
                                : ''
                        }`}
                    />
                </div>
            </div>

            {isOpen &&
                dropdownPosition &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className="fixed z-[11000] overflow-y-auto rounded-md bg-white p-1 shadow-xl border border-slate-100"
                        style={{
                            top:
                                dropdownPosition.top,
                            left:
                                dropdownPosition.left,
                            width:
                                dropdownPosition.width,
                            maxHeight:
                                dropdownPosition.maxHeight
                        }}
                    >
                        {options.map(
                            option => {
                                const isSelected =
                                    value.id ===
                                    option.id;

                                return (
                                    <div
                                        key={option.id}
                                        onClick={() =>
                                            handleSelect(
                                                option
                                            )
                                        }
                                        className={`flex items-center justify-between px-2 py-2 text-sm cursor-pointer rounded-md transition-colors duration-150 outline-none ${
                                            isSelected
                                                ? 'bg-slate-100 text-slate-900 font-medium'
                                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                    >
                                        <span className="truncate">
                                            {option.label}
                                        </span>

                                        {isSelected && (
                                            <Icon
                                                icon={Check}
                                                className="w-4 h-4 shrink-0 text-slate-900"
                                            />
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </div>,
                    document.body
                )}
        </>
    );
}
