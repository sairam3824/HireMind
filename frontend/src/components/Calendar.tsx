import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import styles from "./Calendar.module.css";

interface CalendarProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
    onClose: () => void;
}

export default function Calendar({ selectedDate, onChange, onClose }: CalendarProps) {
    // View state (which month we are looking at)
    const [viewDate, setViewDate] = useState(new Date(selectedDate));

    // Sync view with selected date if it changes externally
    useEffect(() => {
        setViewDate(new Date(selectedDate));
    }, [selectedDate]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...

        const days = [];
        // Add empty slots for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        // Add days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const days = getDaysInMonth(viewDate);

    const prevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    // Date constraints: Last 7 days including today.
    // minDate = Today - 6 days
    // maxDate = Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 6);

    const isDateDisabled = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < minDate || d > maxDate;
    };

    const handleDateClick = (date: Date | null) => {
        if (!date) return;
        if (!isDateDisabled(date)) {
            onChange(date);
        }
    };

    const handleReset = () => {
        const t = new Date();
        onChange(t);
        setViewDate(t);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    return (
        <div className={styles.calendarContainer}>
            {/* Header */}
            <div className={styles.header}>
                <span className={styles.monthYear}>
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    <ChevronRight size={16} className={styles.headerArrow} />
                </span>
                <div className={styles.navButtons}>
                    <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft size={18} /></button>
                    <button onClick={nextMonth} className={styles.navBtn}><ChevronRight size={18} /></button>
                </div>
            </div>

            {/* Days Header */}
            <div className={styles.weekDays}>
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
            </div>

            {/* Calendar Grid */}
            <div className={styles.daysGrid}>
                {days.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} className={styles.emptyDay}></div>;

                    const isSelected = isSameDay(date, selectedDate);
                    const isDisabled = isDateDisabled(date);

                    return (
                        <div
                            key={index}
                            className={`
                                ${styles.day} 
                                ${isSelected ? styles.selected : ''} 
                                ${isDisabled ? styles.disabled : ''}
                            `}
                            onClick={() => handleDateClick(date)}
                        >
                            {date.getDate()}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <button className={styles.resetBtn} onClick={handleReset}>Reset</button>
                <button className={styles.confirmBtn} onClick={onClose}>
                    <Check size={18} />
                </button>
            </div>
        </div>
    );
}
