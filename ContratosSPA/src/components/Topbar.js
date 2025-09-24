import React from 'react';

export default function Topbar({ title, right }) {
  return (
    <div className="app-topbar">
      <div className="app-topbar__inner">
        <div className="app-topbar__title">{title}</div>
        <div className="app-topbar__actions">
          {right}
        </div>
      </div>
    </div>
  );
}
