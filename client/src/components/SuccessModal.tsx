import { Check } from "lucide-react";
import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseDuration?: number;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  autoCloseDuration = 5000 
}: SuccessModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [isOpen, autoCloseDuration, onClose]);

  const handleClose = () => {
    onClose();
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Inscrição Confirmada!
          </h2>
          
          <p className="text-gray-600 leading-relaxed">
            Obrigado por se inscrever na lista de espera do Level Cripto Pro. 
            Em breve você receberá mais informações sobre o curso.
          </p>

          <p className="text-sm text-gray-500">
            Verifique seu email para confirmar a inscrição.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow duration-200"
        >
          Fechar
        </button>

        {/* Auto-close hint */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Este popup fechará automaticamente em alguns segundos
        </p>
      </div>
    </div>
  );
}
