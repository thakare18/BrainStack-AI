import React from 'react';
import AuthIcon from './AuthIcon';

const features = [
  { icon: 'layers', title: 'Long-Term Memory', text: 'Vector memory keeps conversations useful over time.' },
  { icon: 'message', title: 'Persistent Conversations', text: 'Chats stay available so work can continue naturally.' },
  { icon: 'search', title: 'Vector Search', text: 'Relevant context is retrieved before AI responds.' },
  { icon: 'shield', title: 'Secure Authentication', text: 'JWT-backed access protects each account session.' },
];

const galaxyFeatures = [
  { icon: 'layers', label: 'Memory', className: 'memory' },
  { icon: 'message', label: 'Conversations', className: 'conversations' },
  { icon: 'search', label: 'Vector Search', className: 'search' },
  { icon: 'shield', label: 'Secure Access', className: 'secure' },
];

const BrandPanel = () => {
  return (
    <aside className="auth-brand-panel" aria-label="BrainStack AI overview">
      <div className="auth-brand-panel__content">
        <div className="auth-brand-mark">
          <span className="auth-brand-mark__logo">
            <AuthIcon name="brain" size={24} />
          </span>
          <span>BrainStack AI</span>
        </div>

        <div className="auth-brand-copy">
          <p className="auth-eyebrow">Private AI memory workspace</p>
          <h1>AI that remembers every conversation.</h1>
          <p>
            BrainStack keeps your conversations persistent, searchable, and context-aware
            so every answer can build on what came before.
          </p>
        </div>

        <div className="auth-feature-grid">
          {features.map((feature) => (
            <div className="auth-feature-card" key={feature.title}>
              <span>
                <AuthIcon name={feature.icon} size={19} />
              </span>
              <div>
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-orbit" aria-hidden="true">
        <div className="auth-orbit__glow" />
        <div className="auth-orbit__stars">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="auth-orbit__arc auth-orbit__arc--one" />
        <div className="auth-orbit__arc auth-orbit__arc--two" />
        <div className="auth-orbit__arc auth-orbit__arc--three" />
        <div className="auth-orbit__core" />
        <div className="auth-orbit__ring auth-orbit__ring--one" />
        <div className="auth-orbit__ring auth-orbit__ring--two" />
        {galaxyFeatures.map((feature) => (
          <div className={`auth-orbit__feature auth-orbit__feature--${feature.className}`} key={feature.label}>
            <AuthIcon name={feature.icon} size={16} />
            <span>{feature.label}</span>
          </div>
        ))}
        <div className="auth-orbit__node auth-orbit__node--one" />
        <div className="auth-orbit__node auth-orbit__node--two" />
        <div className="auth-orbit__node auth-orbit__node--three" />
        <div className="auth-orbit__node auth-orbit__node--four" />
      </div>
    </aside>
  );
};

export default BrandPanel;
