import { useEffect, useRef, useState } from "react";
import style from '../styles/components/customSelect.module.css';
import { CaretCircleDownIcon } from "@phosphor-icons/react";

interface Option {
    value: number;
    label: string;
}

export function CustomSelect({ options, value, onChange }: {
    options: Option[];
    value: number;
    onChange: (value: number) => void;
}) {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [arrowStyle, setArrowStyle] = useState("");

    useEffect(() => {
        if (!open) return;

        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setArrowStyle(style.rotateBackArrow);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div className={style.wrapper} ref={wrapperRef}>
            <button type="button" className={style.trigger} onClick={() => {setOpen(!open); setArrowStyle(open ? style.rotateBackArrow : style.rotatingArrow)}}>
                <p>{selected?.label ?? "Select..."}</p>
                <CaretCircleDownIcon size={28} className={arrowStyle}/>
            </button>
            {open && (
                <ul className={style.dropdown}>
                    {options.map((o) => (
                        <li key={o.value} className={style.option} onClick={() => { onChange(o.value); setOpen(false); setArrowStyle(style.rotateBackArrow); }}>{o.label}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}