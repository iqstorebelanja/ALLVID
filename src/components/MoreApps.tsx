import React from 'react';
import { 
  X, ExternalLink, Download, Star, ShieldCheck, 
  Sparkles, Layers, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { 
  EcosystemApp, 
  getCrossPromoApps, 
  openAppDownload, 
  openAppWeb, 
  dismissMoreAppsFor24h 
} from '../config/apps';

interface MoreAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Crisp Brand SVGs for the ecosystem apps
export const AppIcon = ({ id, className = "w-6 h-6" }: { id: string; className?: string }) => {
  switch (id) {
    case 'ytsave':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'savetok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-6.62 6.33A6.34 6.34 0 0 0 10.05 22a6.34 6.34 0 0 0 6.32-6.33V9.06a8.16 8.16 0 0 0 4.94 1.66V7.27a4.8 4.8 0 0 1-1.72-.58z"/>
        </svg>
      );
    case 'reelssave':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.404-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'xsave':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    default:
      return <Layers className={className} />;
  }
};

/**
 * MoreApps Modal Popup
 * Triggered after 2nd successful download
 */
export const MoreApps: React.FC<MoreAppsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const apps = getCrossPromoApps('allvid');

  const handleDismiss = () => {
    dismissMoreAppsFor24h();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel-elevated rounded-2xl w-full max-w-lg p-5 sm:p-6 border border-white/[0.08] shadow-[0_16px_48px_0_rgba(0,0,0,0.8)] relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#00D1FF] font-bold">
                Ecosystem Suite
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              Explore Dedicated Pro Downloaders
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Specialized high-speed standalone apps for your favorite platforms.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Close for 24 hours"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Other Apps List */}
        <div className="space-y-3 pt-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="p-3.5 sm:p-4 rounded-xl glass-panel border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left: App Info */}
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-lg border border-white/10"
                  style={{ backgroundColor: `${app.color}25`, borderColor: `${app.color}40` }}
                >
                  <div style={{ color: app.color }}>
                    <AppIcon id={app.id} className="w-5 h-5" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00D1FF] transition-colors truncate">
                      {app.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                      {app.badge}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                    {app.tagline}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-1.5">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                      <span>{app.rating}</span>
                    </span>
                    <span>•</span>
                    <span>{app.downloads} users</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions (Download APK & Web Link) */}
              <div className="flex items-center gap-2 flex-shrink-0 sm:self-center pl-14 sm:pl-0">
                <button
                  onClick={() => openAppWeb(app.webUrl)}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Open Web Version"
                >
                  <span>Web</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </button>

                <button
                  onClick={() => openAppDownload(app.packageId)}
                  className="px-3.5 py-1.5 rounded-full bg-[#00D1FF] hover:bg-[#33DAFF] text-black text-xs font-extrabold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,209,255,0.25)] transition-all"
                  title="Download APK / Play Store"
                >
                  <Download className="w-3 h-3 stroke-[2.5]" />
                  <span>APK</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Dismiss / Persistence info */}
        <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Synced with ALLVID Pro Suite</span>
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-[#00D1FF] transition-colors"
          >
            Dismiss for 24h
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * MoreApps Footer Strip Component
 * Permanent footer at the bottom of the page showing other 3 apps
 */
export const MoreAppsFooter: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  const apps = getCrossPromoApps('allvid');

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.06] shadow-xl space-y-3.5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D1FF]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Ecosystem Dedicated Apps
            </span>
          </div>
          <button
            onClick={onOpenModal}
            className="text-xs font-mono text-[#00D1FF] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Apps horizontal tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {apps.map((app) => (
            <div
              key={app.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all flex items-center justify-between gap-2.5 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10"
                  style={{ backgroundColor: `${app.color}20`, borderColor: `${app.color}35`, color: app.color }}
                >
                  <AppIcon id={app.id} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00D1FF] transition-colors truncate">
                    {app.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono truncate">
                    {app.shortName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => openAppWeb(app.webUrl)}
                  className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition-all"
                  title={`Open ${app.name} Web`}
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => openAppDownload(app.packageId)}
                  className="px-2.5 py-1 rounded-lg bg-[#00D1FF]/15 hover:bg-[#00D1FF]/25 text-[#00D1FF] border border-[#00D1FF]/30 text-[11px] font-bold font-mono transition-all"
                  title={`Download ${app.name} APK`}
                >
                  APK
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
