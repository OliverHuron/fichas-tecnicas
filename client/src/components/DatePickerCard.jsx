import { useState } from 'react';
import { IconChevronLeft, IconChevronRight } from './icons.jsx';
import './datePickerCard.css';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatShort(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function DatePickerCard({ label, selectedDates, onChange, time, onTimeChange, disabled }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    selectedDates.length ? Number(selectedDates[0].slice(0, 4)) : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDates.length ? Number(selectedDates[0].slice(5, 7)) - 1 : today.getMonth()
  );

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function toggleDay(day) {
    const key = toKey(viewYear, viewMonth, day);
    if (selectedDates.includes(key)) {
      onChange(selectedDates.filter((d) => d !== key));
    } else {
      onChange([...selectedDates, key].sort());
    }
  }

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className={`date-card${disabled ? ' date-card-disabled' : ''}`}>
      {label && <div className="date-card-label">{label}</div>}

      <div className="date-card-header">
        <button type="button" onClick={prevMonth} aria-label="Mes anterior" disabled={disabled}>
          <IconChevronLeft />
        </button>
        <div>
          {MESES[viewMonth]} {viewYear}
        </div>
        <button type="button" onClick={nextMonth} aria-label="Mes siguiente" disabled={disabled}>
          <IconChevronRight />
        </button>
      </div>

      <div className="date-card-weekdays">
        {DIAS_SEMANA.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="date-card-grid">
        {cells.map((day, i) => {
          if (day === null) return <span key={i} className="date-cell empty" />;
          const key = toKey(viewYear, viewMonth, day);
          const selected = selectedDates.includes(key);
          return (
            <button
              type="button"
              key={i}
              className={`date-cell${selected ? ' selected' : ''}`}
              onClick={() => toggleDay(day)}
              disabled={disabled}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="date-card-selected">
        {selectedDates.length > 0
          ? `${selectedDates.length === 1 ? 'Día' : 'Días'}: ${selectedDates.map(formatShort).join(', ')}`
          : 'Selecciona uno o varios días'}
      </div>

      <div className="date-card-time">
        <label htmlFor={`hora-${label}`}>Hora</label>
        <input
          id={`hora-${label}`}
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
