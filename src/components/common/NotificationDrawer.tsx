import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  X, 
  CheckCheck, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ExternalLink 
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDelivery?: (deliveryId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectDelivery
}) => {
  const { notifications, markNotificationsRead } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-white text-base">Platform Activity & Alerts</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => markNotificationsRead()}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 p-1 rounded"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No recent notifications
            </div>
          ) : (
            notifications.map(n => {
              const getIcon = () => {
                switch (n.type) {
                  case 'success':
                    return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                  case 'warning':
                    return <AlertCircle className="w-4 h-4 text-amber-400" />;
                  case 'error':
                    return <AlertCircle className="w-4 h-4 text-red-400" />;
                  default:
                    return <Info className="w-4 h-4 text-blue-400" />;
                }
              };

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition ${
                    n.read
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                      : 'bg-slate-800/60 border-brand-500/40 text-white shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">{getIcon()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold">{n.title}</h4>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                      
                      {n.deliveryId && onSelectDelivery && (
                        <button
                          onClick={() => {
                            onSelectDelivery(n.deliveryId!);
                            onClose();
                          }}
                          className="mt-2 text-[11px] text-brand-400 hover:text-brand-300 flex items-center space-x-1 font-medium"
                        >
                          <span>View Consignment ({n.deliveryId})</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
