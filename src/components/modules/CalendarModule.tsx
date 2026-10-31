import React, { useState, useEffect } from 'react';
import './calendar.css';
import { fetchCountryHolidays, COUNTRIES } from '../../utils/holidays';

interface CalendarModuleProps {
  countryCode?: string;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({
  countryCode = 'IN'
}) => {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [holidays, setHolidays] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Live ticking working clock updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  useEffect(() => {
    let active = true;
    fetchCountryHolidays(countryCode, year).then((map) => {
      if (active) {
        setHolidays(map);
      }
    });
    return () => {
      active = false;
    };
  }, [countryCode, year]);

  const countryName = COUNTRIES.find((c) => c.code === countryCode)?.name || countryCode;

  const getDayKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const handleToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDay(now.getDate());
  };

  const selectedKey = getDayKey(selectedDay);
  const selectedHoliday = holidays[selectedKey];

  return (
    <div
      className="dexter-calendar-card"
      style={{ '--status': `"${year}"` } as React.CSSProperties}
    >
      <div className="corner c1" />
      <div className="corner c2" />

      {/* Header with Month Navigation */}
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--txt-sec)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 800,
              padding: '0 4px',
              borderRadius: '4px',
              lineHeight: 1
            }}
            title="Previous month"
          >
            ‹
          </button>
          <span className="header-title" style={{ minWidth: '68px', textAlign: 'center' }}>
            {monthNames[month]}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--txt-sec)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 800,
              padding: '0 4px',
              borderRadius: '4px',
              lineHeight: 1
            }}
            title="Next month"
          >
            ›
          </button>

          {!isCurrentMonth && (
            <button
              type="button"
              onClick={handleToday}
              style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: '6px',
                background: 'var(--border-col)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                marginLeft: '2px'
              }}
              title="Return to today"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Body: 7-column Calendar Grid */}
      <div className="body">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="day-header">{d}</div>
        ))}

        {/* Leading blanks */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`blank-${i}`} style={{ height: '24px' }} />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = isCurrentMonth && dayNum === today.getDate();
          const dayKey = getDayKey(dayNum);
          const holidayName = holidays[dayKey];
          const isHoliday = !!holidayName;
          const isSelected = dayNum === selectedDay;

          return (
            <div
              key={dayNum}
              className={`date-cell ${isToday ? 'today' : ''} ${isHoliday ? 'holiday' : ''} ${isSelected && !isToday ? 'selected' : ''}`}
              onClick={() => setSelectedDay(dayNum)}
              title={holidayName ? `🎉 ${holidayName} (${countryName})` : undefined}
              style={{
                position: 'relative',
                fontWeight: isHoliday || isToday ? 700 : undefined,
                color: isHoliday && !isToday ? '#ef4444' : undefined,
                background: isSelected && !isToday ? 'var(--bg-surface-hover, rgba(255,255,255,0.12))' : undefined,
                border: isSelected && !isToday ? '1px solid var(--border-col)' : undefined
              }}
            >
              {dayNum}
              {isHoliday && !isToday && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    width: '3.5px',
                    height: '3.5px',
                    borderRadius: '50%',
                    background: '#ef4444'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Event / Live Working Time Entry */}
      <div className="footer">
        <div className="event-entry">
          <span
            style={{
              fontWeight: 600,
              color: selectedHoliday ? '#f7414a' : 'var(--txt)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '170px'
            }}
            title={selectedHoliday ? `${selectedHoliday} (${countryName})` : (isCurrentMonth && selectedDay === today.getDate()) ? "Today's Schedule" : `Day ${selectedDay}: Schedule Clear`}
          >
            {selectedHoliday ? `🎉 ${selectedHoliday}` : (isCurrentMonth && selectedDay === today.getDate()) ? "Today's Schedule" : `Day ${selectedDay}: Schedule Clear`}
          </span>
          <span
            style={{
              color: '#f7414a',
              fontWeight: 700,
              fontSize: '10.5px',
              whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums'
            }}
            title="Live Working Time"
          >
            {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalendarModule;
