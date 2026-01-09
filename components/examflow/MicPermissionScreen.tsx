import React from 'react';

interface MicPermissionScreenProps {
  onEnableMicrophone: () => void;
  onCancel: () => void;
}

const MicPermissionScreen: React.FC<MicPermissionScreenProps> = ({
  onEnableMicrophone,
  onCancel,
}) => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-zinc-100/50">
        <div className="w-24 h-24 bg-[#ff7300]/5 text-[#ff7300] rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">
          <span className="animate-pulse">🎙️</span>
        </div>
        <h2 className="text-3xl font-black mb-4 text-[#222222]">Microphone Required</h2>
        <p className="text-zinc-500 mb-10 font-medium leading-relaxed">
          To simulate a real CEFR speaking exam, we need permission to capture your voice responses.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={onEnableMicrophone}
            className="w-full bg-[#ff7300] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#e66700] transition-all transform active:scale-[0.98] shadow-[0_10px_30px_rgba(255,115,0,0.3)]">
            Enable Microphone
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-zinc-100 text-[#555555] py-4 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-all active:scale-[0.98]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicPermissionScreen;
