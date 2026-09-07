"use client";

import React, { useEffect, useRef, useState } from "react";

let idCounter = 0;

export function DropdownAggregate({
    title,
    options,
    value,
    setterCallback,
    removeNegate,
    removeRemove
}: {
    title: string,
    options: string[],
    value: string[],
    setterCallback: (value: string[]) => void,
    removeNegate?: boolean,
    removeRemove?: boolean
}) {
    const [rows, setRows] = useState<{ id: number; value: string }[]>(
        value.length > 0
            ? value.map(v => ({ id: idCounter++, value: v }))
            : [{ id: idCounter++, value: "" }]
    );

    useEffect(() => {
        const current = rows
            .map(r => r.value)
            .filter(v => v !== "");

        const inSync =
            current.length === value.length &&
            current.every((v, i) => v === value[i]);

        if (!inSync) {
            setRows(
                value.length > 0
                    ? value.map(v => ({
                        id: idCounter++,
                        value: v
                    }))
                    : [{ id: idCounter++, value: "" }]
            );
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const emit = (updatedRows: { id: number; value: string }[]) => {
        setterCallback(
            updatedRows
                .map(r => r.value)
                .filter(v => v !== "")
        );
    };

    const handleRowChange = (id: number, value: string) => {
        let newRows = rows.map(row =>
            row.id === id
                ? { ...row, value }
                : row
        );

        if (value === "" && newRows.length > 1) {
            newRows = newRows.filter(row => row.id !== id);
        }

        setRows(newRows);
        emit(newRows);
    };

    const lastRow = rows[rows.length - 1];

    const addRow = () => {
        setRows([
            ...rows,
            {
                id: idCounter++,
                value: ""
            }
        ]);
    };

    return (
        <div className="search-col">
            {rows.map(row => (
                <Dropdown
                    key={row.id}
                    title={title}
                    options={options.filter(option =>
                        rows.every(
                            r =>
                                r.id === row.id ||
                                r.value !== option
                        )
                    )}
                    value={row.value}
                    setterCallback={(value: string) =>
                        handleRowChange(row.id, value)
                    }
                    removeNegate={removeNegate}
                    removeRemove={removeRemove}
                    addRow={
                        row === lastRow && lastRow.value !== ""
                            ? addRow
                            : undefined
                    }
                />
            ))}
        </div>
    );
}

export function Dropdown({
    title,
    options,
    value,
    setterCallback,
    removeNegate,
    removeRemove,
    addRow
}: {
    title: string,
    options: string[],
    value: string,
    setterCallback: (value: any) => void,
    removeNegate?: boolean,
    removeRemove?: boolean,
    addRow?: () => void
}) {
    const [open, setOpen] = useState(false);
    const [filterText, setFilterText] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const negate = value && value.startsWith("!");
    const selected = negate ? value.slice(1) : value;
    const label = selected || title;

    const divRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                divRef.current &&
                !divRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const filteredOptions = options.filter(option =>
        option
            .toLowerCase()
            .includes(filterText.toLowerCase())
    );

    useEffect(() => {
        if (!open) {
            setFilterText("");
            setHighlightedIndex(0);
            return;
        }

        const selectedIndex = filteredOptions.indexOf(selected);

        setHighlightedIndex(
            selectedIndex >= 0
                ? selectedIndex
                : 0
        );

        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }, [open]);

    useEffect(() => {
        if (highlightedIndex >= filteredOptions.length) {
            setHighlightedIndex(
                Math.max(0, filteredOptions.length - 1)
            );
        }
    }, [filteredOptions.length, highlightedIndex]);

    const selectOption = (option: string) => {
        setterCallback(
            negate
                ? "!" + option
                : option
        );
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();

            if (filteredOptions.length === 0) {
                return;
            }

            setHighlightedIndex(current =>
                current >= filteredOptions.length - 1
                    ? 0
                    : current + 1
            );

            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            event.stopPropagation();

            if (filteredOptions.length === 0) {
                return;
            }

            setHighlightedIndex(current =>
                current <= 0
                    ? filteredOptions.length - 1
                    : current - 1
            );

            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();

            if (
                filteredOptions.length === 0 ||
                highlightedIndex < 0 ||
                highlightedIndex >= filteredOptions.length
            ) {
                return;
            }

            if (filteredOptions[highlightedIndex] == value && !removeRemove) {
                
                setterCallback("");
            } else {
                selectOption(filteredOptions[highlightedIndex]);
            }
            setOpen(false);

            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
        }
    };

    return (
        <div className="dropdown-header">
            {!removeNegate && (
                <button
                    type="button"
                    className={`text ${
                        negate
                            ? "button-not-rev"
                            : "button-not"
                    } img-btn`}
                    onClick={() => {
                        if (!selected) {
                            return;
                        }

                        setterCallback(
                            negate
                                ? selected
                                : "!" + selected
                        );
                    }}
                >
                    ¬
                </button>
            )}

            <div
                className="dropdown"
                ref={divRef}
            >
                <div
                    className={
                        open
                            ? "dropdown-header dropdown-header-open"
                            : "dropdown-header"
                    }
                >
                    {open ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={filterText}
                            placeholder={label}
                            autoFocus
                            onClick={event =>
                                event.stopPropagation()
                            }
                            onChange={event => {
                                setFilterText(
                                    event.target.value
                                );
                                setHighlightedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    ) : (
                        <button
                            className="text"
                            type="button"
                            onClick={() =>
                                setOpen(true)
                            }
                        >
                            {label}
                        </button>
                    )}

                    <button
                        className={`text nopad ${
                            open
                                ? "button-img-rev"
                                : "button-img"
                        }`}
                        type="button"
                        onClick={event => {
                            event.stopPropagation();
                            setOpen(current => !current);
                        }}
                    >
                        <img
                            className="img-btn"
                            src={
                                open
                                    ? "up.svg"
                                    : "down.svg"
                            }
                        />
                    </button>
                </div>

                {open && (
                    <div className="dropdown-content">
                        {filteredOptions.map((option, index) => {
                            const isHighlighted = index === highlightedIndex;
                            const isSelected = option === selected;

                            return (
                                <button
                                    type="button"
                                    key={option}
                                    className={
                                        isSelected
                                            ? "dd-item button-not-rev"
                                            : "dd-item"
                                    }
                                    style={
                                        isHighlighted
                                            ? {
                                                backgroundColor: "#c5a7a1",
                                            }
                                            : undefined
                                    }
                                    onMouseEnter={() =>
                                        setHighlightedIndex(index)
                                    }
                                    onMouseDown={event => {
                                        event.preventDefault();
                                    }}
                                    onClick={() => {
                                        selectOption(option);
                                        setOpen(false);
                                    }}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                )}


            </div>

            {selected && !removeRemove && (
                <button
                    type="button"
                    className="text button-not img-btn"
                    onClick={() =>
                        setterCallback("")
                    }
                >
                    ×
                </button>
            )}

            {addRow && (
                <button
                    type="button"
                    className="text button-not img-btn"
                    onClick={addRow}
                >
                    +
                </button>
            )}
        </div>
    );
}
