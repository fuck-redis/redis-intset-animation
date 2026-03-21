import React, { useState } from 'react';
import { Users } from 'lucide-react';
import './FloatingCommunity.css';

const FloatingCommunity: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="community-floating"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button type="button" className="community-bubble" aria-label="加入算法交流群">
        <Users size={18} />
        <span>交流群</span>
      </button>

      {open && (
        <div className="community-card">
          <p>微信扫码发送“leetcode”加入算法交流群</p>
          <img src="/assets/leetcode-group-qr.png" alt="算法交流群二维码" />
        </div>
      )}
    </div>
  );
};

export default FloatingCommunity;
