import { STATUS_META,  } from "../utils/userStatus";
import type {UserStatus} from '../types/allType'
interface Props {
  onSelect: (status: UserStatus) => void;
  onClose: () => void;
}

export default function StatusPicker({ onSelect, onClose }: Props) {
  return (
    <div className="absolute bottom-20 left-4 bg-black border border-gray-800 rounded-xl p-2 shadow-xl z-50 w-56">
      {Object.entries(STATUS_META).map(([key, meta]) => {
        const Icon = meta.icon;
        const gradientId = `status-gradient-${key}`;

        return (
          <button
            key={key}
            onClick={() => {
              onSelect(key as UserStatus);
              onClose();
            }}
            className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-800 rounded-lg transition"
          >
            {/* SAME GRADIENT ICON */}
            <svg width="20" height="20">
              <defs>
                <linearGradient
                  id={gradientId}
                  x1="0%"
                  y1="12%"
                  x2="100%"
                  y2="36%"
                >
                  <stop offset="50%" stopColor="#e69200" />
                  <stop offset="100%" stopColor="#f9d056" />
                </linearGradient>
              </defs>

              <Icon
                size={20}
                weight="fill"
                style={{ fill: `url(#${gradientId})` }}
              />
            </svg>

            <span className="text-sm">{meta.label}</span>
          </button>
        );
      })}

      <button
        onClick={() => {
          onSelect(null);
          onClose();
        }}
        className="w-full text-left px-3 py-2 mt-1 text-xs text-gray-400 hover:text-white"
      >
        Clear Status
      </button>
    </div>
  );
}