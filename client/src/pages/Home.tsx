import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import SuccessModal from "@/components/SuccessModal";

import {
  ArrowRight,
  X,
  Instagram,
  Youtube,
  Twitter,
  AlertCircle,
  Users,
  Headphones,
  ShieldCheck,
  FileText,
  CalendarDays,
  Lock,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function Home() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const testimonials = [
    {
      name: "loratsm",
      turma: "",
      avatar: "/images/dep-loratsm.png",
      text: "Parabéns pelo curso, muito top. entrei no Level Pro sem saber praticamente nada além de comprar, haha. O módulo q fala sobre autocustódia já valeu o curso inteiro pra mim. Hoje sei praticamente todas as áreas do mercado e até comecei a analisar alts por conta própria. Recomendo demais pra quem quer realmente aprender cripto de verdade na prática. Vlw"
    },
    {
      name: "Leonardo",
      turma: "",
      avatar: "/images/dep-leonardo.jpg",
      text: "Cara que aula inicial contextualizando toda a criação do BTC e Subprime foi essa, foda demais. Curso muito completo mesmo. Gostei, não fica só na teoria. Tem parte de como operar em corretora, análise gráfica, altcoins, DeFi... até mineração eu aprendi o básico. Sem falar na comunidade, que é top. Sempre tem alguém comentando oportunidades e se ajudando, bom pra quem está começando e também já tem conhecimento."
    },
    {
      name: "Elikaq22",
      turma: "",
      avatar: "/images/dep-elikaq22.jpg",
      text: "Eu já estava no mercado cripto há um tempo, mas percebi que não estava evoluindo. Aqui junto de vcs no Level Pro finalmente entendi várias coisas que ninguém explica direito: como surgiu o Bitcoin, como funcionam os ciclos do mercado e principalmente análise gráfica, agraço aos professores pela paciência e dedicação. Outro ponto que gostei muito foi a parte de airdrops e DeFi, que abriu minha cabeça para novas oportunidades. E a comunidade fechada ajuda muito, sempre tem gente trocando ideia e tirando dúvidas. Pra mim que estava sozinho nesse mercado foi um divisor de águas. Vocês são fera"
    },
    {
      name: "Carlos S.",
      turma: "",
      avatar: "/images/dep-carlosS.jpg",
      text: "Já fiz outros cursos de cripto antes, mas nenhum explicou tão bem a lógica do mercado e os ciclos. A parte de análise gráfica é muito clara e me ajudou demais nas minhas operações, aprendi a montar uma carteira equilibrada e administrar os meus ativos. Vlw pessoal 👊"
    },
    {
      name: "JuniorP",
      turma: "",
      avatar: "/images/dep-juniorP.png",
      text: "Irmão que treinão foi esse, kkkkk ... está valendo muito mais a pena do que uns cursos caros que tem por aí, conteúdo de primeira, informações valiosas. O Level Cripto Pro me ajudou muito, muito grato a vcs. Pra quem quer entrar no mundo cripto com o pé direito, vale muito a pena."
    }
  ];

  const testimonialSteps = isMobile ? testimonials.length : testimonials.length - 1;

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonialSteps);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonialSteps) % testimonialSteps);
  };
  // Data-alvo da próxima turma — altere esta data quando abrir nova turma
  const TARGET_DATE = new Date("2025-06-01T00:00:00");

  const calcTimeLeft = () => {
    const diff = Math.max(0, TARGET_DATE.getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isInternational = (value: string) => value.trimStart().startsWith('+');

  const formatPhone = (value: string) => {
    if (isInternational(value)) {
      // Internacional: permite + e dígitos, espaços, hífens — sem forçar máscara
      return value.replace(/[^\d+\s\-()]/g, '').slice(0, 20);
    }
    // Brasileiro: máscara (XX) 9XXXX-XXXX
    let numbers = value.replace(/\D/g, '');
    if (numbers.length > 11) numbers = numbers.slice(0, 11);
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const validatePhone = (phoneNumber: string) => {
    if (isInternational(phoneNumber)) {
      const digits = phoneNumber.replace(/\D/g, '');
      return digits.length >= 7 && digits.length <= 15;
    }
    const numbers = phoneNumber.replace(/\D/g, '');
    return numbers.length === 11 && numbers[2] === '9';
  };

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setPhoneError('');
  };

  const criarInscricao = trpc.inscricoes.criar.useMutation({
    onSuccess: (data: any) => {
      if (data?.isDuplicate) {
        // Email duplicado - mostrar mensagem amigavel sem popup de agradecimento
        setPhoneError('Email já inscrito. Obrigado pelo interesse!');
        // Reset form after 10 seconds
        setTimeout(() => {
          setName('');
          setEmail('');
          setPhone('');
          setPhoneError('');
        }, 10000);
      } else {
        setShowSuccessModal(true);
        setName('');
        setEmail('');
        setPhone('');
        setPhoneError('');
      }
    },
    onError: (error: any) => {
      let mensagemErro = 'Erro ao criar inscrição. Tente novamente.';
      
      // Extrair a mensagem do erro (pode estar em diferentes níveis)
      const errorMessage = error?.message || error?.data?.message || error?.cause?.message || JSON.stringify(error);
      const errorLower = errorMessage?.toLowerCase() || '';
      
      console.error('[Form Error] Full error:', error);
      console.error('[Form Error] Extracted message:', errorMessage);
      console.error('[Form Error] Lowercase:', errorLower);
      
      if (errorLower.includes('ja inscrito') || errorLower.includes('already exists') || errorLower.includes('duplicate')) {
        mensagemErro = 'Email já inscrito. Obrigado pelo interesse!';
      } else if (errorLower.includes('email')) {
        mensagemErro = 'Email inválido';
      } else if (errorLower.includes('telefone') || errorLower.includes('phone')) {
        mensagemErro = 'Telefone inválido';
      }
      setPhoneError(mensagemErro);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setPhoneError('Nome obrigatório');
      return;
    }
    if (!email) {
      setPhoneError('Email obrigatório');
      return;
    }
    if (!validateEmail(email)) {
      setPhoneError('Email inválido');
      return;
    }
    if (!phone) {
      setPhoneError('Telefone obrigatório');
      return;
    }
    if (!validatePhone(phone)) {
      setPhoneError(
        isInternational(phone)
          ? 'Telefone internacional inválido. Use o formato: +55 11 99999-9999'
          : 'Telefone inválido. Use o formato: (11) 99999-9999'
      );
      return;
    }
    criarInscricao.mutate({
      nome: name,
      email,
      telefone: phone,
    });
  };

  const faqItems: FAQItem[] = [
    {
      question: "Qual é o pré-requisito para fazer o curso?",
      answer:
        "Nenhum! O Level Cripto PRO foi desenvolvido do zero pensando em quem nunca teve contato com o mercado de criptoativos. Você não precisa ter conhecimento em finanças, tecnologia ou investimentos. Começamos pela criação do Bitcoin, explicamos como o mercado funciona e avançamos progressivamente até os temas mais complexos como DeFi, análise gráfica e airdrops. Se você tem vontade de aprender, está pronto para começar.",
    },
    {
      question: "Quanto tempo leva para completar o curso?",
      answer:
        "O curso é estruturado em 7 semanas de conteúdo, mas você estuda no seu próprio ritmo, sem prazo para terminar. Cada módulo leva entre 2 a 4 horas e foi pensado para caber na rotina de quem trabalha ou tem uma agenda cheia. Você acessa tudo quando quiser, quantas vezes precisar.",
    },
    {
      question: "O curso inclui suporte?",
      answer:
        "Sim! Além do conteúdo gravado, você entra para uma comunidade fechada e ativa onde pode tirar dúvidas, acompanhar análises e trocar experiências com outros alunos. O Renan participa diretamente da comunidade e as dúvidas são respondidas em até 24 horas. Você não vai estudar sozinho.",
    },
    {
      question: "Posso acessar o curso em qualquer dispositivo?",
      answer:
        "Sim! O curso é 100% online e funciona em qualquer dispositivo celular, tablet ou computador. Basta ter internet para acessar. Isso significa que você pode estudar no intervalo do trabalho, em casa ou onde estiver, sem depender de horário fixo.",
    },
    {
      question: "Há garantia de reembolso?",
      answer:
        "Sim. Você tem 7 dias de garantia total e incondicional. Se por qualquer motivo sentir que o curso não é para você, basta solicitar o reembolso dentro desse prazo e devolvemos 100% do seu investimento, sem burocracia e sem perguntas.",
    },
    {
      question: "O curso aborda airdrops?",
      answer:
        "Sim! Temos um módulo completo dedicado ao universo dos airdrops. Você vai aprender o que são, como identificar as melhores oportunidades, como fazer farm de forma estratégica e terá acesso a um mapa mental exclusivo com guias práticos para não perder nenhuma oportunidade relevante do mercado. É um dos módulos mais valorizados pelos alunos.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/95 backdrop-blur border-b border-blue-900/20 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                history.pushState(null, "", window.location.pathname);
              }}
              className="text-xl font-bold hover:text-blue-400 transition cursor-pointer"
            >
              Level Cripto PRO
            </button>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#beneficios" className="text-gray-300 hover:text-blue-900 transition">
              Benefícios
            </a>
            <a href="#conteudo" className="text-gray-300 hover:text-blue-900 transition">
              Conteúdo
            </a>
            <a href="#professor" className="text-gray-300 hover:text-blue-900 transition">
              Professor
            </a>
            <a href="#diferenciais" className="text-gray-300 hover:text-blue-900 transition">
              Diferenciais
            </a>
            <a href="#resultados" className="text-gray-300 hover:text-blue-900 transition">
              Resultados
            </a>
            <a href="#depoimentos" className="text-gray-300 hover:text-blue-900 transition">
              Depoimentos
            </a>
            <a href="#faq" className="text-gray-300 hover:text-blue-900 transition">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-48 px-4 md:px-8 bg-black relative overflow-hidden" style={{ backgroundImage: 'url(/images/hero-bg.png)', backgroundAttachment: 'fixed', backgroundPosition: 'center center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
        {/* Background Image - Parallax effect applied via CSS background-attachment: fixed */}
        {/* Overlay escuro para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" style={{ zIndex: 2 }}></div>
        {/* Renan Image - Removed temporarily */}
        <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-between gap-12 px-4 md:px-8" style={{}}>
          <div className="bg-black/60 backdrop-blur-md rounded-3xl p-8 md:p-12 border-2 border-white/10 shadow-2xl" style={{ marginTop: '-18px', marginBottom: '21px', width: '100%', maxWidth: '580px', height: 'auto', minHeight: 'auto' }}>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight uppercase">
                <span className="text-white">DOMINE O MERCADO DE</span><br />
                <span className="text-white">CRIPTOMOEDAS</span><br />
                <span className="text-blue-500">DO ZERO AO AVANÇADO</span>
              </h1>
              <p className="text-gray-300 mb-8 leading-relaxed text-base text-left">
                Aprenda análise de mercado, estratégias e oportunidades no mundo cripto, mesmo começando do zero.
              </p>
              
              <div className="space-y-3 mb-8 flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-blue-900 font-bold text-lg">✔</span>
                  <span className="text-gray-300 text-base">Estratégias usadas no mercado</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-900 font-bold text-lg">✔</span>
                  <span className="text-gray-300 text-base">Identificação de oportunidades</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-900 font-bold text-lg">✔</span>
                  <span className="text-gray-300 text-base">DeFi, Web3 e Airdrops</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-900 font-bold text-lg">✔</span>
                  <span className="text-gray-300 text-base">Comunidade ativa e suporte</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-900 font-bold text-lg">✔</span>
                  <span className="text-gray-300 text-base">Técnicas frequentes e conteúdos atualizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-900 font-bold text-lg">✔</span>
                  <span className="text-gray-300 text-base">Lives semanais com nossos professores</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-green-600 text-white font-black py-4 px-8 rounded-lg hover:bg-green-700 transition transform hover:scale-105 text-lg flex items-center justify-center gap-2"
              >
                ENTRAR NA LISTA DE ESPERA <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 justify-end">
            {/* Background image is the hero - no additional image needed */}
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-blue-900/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">INSCREVER-SE</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                required
              />
              <input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                required
              />
              <div>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999 ou +1 555 0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition ${
                    phoneError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-700 focus:border-green-500'
                  }`}
                  required
                />
                {phoneError && (
                  <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>{phoneError}</span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white font-black py-3 rounded-lg hover:bg-green-600 transition"
              >
                CONFIRMAR INSCRIÇÃO
              </button>
            </form>
          </div>
        </div>
      )}



      {/* Vagas Limitadas Section - Benefícios */}
      <section id="beneficios" className="py-20 px-4 md:px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="border border-blue-900/50 rounded-3xl p-8 md:p-12">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 border border-blue-500/60 rounded-full px-5 py-2">
              <Users size={14} className="text-blue-400" />
              <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Turmas com vagas limitadas</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white text-center leading-tight">
            Qualidade exige<br />
            <span className="text-blue-500">limite de alunos</span>
          </h2>

          {/* Description */}
          <p className="text-gray-400 mb-12 leading-relaxed text-center text-base max-w-2xl mx-auto">
            Cada turma é limitada para manter suporte próximo, networking qualificado
            e evolução consistente dos alunos.
          </p>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Card 1 */}
            <div className="flex items-start gap-4 bg-blue-950/30 border border-blue-900/40 rounded-2xl p-5 hover:border-blue-500/50 transition">
              <div className="flex-shrink-0 w-14 h-14 bg-blue-900/40 rounded-xl flex items-center justify-center">
                <Headphones size={26} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-black text-white mb-1 text-base">Acompanhamento próximo</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Suporte direto para dúvidas, estratégias e evolução dentro do mercado.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex items-start gap-4 bg-blue-950/30 border border-blue-900/40 rounded-2xl p-5 hover:border-blue-500/50 transition">
              <div className="flex-shrink-0 w-14 h-14 bg-blue-900/40 rounded-xl flex items-center justify-center">
                <Users size={26} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-black text-white mb-1 text-base">Comunidade qualificada</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Ambiente com alunos comprometidos, troca de experiências e networking real.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex items-start gap-4 bg-blue-950/30 border border-blue-900/40 rounded-2xl p-5 hover:border-blue-500/50 transition">
              <div className="flex-shrink-0 w-14 h-14 bg-blue-900/40 rounded-xl flex items-center justify-center">
                <ShieldCheck size={26} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-black text-white mb-1 text-base">Mentoria ativa</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Moderadores e mentores presentes para orientar decisões e corrigir rotas.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex items-start gap-4 bg-blue-950/30 border border-blue-900/40 rounded-2xl p-5 hover:border-blue-500/50 transition">
              <div className="flex-shrink-0 w-14 h-14 bg-blue-900/40 rounded-xl flex items-center justify-center">
                <FileText size={26} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-black text-white mb-1 text-base">Conteúdos e atualizações</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Bônus, análises e materiais atualizados conforme o mercado evolui.</p>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-blue-950/30 border border-blue-900/40 rounded-2xl px-8 py-6 text-center">
            <p className="text-gray-300 text-sm mb-5 flex items-center justify-center gap-2">
              <CalendarDays size={16} className="text-blue-400" />
              Entre agora e garanta acesso à <span className="text-white font-bold">próxima turma.</span>
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-green-500 text-black font-black py-4 px-8 rounded-xl hover:bg-green-400 transition transform hover:scale-105 text-lg flex items-center justify-center gap-3 mb-4"
            >
              QUERO ENTRAR PARA A PRÓXIMA TURMA
              <ArrowRight size={20} />
            </button>
            <p className="text-red-500 text-xs font-bold text-center">
              ● Poucas vagas restantes nesta turma
            </p>
          </div>

          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section id="cronometro" className="py-20 px-4 md:px-8 bg-gradient-to-b from-blue-700 via-blue-600 to-blue-500 relative overflow-visible mx-4 md:mx-8 rounded-3xl">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10 rounded-3xl">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex mb-6">
                <div className="inline-flex items-center gap-2 border-2 border-white rounded-full px-5 py-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span className="text-white font-black text-xs">INSCRIÇÕES ABERTAS</span>
                </div>
              </div>
              <h3 className="text-4xl md:text-5xl font-black mb-10 text-white">A primeira aula começa em</h3>
              
              <div className="grid grid-cols-2 gap-4 md:flex md:gap-6">
                <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-xl p-5 text-center">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Dias</p>
                </div>
                <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-xl p-5 text-center">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Horas</p>
                </div>
                <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-xl p-5 text-center">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Minutos</p>
                </div>
                <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-xl p-5 text-center">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Segundos</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex justify-center md:justify-end md:-mr-32 md:-mb-24 relative z-20">
              <img 
                src="/images/mockup-desktop.png"
                alt="Level Cripto PRO Desktop" 
                className="w-full h-auto" 
                style={{
                  width: '599px',
                  height: '333px',
                  marginTop: '-248px',
                  marginRight: '100px',
                  marginBottom: '47px',
                  marginLeft: '-7px',
                  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))'
                }}
              />
            </div>
          </div>
        </div>
      </section>



      {/* Conteúdo Section */}
      <section id="conteudo" className="py-20 px-4 md:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black mb-4 text-center">O QUE VOCÊ VAI APRENDER</h2>
          <p className="text-center text-gray-400 mb-16 text-lg">Conteúdo estruturado e prático para você dominar o mercado de criptomoedas</p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* MÓDULO 1 */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-48 bg-gradient-to-br from-blue-900/20 to-blue-900/5 flex items-center justify-center relative overflow-hidden">
                <img src="/images/MD_01.webp" alt="Módulo 1" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">

                <h3 className="text-xl font-black mb-4 text-white">Comunidade LEVEL PRO</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Tenha acesso à comunidade LEVEL PRO no Discord. Você não estuda sozinho. Ao entrar no curso, ganha acesso direto a uma comunidade ativa de traders e investidores cripto para tirar dúvidas, trocar análises e evoluir junto.
                </p>
              </div>
            </div>

            {/* MÓDULO 2 */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-48 bg-gradient-to-br from-blue-900/20 to-blue-900/5 flex items-center justify-center relative overflow-hidden">
                <img src="/images/MD_02.webp" alt="Módulo 2" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">

                <h3 className="text-xl font-black mb-4 text-white">Entenda o conceito por trás do surgimento do Bitcoin</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Antes de investir, entenda o porquê. Você vai compreender o contexto histórico e econômico que deu origem ao Bitcoin, e por que essa tecnologia mudou para sempre a relação do mundo com o dinheiro.
                </p>
              </div>
            </div>

            {/* MÓDULO 3 */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-48 bg-gradient-to-br from-blue-900/20 to-blue-900/5 flex items-center justify-center relative overflow-hidden">
                <img src="/images/MD_03.webp" alt="Módulo 3" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">

                <h3 className="text-xl font-black mb-4 text-white">Base Conceitual: Blockchain e Criptoativos</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Domine os conceitos que a maioria dos investidores ignora. De Bitcoin a Stablecoins, você vai entender como o ecossistema cripto funciona de verdade, e tomar decisões com base em conhecimento, não em achismo.
                </p>
              </div>
            </div>

            {/* MÓDULO 4 */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-48 bg-gradient-to-br from-blue-900/20 to-blue-900/5 flex items-center justify-center relative overflow-hidden">
                <img src="/images/MD_04.webp" alt="Módulo 4" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">

                <h3 className="text-xl font-black mb-4 text-white">AUTOCÚSTÓDIA</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Aprenda a ser o único dono dos seus ativos. Você vai entender como proteger suas criptomoedas fora das exchanges, eliminando o risco de perder tudo por falhas ou bloqueios de terceiros.
                </p>
              </div>
            </div>

            {/* MÓDULO 5 */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-48 bg-gradient-to-br from-blue-900/20 to-blue-900/5 flex items-center justify-center relative overflow-hidden">
                <img src="/images/MD_05.webp" alt="Módulo 5" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">

                <h3 className="text-xl font-black mb-4 text-white">Operação e Execução em Exchanges Centralizadas</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Do zero ao operacional em uma corretora profissional. Você vai criar sua conta, configurar a segurança, depositar, operar com diferentes tipos de ordem e sacar, sem depender de ninguém.
                </p>
              </div>
            </div>

            {/* MÓDULO 6 */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-48 bg-gradient-to-br from-blue-900/20 to-blue-900/5 flex items-center justify-center relative overflow-hidden">
                <img src="/images/MD_06.webp" alt="Módulo 6" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">

                <h3 className="text-xl font-black mb-4 text-white">Análise Técnica e Leitura Gráfica de Mercado</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Pare de comprar no topo e vender no fundo. Com 19 aulas, você vai desenvolver a habilidade de ler gráficos, identificar tendências e tomar decisões de entrada e saída com critério técnico.
                </p>
              </div>
            </div>

            {/* MÓDULO 7 */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-48 bg-gradient-to-br from-blue-900/20 to-blue-900/5 flex items-center justify-center relative overflow-hidden">
                <img src="/images/MD_07.webp" alt="Módulo 7" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">

                <h3 className="text-xl font-black mb-4 text-white">Gestão de Carteira e Controle de Risco e Ganância</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  O que separa quem lucra de quem perde no longo prazo é a gestão. Você vai aprender a montar uma carteira estratégica, controlar o risco por operação e manter a ganância sob controle.
                </p>
              </div>
            </div>

            {/* MÓDULO 8 */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-48 bg-gradient-to-br from-blue-900/20 to-blue-900/5 flex items-center justify-center relative overflow-hidden">
                <img src="/images/MD_08.webp" alt="Módulo 8" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">

                <h3 className="text-xl font-black mb-4 text-white">Finanças Descentralizadas, DeFi</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Descubra o sistema financeiro paralelo que nenhum banco controla. Você vai entender o que é DeFi, como ele funciona e quais as oportunidades disponíveis nesse ecossistema em expansão.
                </p>
              </div>
            </div>

            {/* MÓDULO 9 */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-48 bg-gradient-to-br from-blue-900/20 to-blue-900/5 flex items-center justify-center relative overflow-hidden">
                <img src="/images/MD_09.webp" alt="Módulo 9" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">

                <h3 className="text-xl font-black mb-4 text-white">Airdrop, Tudo para que você possa lucrar</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Aprenda a capturar valor onde a maioria nem sabe que existe. Você vai entender como funcionam os airdrops e como se posicionar estrategicamente para lucrar com distribuições gra tuítas de tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Professor Section */}
      <section id="professor" className="py-20 px-4 md:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <div className="inline-block mb-8 px-4 py-2 border border-blue-500 rounded-full">
            <span className="text-blue-500 font-black text-sm">■ QUEM ESTÁ POR TRÁS DA LEVEL CRIPTO</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column - Text Content */}
            <div>
              {/* Avatar and Name */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-white">Renan Mataveli</h3>
                <p className="text-gray-400 text-sm">No mercado de cripto desde 2017</p>
              </div>

              {/* Main Text Content */}
              <p className="text-gray-300 mb-6 leading-relaxed">
                Durante anos, dinheiro era algo que eu via passar pela minha mão sem entender pra onde ia. Ninguém me ensinou sobre isso, nem em casa, nem na escola. Aprendi sobre finanças da forma mais difícil: <strong>errando com o meu próprio bolso</strong>.
              </p>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Em 2017, enquanto a maioria torcia o nariz para o Bitcoin e chamava de pirâmide, eu decidi acreditar. Não foi fácil, família duvidando, amigos rindo, notícia negativa pra todo lado. Mas algo me dizia que aquilo era real. Estudei, errei, e fiquei. <strong>Nos momentos de maior descrença do mercado, quando todo mundo fugia, eu avançava</strong>.
              </p>

              {/* Quote */}
              <div className="border-l-4 border-blue-500 pl-6 py-4 mb-6 bg-gray-800/50 rounded">
                <p className="text-gray-300 italic">
                  "As maiores oportunidades aparecem exatamente quando ninguém quer olhar."
                </p>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Mas não foram só acertos. Em determinado momento, acreditei que o mercado repetiria os ciclos anteriores à risca e investi em projetos sem valor real por trás. Aprendi da forma mais cara possível que <strong>cripto exige critério, não apenas otimismo</strong>. Esse erro me tornou um analista muito melhor.
              </p>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Com estratégia, paciência e conhecimento, construí uma carteira que chegou a <strong>mais de 30x de rentabilidade</strong>. Não por sorte, por método.
              </p>

              <p className="text-gray-300 mb-8 leading-relaxed">
                Hoje sou fundador do <strong>Level Cripto</strong> e já formei mais de <strong>600 alunos</strong> que entraram nesse mercado sem saber nada e hoje operam com autonomia, segurança e estratégia real. <strong>Meu maior orgulho</strong> não é o que acumulei, é olhar para essa comunidade e saber que nenhum deles precisou errar sozinho como eu errei.
              </p>

              {/* Stats Cards - Inside Left Column */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 text-center">
                  <div className="text-2xl font-black text-blue-500 mb-1">+600</div>
                  <p className="text-gray-400 text-xs">Alunos formados</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 text-center">
                  <div className="text-2xl font-black text-blue-500 mb-1">+30x</div>
                  <p className="text-gray-400 text-xs">Rentabilidade <span className="block">(na carteira)</span></p>
                </div>
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 text-center">
                  <div className="text-2xl font-black text-blue-500 mb-2">desde 2017</div>
                  <p className="text-gray-400 text-xs">No mercado cripto</p>
                </div>
              </div>
            </div>

            {/* Right Column - Photo Space */}
            <div className="bg-gray-800 rounded-lg overflow-hidden h-96 md:h-full flex items-center justify-center">
              <img
                src="/images/foto-renan.webp"
                alt="Renan Mataveli"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>



      {/* Diferenciais Section */}
      <section id="diferenciais" className="py-20 px-4 md:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black mb-4 text-center">NOSSOS DIFERENCIAIS</h2>
          <p className="text-center text-gray-400 mb-16 text-lg">Ferramentas e estratégias exclusivas para dominar o mercado cripto</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Diferencial 1 - Mapa de Airdrops */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-64 bg-black flex items-center justify-center p-2">
                <img src="/images/diferencial-mapa-de-airdrops.png" alt="Mapa de Airdrops" className="h-full w-full object-contain" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black mb-4 text-blue-500">Mapa de Airdrops</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Acesso exclusivo ao mapa mental e estratégia completa de farm de airdrops. Identifique oportunidades lucrativos e organize suas participações de forma profissional.
                </p>
              </div>
            </div>

            {/* Diferencial 2 - Pontos de Compra/Venda */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-64 bg-black flex items-center justify-center p-2">
                <img src="/images/diferencial-compra-venda.png" alt="Acompanhamento para Pontos de Compra/Venda" className="h-full w-full object-contain" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black mb-4 text-blue-500">Acompanhamento para Pontos de Compra/Venda</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Análise técnica e fundamental de ativos selecionados a dedo. Identifique os melhores pontos de entrada e saída para maximizar seus lucros com operações de hold.
                </p>
              </div>
            </div>

            {/* Diferencial 3 - Suporte com Mentores */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group">
              <div className="h-64 bg-black flex items-center justify-center p-2">
                <img src="/images/diferencial-suporte-mentores.png" alt="Suporte com Mentores" className="h-full w-full object-contain" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black mb-4 text-blue-500">Suporte com Mentores</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Acompanhamento direto e personalizado dos mentores para tirar todas as suas dúvidas. Receba orientação em tempo real sobre estratégias, operações, psicologia e qualquer outro ponto do curso.
                </p>
              </div>
            </div>
          </div>

          {/* Segunda linha com 2 cards centralizados */}
          <div className="flex flex-col md:flex-row justify-center gap-8">
            {/* Diferencial 4 - Lives Semanais */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group md:w-1/3">
              <div className="h-64 bg-black flex items-center justify-center p-2">
                <img src="/images/diferencial-lives-semanais.png" alt="Lives Semanais" className="h-full w-full object-contain" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black mb-4 text-blue-500">Lives Semanais</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Três lives por semana ao vivo com os mentores: uma focada em airdrops, outra sobre análise do mercado em geral e uma terceira dedicada a gráficos e gerenciamento dos ativos de hold. Acompanhe análises em tempo real, tire dúvidas e fique sempre atualizado.
                </p>
              </div>
            </div>

            {/* Diferencial 5 - Relatórios Semanais */}
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-900 transition group md:w-1/3">
              <div className="h-64 bg-black flex items-center justify-center p-2">
                <img src="/images/diferencial-relatorio-semanal.png" alt="Relatórios Semanais" className="h-full w-full object-contain" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black mb-4 text-blue-500">Relatórios Semanais</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Receba análises detalhadas e relatórios exclusivos toda semana. Dados consolidados sobre mercado, tendências e oportunidades para você tomar decisões informadas e estratégicas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Resultados Section */}
      <section id="resultados" className="py-20 px-4 md:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black mb-12 text-center">RESULTADOS DA COMUNIDADE</h2>
          
          {/* Resultados de Trades */}
          <div className="mb-16">
            <div className="flex flex-col md:flex-row items-stretch gap-8 md:gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-12">
                  <svg width="64" height="64" viewBox="10 0 120 100" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <line x1="10" y1="75" x2="130" y2="75" stroke="#2d3650" strokeWidth="1"/>
                    <line x1="30" y1="20" x2="30" y2="85" stroke="#1DCA8F" strokeWidth="1.5"/>
                    <rect x="24" y="30" width="12" height="38" rx="2" fill="#1DCA8F"/>
                    <line x1="65" y1="15" x2="65" y2="80" stroke="#E2514A" strokeWidth="1.5"/>
                    <rect x="59" y="25" width="12" height="42" rx="2" fill="#E2514A"/>
                    <line x1="100" y1="5" x2="100" y2="75" stroke="#1DCA8F" strokeWidth="1.5"/>
                    <rect x="94" y="13" width="12" height="44" rx="2" fill="#1DCA8F"/>
                    <path d="M24 65 L59 58 L94 45" fill="none" stroke="#1DCA8F" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6"/>
                    <polygon points="100,0 106,14 94,14" fill="#1DCA8F"/>
                  </svg>
                  <h3 className="text-4xl font-black text-white leading-none">Resultados de Trades</h3>
                </div>
                <p className="text-white text-lg mb-8 leading-relaxed font-semibold">
                  Nossos alunos aplicam as estratégias ensinadas no curso e conseguem resultados consistentes no mercado. Alguns destaques:
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="text-blue-400 font-black text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-200 text-base leading-relaxed">Alunos que dobraram seu capital em 3 meses com estratégias de swing trading</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-blue-400 font-black text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-200 text-base leading-relaxed">Comunidade que compartilha análises técnicas e oportunidades diárias</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-blue-400 font-black text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-200 text-base leading-relaxed">Suporte 24h para ajudar em dúvidas sobre posições e estratégias</span>
                  </li>
                </ul>
              </div>
              <video autoPlay muted loop className="rounded-lg w-full md:w-[600px] md:flex-shrink-0" style={{height: 'auto', aspectRatio: '16/9'}}>

                <source src="/videos/resultado-trader.mov" type="video/mp4" />
                Seu navegador nao suporta o elemento de video.
              </video>
            </div>
          </div>

          {/* Resultados de Airdrops */}
          <div>
            <div className="flex items-center gap-4 mb-12">
              <svg width="64" height="64" viewBox="440 55 120 115" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M500 65 Q460 65 455 100 Q460 105 500 108 Q540 105 545 100 Q540 65 500 65Z" fill="#7C3AED" opacity="0.25" stroke="#7C3AED" strokeWidth="2"/>
                <line x1="460" y1="100" x2="490" y2="135" stroke="#7C3AED" strokeWidth="1.5" opacity="0.8"/>
                <line x1="478" y1="107" x2="492" y2="135" stroke="#7C3AED" strokeWidth="1.5" opacity="0.8"/>
                <line x1="522" y1="107" x2="508" y2="135" stroke="#7C3AED" strokeWidth="1.5" opacity="0.8"/>
                <line x1="540" y1="100" x2="510" y2="135" stroke="#7C3AED" strokeWidth="1.5" opacity="0.8"/>
                <rect x="487" y="135" width="26" height="20" rx="4" fill="#7C3AED"/>
                <text x="500" y="149" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#fff">$</text>
                <circle cx="462" cy="150" r="8" fill="none" stroke="#F59E0B" strokeWidth="1.5"/>
                <text x="462" y="154" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#F59E0B">$</text>
                <circle cx="540" cy="145" r="8" fill="none" stroke="#F59E0B" strokeWidth="1.5"/>
                <text x="540" y="149" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#F59E0B">$</text>
              </svg>
              <h3 className="text-4xl font-black text-white leading-none">Resultados de Airdrops</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <p className="text-white text-lg mb-8 leading-relaxed font-semibold">
                  Com o mapa mental e as estratégias de farm de airdrops ensinadas no curso, nossos alunos conseguem identificar e participar de airdrops lucrativos:
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="text-blue-400 font-black text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-200 text-base leading-relaxed">Alunos que ganharam mais de $5.000 em airdrops em 2 meses</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-blue-400 font-black text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-200 text-base leading-relaxed">Mapa mental exclusivo para organizar e priorizar airdrops</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-blue-400 font-black text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-200 text-base leading-relaxed">Comunidade que compartilha oportunidades de airdrops em tempo real</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center min-h-64">
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Vídeo dos Resultados de Airdrops</p>
                  <div className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">▶️</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">(em breve)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Depoimentos Section */}
      <section id="depoimentos" className="py-24 px-4 md:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black mb-4 text-center text-white">O QUE DIZEM NOSSOS ALUNOS</h2>
          <p className="text-center text-gray-400 mb-16 text-lg">Depoimentos autênticos de alunos que transformaram suas vidas com o Level Cripto PRO</p>
          
          <div className="relative">
            {/* Carousel */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentTestimonialIndex * (isMobile ? 100 : 50)}%)`
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full md:w-1/2 flex-shrink-0 px-4">
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full hover:border-gray-300 transition">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-2xl border border-gray-300 overflow-hidden">
                          {testimonial.avatar.startsWith('http') || testimonial.avatar.startsWith('/') ? (
                            <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                          ) : (
                            testimonial.avatar
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-black text-lg">{testimonial.name}</h3>
                          <p className="text-sm text-blue-500 font-bold">{testimonial.turma}</p>
                        </div>
                      </div>
                      <p className="text-black leading-relaxed text-sm">
                        "{testimonial.text}"
                      </p>
                      <div className="flex gap-1 mt-6">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-blue-500">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-12 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-900/60 text-white rounded-full w-12 h-12 flex items-center justify-center transition"
            >
              ←
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-12 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-900/60 text-white rounded-full w-12 h-12 flex items-center justify-center transition"
            >
              →
            </button>
            
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(testimonialSteps)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonialIndex(i)}
                  className={`w-2 h-2 rounded-full transition ${
                    i === currentTestimonialIndex ? 'bg-blue-900' : 'bg-blue-900/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 md:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black mb-4 text-center">PERGUNTAS FREQUENTES</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Tire suas dúvidas sobre o curso Level Cripto PRO</p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* CTA Section */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-2 border-blue-900/40 rounded-2xl p-10 flex flex-col justify-center h-full hover:border-blue-900/60 transition">
              <h3 className="text-3xl font-black mb-6 text-white">Fale com nosso time</h3>
              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                Fale com um dos nossos consultores e tire todas as suas dúvidas sobre o Level Cripto PRO
              </p>
              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white font-black py-4 px-8 rounded-xl hover:from-green-700 hover:to-green-600 transition w-full mb-6 border border-green-600/60 transform hover:scale-105">
                FALE COM NOSSO WHATSAPP
              </button>
              <p className="text-xs text-blue-400 text-center font-bold">
                ⏱️ Responderemos em até 2 horas
              </p>
            </div>

            {/* FAQ Items */}
            <div className="max-h-[600px] overflow-y-auto">
              {/* Badge */}
              <div className="flex mb-6">
                <div className="inline-flex items-center gap-2 border-2 border-blue-500 rounded-full px-5 py-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-blue-500 font-black text-xs">DÚVIDAS FREQUENTES</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black mb-6 text-white">
                Tem alguma <span className="text-blue-500">dúvida?</span>
              </h3>

              {/* FAQ Items */}
              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-2 border-blue-900/40 rounded-xl overflow-hidden hover:border-blue-900/80 transition"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                      className="w-full px-6 py-4 flex justify-between items-center hover:bg-blue-900/10 transition font-semibold text-white text-left"
                    >
                      <span className="text-sm">{item.question}</span>
                      <div className="w-8 h-8 flex items-center justify-center border-2 border-blue-500 rounded-full flex-shrink-0 ml-3">
                        <span className={`text-blue-500 text-lg font-bold transition-transform ${
                          expandedFAQ === idx ? "rotate-45" : ""
                        }`}>+</span>
                      </div>
                    </button>
                    {expandedFAQ === idx && (
                      <div className="px-6 py-3 bg-blue-900/10 border-t-2 border-blue-900/50 text-gray-300 text-xs leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTOS E PARTICIPAÇÃO ESPECIAL Section */}
      <section className="py-20 px-4 md:px-8 bg-black">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-900/20 via-black to-black border-2 border-blue-900/40 rounded-3xl p-6 md:p-12 lg:p-16">
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-black mb-8 md:mb-12 text-center text-white">EVENTOS E PARTICIPAÇÃO ESPECIAL</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Event Card 1 */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-2 border-blue-900/40 rounded-2xl p-5 md:p-8 hover:border-blue-900/60 transition">
              <video className="h-64 md:h-72 lg:h-80 bg-blue-900/20 rounded-xl mb-6 w-full object-cover" autoPlay muted loop controls>
                <source src="/videos/video-solana-breakpoint.mov" type="video/mp4" />
                Seu navegador não suporta vídeo HTML5.
              </video>
              <h3 className="text-xl font-black text-blue-400 mb-3">Solana Breakpoint Abu Dhabi</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Participacao especial no Evento Solana Breakpoint Abu Dhabi, realizado em 2025.
              </p>
              <p className="text-xs text-blue-400 font-bold">2025</p>
            </div>

            {/* Event Card 2 */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-2 border-blue-900/40 rounded-2xl p-5 md:p-8 hover:border-blue-900/60 transition">
              <img src="/images/evento-EBC25.webp" alt="EBC25 Ambassador" className="h-64 md:h-72 lg:h-80 rounded-xl mb-6 w-full object-cover object-center" />
              <h3 className="text-xl font-black text-blue-400 mb-3">European Blockchain Convention</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Embaixador do European Blockchain Convention 2025 em Barcelona.
              </p>
              <p className="text-xs text-blue-400 font-bold">Barcelona 16-17 OCT 2025</p>
            </div>

            {/* Event Card 3 */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-2 border-blue-900/40 rounded-2xl p-5 md:p-8 hover:border-blue-900/60 transition">
              <img src="/images/evento-mba-trevisan.webp" alt="MBA em Criptoativos" className="h-64 md:h-72 lg:h-80 rounded-xl mb-6 w-full object-cover object-center" />
              <h3 className="text-xl font-black text-blue-400 mb-3">MBA em Criptoativos - Trevisan</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Docente do MBA em Criptoativos pela Trevisan. Disciplinas: Análise Fundamentalista e Técnica.
              </p>
              <p className="text-xs text-blue-400 font-bold">27/01/2026 - Docente</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pronto para começar */}
      <section className="py-20 px-4 md:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center bg-gradient-to-r from-blue-900/20 to-blue-900/10 border-2 border-blue-900/40 rounded-2xl p-12">
            <h3 className="text-3xl font-black text-white mb-4">Pronto para começar?</h3>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Se chegou até aqui, tenho certeza que você está pronto para fazer parte desta comunidade de elite.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white font-black py-4 px-8 rounded-xl hover:from-green-700 hover:to-green-800 transition transform hover:scale-105 text-base flex items-center justify-center gap-2 mx-auto border border-green-500/60"
            >
              GARANTIR MINHA VAGA <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-blue-900/20 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div className="flex flex-col max-w-md">
              <h3 className="font-black mb-4 text-lg">Level Cripto PRO</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Aprenda criptomoedas com os melhores profissionais do mercado.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <h4 className="font-black mb-4 text-lg">Redes Sociais</h4>
              <div className="flex gap-4">
                <a href="https://instagram.com/level_cripto" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-900 transition">
                  <Instagram size={24} />
                </a>
                <a href="https://youtube.com/@levelcripto" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-900 transition">
                  <Youtube size={24} />
                </a>
                <a href="https://x.com/LevelCripto" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-900 transition">
                  <Twitter size={24} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Level Cripto PRO. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
      
      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        autoCloseDuration={5000}
      />
    </div>
  );
}
